import { GitHubClient } from "../sources/GitHubClient.js";
import { MicrosoftLearnClient } from "../sources/MicrosoftLearnClient.js";
import { logger } from "./Logger.js";
import path from "path";
import os from "os";

const GLOBAL_MCP_DIR = path.join(os.homedir(), ".commerce-engineering-mcp");

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "BLOCKED";

export interface VerificationSource {
  name: "GitHub" | "MicrosoftLearn" | "KnownPattern";
  found: boolean;
  url?: string;
  retrievedAt: string;
}

export interface GuardResult {
  confidence: ConfidenceLevel;
  verified: boolean;
  sources: VerificationSource[];
  message?: string;
  alternative?: string;
  blocked: boolean;
}

// Known interfaces and classes that are officially documented in the Commerce SDK.
// These are used as a fast-path verification before hitting the network.
// Source: https://github.com/microsoft/Dynamics365Commerce.Solutions
const KNOWN_OFFICIAL_SYMBOLS: Record<string, { area: string; docsUrl: string }> = {
  // POS Triggers
  IPreTrigger: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-trigger-printing" },
  IPostTrigger: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-trigger-printing" },
  ICancelTrigger: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-trigger-printing" },
  IApplicationTrigger: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-trigger-printing" },
  // POS Operations
  IOperationHandler: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-operations" },
  OperationHandlerBase: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-operations" },
  // POS Views
  CustomViewControllerBase: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-view-extension" },
  ICustomViewControllerContext: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-view-extension" },
  // POS Dialogs
  ShowDialogClientRequest: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/knockout-pos-extension" },
  DialogBase: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/knockout-pos-extension" },
  // POS Controls
  CustomControl: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-control" },
  ICustomControl: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-control" },
  // POS Request/Response
  ClientRequest: { area: "POS", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension-overview" },
  // CRT
  IRequestHandlerAsync: { area: "CRT", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility" },
  INamedRequestHandler: { area: "CRT", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility" },
  SingleAsyncRequestHandler: { area: "CRT", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility" },
  ICommerceRuntime: { area: "CRT", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility" },
  // Retail Server
  IController: { area: "RetailServer", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility" },
  CommerceController: { area: "RetailServer", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility" },
  // Hardware Station
  IHardwareStationController: { area: "HardwareStation", docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension" },
};

// Symbols that are NOT valid in current Commerce SDK (deprecated or non-existent).
const DEPRECATED_OR_INVALID: Record<string, string> = {
  PosExtensionModule: "POS extensions no longer use Angular modules. Use manifest.json registration instead.",
  NgModule: "Angular NgModule is not used in Store Commerce extensions. Use the Commerce SDK extension model.",
  IExtensionCommandBarButton: "This interface was removed. Use CommandBar extension in manifest.json.",
  RetailProxy: "RetailProxy is deprecated. Use the Retail Server API directly via IContext.",
  CommerceProxyRequest: "Use the official Retail Server extension model instead of CommerceProxyRequest.",
};

export class AntiHallucinationGuard {
  private readonly github: GitHubClient;
  private readonly learn: MicrosoftLearnClient;

  constructor(mcpDir?: string) {
    this.github = new GitHubClient();
    this.learn = new MicrosoftLearnClient(mcpDir ?? GLOBAL_MCP_DIR);
  }

  // Verifies a symbol (class, interface, method) exists in official sources.
  async verifySymbol(
    symbol: string,
    branch: string,
    options: { requireDocsMatch?: boolean } = {}
  ): Promise<GuardResult> {
    const sources: VerificationSource[] = [];
    const now = new Date().toISOString();

    // ── Fast path: known symbol table ─────────────────────────────────────────
    const knownSymbol = KNOWN_OFFICIAL_SYMBOLS[symbol];
    if (knownSymbol) {
      sources.push({
        name: "KnownPattern",
        found: true,
        url: knownSymbol.docsUrl,
        retrievedAt: now,
      });
      logger.debug({ symbol }, "Symbol verified via known pattern table");
      return {
        confidence: "HIGH",
        verified: true,
        sources,
        blocked: false,
      };
    }

    // ── Check deprecated table ────────────────────────────────────────────────
    const deprecatedReason = DEPRECATED_OR_INVALID[symbol];
    if (deprecatedReason) {
      sources.push({ name: "KnownPattern", found: false, retrievedAt: now });
      return {
        confidence: "BLOCKED",
        verified: false,
        sources,
        message: `'${symbol}' is deprecated or not valid in the current Commerce SDK.`,
        alternative: deprecatedReason,
        blocked: true,
      };
    }

    // ── Network verification: GitHub + MS Learn in parallel ──────────────────
    const [githubFound, learnResults] = await Promise.all([
      this.searchGitHub(symbol, branch, now, sources),
      this.searchLearn(symbol, now, sources),
    ]);

    // ── Compute confidence ────────────────────────────────────────────────────
    const confidence = this.computeConfidence(githubFound, learnResults > 0);

    if (confidence === "BLOCKED") {
      return {
        confidence,
        verified: false,
        sources,
        message:
          `'${symbol}' could not be verified in any official source ` +
          `(GitHub SDK branch '${branch}' or Microsoft Learn). ` +
          `Do not use this symbol — it may not exist in the Commerce SDK.`,
        blocked: true,
      };
    }

    return {
      confidence,
      verified: true,
      sources,
      blocked: false,
    };
  }

  // Verifies a complete implementation approach (multiple symbols).
  async verifyApproach(
    symbols: string[],
    branch: string
  ): Promise<{ overall: ConfidenceLevel; perSymbol: Record<string, GuardResult> }> {
    const results = await Promise.all(
      symbols.map(async (s) => ({ symbol: s, result: await this.verifySymbol(s, branch) }))
    );

    const perSymbol: Record<string, GuardResult> = {};
    for (const { symbol, result } of results) {
      perSymbol[symbol] = result;
    }

    // Overall confidence is the lowest confidence across all symbols
    const levels: ConfidenceLevel[] = ["HIGH", "MEDIUM", "LOW", "BLOCKED"];
    let lowestIdx = 0;
    for (const { result } of results) {
      const idx = levels.indexOf(result.confidence);
      if (idx > lowestIdx) lowestIdx = idx;
    }

    return { overall: levels[lowestIdx] ?? "BLOCKED", perSymbol };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async searchGitHub(
    symbol: string,
    branch: string,
    now: string,
    sources: VerificationSource[]
  ): Promise<boolean> {
    if (!this.github.hasToken()) {
      // Without token we can only do tree listing — mark as unverified via GitHub
      sources.push({ name: "GitHub", found: false, retrievedAt: now });
      return false;
    }

    try {
      const results = await this.github.searchCode(symbol, branch, { maxResults: 3 });
      const found = results.length > 0;
      sources.push({
        name: "GitHub",
        found,
        url: found ? results[0]?.htmlUrl : undefined,
        retrievedAt: now,
      });
      return found;
    } catch {
      sources.push({ name: "GitHub", found: false, retrievedAt: now });
      return false;
    }
  }

  private async searchLearn(
    symbol: string,
    now: string,
    sources: VerificationSource[]
  ): Promise<number> {
    try {
      const results = await this.learn.search(symbol, { maxResults: 3 });
      const found = results.length > 0;
      sources.push({
        name: "MicrosoftLearn",
        found,
        url: found ? results[0]?.url : undefined,
        retrievedAt: now,
      });
      return results.length;
    } catch {
      sources.push({ name: "MicrosoftLearn", found: false, retrievedAt: now });
      return 0;
    }
  }

  private computeConfidence(
    foundInGitHub: boolean,
    foundInLearn: boolean
  ): ConfidenceLevel {
    if (foundInGitHub && foundInLearn) return "HIGH";
    if (foundInGitHub) return "HIGH";    // GitHub SDK is authoritative
    if (foundInLearn) return "MEDIUM";
    if (!this.github.hasToken()) return "LOW"; // Can't verify via code search
    return "BLOCKED";
  }
}
