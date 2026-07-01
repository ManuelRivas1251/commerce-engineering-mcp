import { AntiHallucinationGuard, type GuardResult } from "./AntiHallucinationGuard.js";
import { IndexManager } from "./IndexManager.js";
import { GitHubClient } from "../sources/GitHubClient.js";
import { MicrosoftLearnClient } from "../sources/MicrosoftLearnClient.js";
import type { CommerceArea, CommerceArtifactType } from "../types/commerce.js";
import { logger } from "./Logger.js";
import path from "path";
import os from "os";

const GLOBAL_MCP_DIR = path.join(os.homedir(), ".commerce-engineering-mcp");

// The 7 validation conditions that must pass before code generation is allowed.
export interface ValidationCondition {
  id: number;
  label: string;
  passed: boolean;
  detail: string;
  sourceUrl?: string;
}

export interface PatternValidationResult {
  // Overall verdict
  approved: boolean;
  blocked: boolean;

  // What we validated
  pattern: string;
  commerceArea: CommerceArea;
  artifactType: CommerceArtifactType;
  version: string;
  branch: string;

  // 7-condition checklist
  conditions: ValidationCondition[];

  // Anti-hallucination guard result
  guard: GuardResult;

  // If blocked: why + what to use instead
  blockReason?: string;
  alternative?: string;

  // Source citations (always present)
  sources: { name: string; url: string; retrievedAt: string }[];
}

// Known alternative patterns when a deprecated/wrong approach is detected.
const PATTERN_ALTERNATIVES: Record<string, string> = {
  "POS:IPreTrigger:Operation": "Use IPreTrigger for operation-bound pre-triggers. Map the trigger to the correct operationId in manifest.json.",
  "POS:IPostTrigger:Operation": "Use IPostTrigger for operation-bound post-triggers. Map the trigger to the correct operationId in manifest.json.",
  "CRT:IRequestHandlerAsync:CRTService": "Implement IRequestHandlerAsync and INamedRequestHandler. Register in CommerceRuntime.Ext.config.",
  "RetailServer:IController:RetailServerAPI": "Extend CommerceController and register the controller in the Retail Server extension project.",
};

export class PatternValidatorCore {
  private readonly guard: AntiHallucinationGuard;
  private readonly github: GitHubClient;
  private readonly learn: MicrosoftLearnClient;

  constructor(mcpDir?: string) {
    const dir = mcpDir ?? GLOBAL_MCP_DIR;
    this.guard = new AntiHallucinationGuard(dir);
    this.github = new GitHubClient();
    this.learn = new MicrosoftLearnClient(dir);
  }

  async validate(
    pattern: string,
    commerceArea: CommerceArea,
    artifactType: CommerceArtifactType,
    branch: string,
    version: string,
    workspacePath?: string
  ): Promise<PatternValidationResult> {
    logger.info({ pattern, commerceArea, artifactType, branch }, "Validating pattern");

    const conditions: ValidationCondition[] = [];
    const allSources: { name: string; url: string; retrievedAt: string }[] = [];
    const now = new Date().toISOString();

    // ── Condition 1: Official API exists ──────────────────────────────────────
    const guardResult = await this.guard.verifySymbol(pattern, branch);

    for (const src of guardResult.sources) {
      if (src.found && src.url) {
        allSources.push({ name: src.name, url: src.url, retrievedAt: src.retrievedAt });
      }
    }

    conditions.push({
      id: 1,
      label: "Official API / interface exists",
      passed: guardResult.verified,
      detail: guardResult.verified
        ? `'${pattern}' verified in official sources`
        : `'${pattern}' NOT found in official sources`,
      sourceUrl: allSources[0]?.url,
    });

    // If BLOCKED at condition 1, stop immediately — no point checking further
    if (guardResult.blocked) {
      return {
        approved: false,
        blocked: true,
        pattern,
        commerceArea,
        artifactType,
        version,
        branch,
        conditions: this.fillRemainingConditions(conditions, 7),
        guard: guardResult,
        blockReason: guardResult.message,
        alternative: guardResult.alternative,
        sources: allSources,
      };
    }

    // ── Condition 2: Area matches the pattern ─────────────────────────────────
    const areaMatch = this.validateAreaMatch(pattern, commerceArea);
    conditions.push({
      id: 2,
      label: "Pattern is valid for the specified Commerce area",
      passed: areaMatch.valid,
      detail: areaMatch.detail,
    });

    if (!areaMatch.valid) {
      return {
        approved: false,
        blocked: true,
        pattern,
        commerceArea,
        artifactType,
        version,
        branch,
        conditions: this.fillRemainingConditions(conditions, 7),
        guard: guardResult,
        blockReason: areaMatch.detail,
        alternative: areaMatch.alternative,
        sources: allSources,
      };
    }

    // ── Condition 3: Official sample exists ───────────────────────────────────
    const sampleResult = await this.checkSampleExists(pattern, commerceArea, branch, now);
    conditions.push(sampleResult.condition);
    if (sampleResult.source) allSources.push(sampleResult.source);

    // ── Condition 4: Official documentation exists ────────────────────────────
    const docsResult = await this.checkDocumentation(pattern, commerceArea, now);
    conditions.push(docsResult.condition);
    if (docsResult.source) allSources.push(docsResult.source);

    // ── Condition 5: Artifact type matches the pattern ────────────────────────
    const typeMatch = this.validateArtifactType(pattern, artifactType);
    conditions.push({
      id: 5,
      label: "Artifact type is correct for this pattern",
      passed: typeMatch.valid,
      detail: typeMatch.detail,
    });

    // ── Condition 6: No duplicate in workspace ────────────────────────────────
    const dupResult = await this.checkNoDuplicate(pattern, workspacePath, now);
    conditions.push(dupResult.condition);

    // ── Condition 7: Recommended approach matches current SDK version ─────────
    const versionMatch = this.validateVersionCompatibility(pattern, commerceArea, version);
    conditions.push({
      id: 7,
      label: "Pattern is compatible with the detected Commerce version",
      passed: versionMatch.valid,
      detail: versionMatch.detail,
    });

    // ── Final verdict ─────────────────────────────────────────────────────────
    const failedCritical = conditions.filter(
      (c) => !c.passed && [1, 2, 5].includes(c.id)
    );

    const approved = failedCritical.length === 0;
    const blocked = !approved;

    const alternativeKey = `${commerceArea}:${pattern}:${artifactType}`;
    const alternative = blocked
      ? (PATTERN_ALTERNATIVES[alternativeKey] ?? this.buildAlternativeSuggestion(conditions))
      : undefined;

    return {
      approved,
      blocked,
      pattern,
      commerceArea,
      artifactType,
      version,
      branch,
      conditions,
      guard: guardResult,
      ...(blocked
        ? {
            blockReason: `Pattern validation failed on condition(s): ${failedCritical.map((c) => c.label).join("; ")}`,
            alternative,
          }
        : {}),
      sources: allSources,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private validateAreaMatch(
    pattern: string,
    area: CommerceArea
  ): { valid: boolean; detail: string; alternative?: string } {
    // Check known symbol registry against expected area
    const AREA_SYMBOLS: Record<CommerceArea, string[]> = {
      POS: ["IPreTrigger", "IPostTrigger", "ICancelTrigger", "IApplicationTrigger",
            "IOperationHandler", "OperationHandlerBase", "CustomViewControllerBase",
            "ICustomViewControllerContext", "ShowDialogClientRequest", "DialogBase",
            "CustomControl", "ICustomControl", "ClientRequest"],
      CRT: ["IRequestHandlerAsync", "INamedRequestHandler", "SingleAsyncRequestHandler", "ICommerceRuntime"],
      RetailServer: ["IController", "CommerceController"],
      HardwareStation: ["IHardwareStationController"],
    };

    const validSymbols = AREA_SYMBOLS[area] ?? [];
    const isKnownSymbol = Object.keys(AREA_SYMBOLS).some((a) =>
      AREA_SYMBOLS[a as CommerceArea].includes(pattern)
    );

    if (!isKnownSymbol) {
      // Unknown symbol — allow with a warning (will be caught by guard verification)
      return { valid: true, detail: `'${pattern}' is not in the known symbol table — verified via network` };
    }

    if (validSymbols.includes(pattern)) {
      return { valid: true, detail: `'${pattern}' is valid for ${area}` };
    }

    // Wrong area
    const correctArea = Object.keys(AREA_SYMBOLS).find((a) =>
      AREA_SYMBOLS[a as CommerceArea].includes(pattern)
    );
    return {
      valid: false,
      detail: `'${pattern}' belongs to ${correctArea ?? "a different"} area, not ${area}`,
      alternative: `Use '${pattern}' in a ${correctArea ?? "the correct"} extension, not ${area}`,
    };
  }

  private async checkSampleExists(
    pattern: string,
    area: CommerceArea,
    branch: string,
    now: string
  ): Promise<{ condition: ValidationCondition; source?: { name: string; url: string; retrievedAt: string } }> {
    const AREA_SAMPLE_DIRS: Record<CommerceArea, string> = {
      POS: "src/StoreCommerce",
      CRT: "src/ScaleUnit",
      RetailServer: "src/ScaleUnit",
      HardwareStation: "src/HardwareStation",
    };

    try {
      const dir = AREA_SAMPLE_DIRS[area];
      const items = await this.github.listTree(dir, branch);
      const hasSamples = items.length > 0;

      return {
        condition: {
          id: 3,
          label: "Official sample exists in the SDK repository",
          passed: hasSamples,
          detail: hasSamples
            ? `Found ${items.length} items in ${dir} for branch ${branch}`
            : `No samples found in ${dir} for branch ${branch}`,
          sourceUrl: hasSamples
            ? `https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${branch}/${dir}`
            : undefined,
        },
        source: hasSamples
          ? {
              name: "GitHub Samples",
              url: `https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${branch}/${AREA_SAMPLE_DIRS[area]}`,
              retrievedAt: now,
            }
          : undefined,
      };
    } catch {
      return {
        condition: {
          id: 3,
          label: "Official sample exists in the SDK repository",
          passed: false,
          detail: "Could not verify sample existence — GitHub API unavailable",
        },
      };
    }
  }

  private async checkDocumentation(
    pattern: string,
    area: CommerceArea,
    now: string
  ): Promise<{ condition: ValidationCondition; source?: { name: string; url: string; retrievedAt: string } }> {
    try {
      const results = await this.learn.search(`${area} ${pattern}`, { maxResults: 2 });
      const found = results.length > 0;

      return {
        condition: {
          id: 4,
          label: "Official documentation exists in Microsoft Learn",
          passed: found,
          detail: found
            ? `Found "${results[0]?.title ?? ""}" in Microsoft Learn`
            : `No Microsoft Learn documentation found for '${pattern}'`,
          sourceUrl: found ? results[0]?.url : undefined,
        },
        source: found && results[0]?.url
          ? { name: "Microsoft Learn", url: results[0].url, retrievedAt: now }
          : undefined,
      };
    } catch {
      return {
        condition: {
          id: 4,
          label: "Official documentation exists in Microsoft Learn",
          passed: false,
          detail: "Could not verify documentation — Microsoft Learn API unavailable",
        },
      };
    }
  }

  private validateArtifactType(
    pattern: string,
    artifactType: CommerceArtifactType
  ): { valid: boolean; detail: string } {
    const TYPE_MAP: Record<string, CommerceArtifactType[]> = {
      IPreTrigger: ["Trigger"],
      IPostTrigger: ["Trigger"],
      ICancelTrigger: ["Trigger"],
      IApplicationTrigger: ["Trigger"],
      IOperationHandler: ["Operation"],
      OperationHandlerBase: ["Operation"],
      CustomViewControllerBase: ["View"],
      ICustomViewControllerContext: ["View"],
      ShowDialogClientRequest: ["Dialog"],
      DialogBase: ["Dialog"],
      CustomControl: ["Control"],
      ICustomControl: ["Control"],
      ClientRequest: ["Request"],
      IRequestHandlerAsync: ["CRTService", "Handler"],
      INamedRequestHandler: ["CRTService", "Handler"],
      SingleAsyncRequestHandler: ["CRTService", "Handler"],
      IController: ["RetailServerAPI"],
      CommerceController: ["RetailServerAPI"],
      IHardwareStationController: ["HardwareStationExtension"],
    };

    const validTypes = TYPE_MAP[pattern];
    if (!validTypes) {
      return { valid: true, detail: `Artifact type '${artifactType}' not verified against unknown symbol` };
    }

    if (validTypes.includes(artifactType)) {
      return { valid: true, detail: `'${pattern}' is correctly used as '${artifactType}'` };
    }

    return {
      valid: false,
      detail: `'${pattern}' should be used as '${validTypes.join("' or '")}', not '${artifactType}'`,
    };
  }

  private async checkNoDuplicate(
    pattern: string,
    workspacePath: string | undefined,
    now: string
  ): Promise<{ condition: ValidationCondition }> {
    if (!workspacePath) {
      return {
        condition: {
          id: 6,
          label: "No duplicate in workspace",
          passed: true,
          detail: "Workspace path not provided — duplicate check skipped",
        },
      };
    }

    try {
      const manager = new IndexManager(workspacePath);
      const index = await manager.load();
      if (!index) {
        return {
          condition: {
            id: 6,
            label: "No duplicate in workspace",
            passed: true,
            detail: "Workspace index not found — run AnalyzeWorkspace first for duplicate detection",
          },
        };
      }

      const allArtifacts = [
        ...index.operations, ...index.triggers, ...index.requests,
        ...index.responses, ...index.dialogs, ...index.views,
        ...index.controls, ...index.crt, ...index.retailServer, ...index.hardwareStation,
      ];

      const duplicate = allArtifacts.find((a) => a.name === pattern);
      return {
        condition: {
          id: 6,
          label: "No duplicate in workspace",
          passed: !duplicate,
          detail: duplicate
            ? `Duplicate found: '${pattern}' already exists at '${duplicate.filePath}'`
            : `No duplicate of '${pattern}' found in workspace`,
        },
      };
    } catch {
      return {
        condition: {
          id: 6,
          label: "No duplicate in workspace",
          passed: true,
          detail: "Could not read workspace index",
        },
      };
    }
  }

  private validateVersionCompatibility(
    pattern: string,
    area: CommerceArea,
    version: string
  ): { valid: boolean; detail: string } {
    if (version === "UNKNOWN") {
      return {
        valid: true,
        detail: "Commerce version is unknown — version compatibility check skipped.",
      };
    }

    // All known patterns in our table are valid for 10.0.40+
    const versionParts = version.match(/10\.0\.(\d+)/);
    if (versionParts) {
      const minor = parseInt(versionParts[1] ?? "0", 10);
      if (minor < 40) {
        return {
          valid: false,
          detail: `Commerce ${version} predates the current SDK model. This MCP targets 10.0.40+.`,
        };
      }
    }

    return {
      valid: true,
      detail: `Commerce ${version} is supported`,
    };
  }

  private fillRemainingConditions(
    existing: ValidationCondition[],
    total: number
  ): ValidationCondition[] {
    const filled = [...existing];
    for (let i = filled.length + 1; i <= total; i++) {
      filled.push({
        id: i,
        label: "Skipped — validation blocked at an earlier condition",
        passed: false,
        detail: "Not evaluated",
      });
    }
    return filled;
  }

  private buildAlternativeSuggestion(conditions: ValidationCondition[]): string {
    const failed = conditions.filter((c) => !c.passed);
    return failed.map((c) => c.detail).join(" | ");
  }
}
