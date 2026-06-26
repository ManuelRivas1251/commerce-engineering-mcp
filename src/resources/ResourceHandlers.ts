/**
 * ResourceHandlers — real data implementations for the 6 MCP resources.
 *
 * Resources are workspace-agnostic where possible. For workspace-specific
 * resources, the default workspace is read from:
 *   1. env COMMERCE_WORKSPACE_PATH
 *   2. ~/.commerce-engineering-mcp/last-workspace.json  (written by tools)
 *   3. process.cwd()
 */

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { VersionResolver } from "../core/VersionResolver.js";
import { IndexManager } from "../core/IndexManager.js";
import { SDKCache } from "../sources/SDKCache.js";
import { GitHubClient } from "../sources/GitHubClient.js";
import { ArchitectureAdvisor } from "../core/ArchitectureAdvisor.js";
import { logger } from "../core/Logger.js";

const GLOBAL_DIR = path.join(os.homedir(), ".commerce-engineering-mcp");
const LAST_WORKSPACE_FILE = path.join(GLOBAL_DIR, "last-workspace.json");

// ─── Workspace path resolution ─────────────────────────────────────────────

export async function resolveDefaultWorkspace(): Promise<string> {
  if (process.env["COMMERCE_WORKSPACE_PATH"]) {
    return process.env["COMMERCE_WORKSPACE_PATH"];
  }
  try {
    const raw = await fs.readFile(LAST_WORKSPACE_FILE, "utf-8");
    const data = JSON.parse(raw) as { path: string };
    if (data.path) return data.path;
  } catch {
    // not set
  }
  return process.cwd();
}

export async function saveLastWorkspace(workspacePath: string): Promise<void> {
  try {
    await fs.mkdir(GLOBAL_DIR, { recursive: true });
    await fs.writeFile(LAST_WORKSPACE_FILE, JSON.stringify({ path: workspacePath, updatedAt: new Date().toISOString() }), "utf-8");
  } catch { /* non-fatal */ }
}

// ─── Resource: commerce://workspace ────────────────────────────────────────

export async function handleWorkspaceResource(): Promise<string> {
  const wsPath = await resolveDefaultWorkspace();
  try {
    const version = await new VersionResolver().resolve(wsPath);
    const indexMgr = new IndexManager(wsPath);
    const index = await indexMgr.load();

    if (!index) {
      return JSON.stringify({
        workspacePath: wsPath,
        detectedAt: new Date().toISOString(),
        version,
        hint: "Workspace index not yet built. Run analyze_workspace first.",
      }, null, 2);
    }

    const artifactCounts = {
      operations: index.operations.length,
      triggers: index.triggers.length,
      requests: index.requests.length,
      responses: index.responses.length,
      dialogs: index.dialogs.length,
      views: index.views.length,
      controls: index.controls.length,
      crtHandlers: index.crt.length,
      retailServerControllers: index.retailServer.length,
      hardwareStationControllers: index.hardwareStation.length,
    };

    return JSON.stringify({
      workspacePath: wsPath,
      detectedAt: new Date().toISOString(),
      version,
      artifactCounts,
      totalArtifacts: Object.values(artifactCounts).reduce((s, n) => s + n, 0),
      lastIndexed: index.lastUpdated,
    }, null, 2);
  } catch (err) {
    return JSON.stringify({
      workspacePath: wsPath,
      error: (err as Error).message,
      hint: "Run analyze_workspace to build the workspace index first.",
    }, null, 2);
  }
}

// ─── Resource: commerce://operations ───────────────────────────────────────

export async function handleOperationsResource(): Promise<string> {
  const wsPath = await resolveDefaultWorkspace();
  try {
    const indexMgr = new IndexManager(wsPath);
    const index = await indexMgr.load();
    const ops = index?.operations ?? [];

    return JSON.stringify({
      workspacePath: wsPath,
      count: ops.length,
      operations: ops.map((op: import("../types/commerce.js").CommerceArtifact) => ({
        name: op.name,
        filePath: op.filePath,
        area: op.area,
        namespace: op.namespace ?? null,
      })),
      hint: ops.length === 0 ? "No custom operations found. Run analyze_workspace first." : undefined,
    }, null, 2);
  } catch {
    return JSON.stringify({ workspacePath: wsPath, count: 0, operations: [], hint: "Run analyze_workspace first." }, null, 2);
  }
}

// ─── Resource: commerce://triggers ─────────────────────────────────────────

export async function handleTriggersResource(): Promise<string> {
  const wsPath = await resolveDefaultWorkspace();
  try {
    const indexMgr = new IndexManager(wsPath);
    const index = await indexMgr.load();
    const triggers = index?.triggers ?? [];

    return JSON.stringify({
      workspacePath: wsPath,
      count: triggers.length,
      triggers: triggers.map((t: import("../types/commerce.js").CommerceArtifact) => ({
        name: t.name,
        filePath: t.filePath,
        area: t.area,
      })),
      hint: triggers.length === 0 ? "No triggers found. Run analyze_workspace first." : undefined,
    }, null, 2);
  } catch {
    return JSON.stringify({ workspacePath: wsPath, count: 0, triggers: [], hint: "Run analyze_workspace first." }, null, 2);
  }
}

// ─── Resource: commerce://requests ─────────────────────────────────────────

export async function handleRequestsResource(): Promise<string> {
  const wsPath = await resolveDefaultWorkspace();
  try {
    const indexMgr = new IndexManager(wsPath);
    const index = await indexMgr.load();
    const requests = [...(index?.requests ?? []), ...(index?.crt ?? [])];

    return JSON.stringify({
      workspacePath: wsPath,
      count: requests.length,
      requests: requests.map((r: import("../types/commerce.js").CommerceArtifact) => ({
        name: r.name,
        type: r.type,
        filePath: r.filePath,
        area: r.area,
        namespace: r.namespace ?? null,
      })),
      hint: requests.length === 0 ? "No CRT requests/handlers found. Run analyze_workspace first." : undefined,
    }, null, 2);
  } catch {
    return JSON.stringify({ workspacePath: wsPath, count: 0, requests: [], hint: "Run analyze_workspace first." }, null, 2);
  }
}

// ─── Resource: commerce://sdk ──────────────────────────────────────────────

export async function handleSdkResource(): Promise<string> {
  const github = new GitHubClient();
  const sdkNote = github.hasToken()
    ? "GitHub API authenticated — full access"
    : "No GITHUB_TOKEN set — rate-limited to 60 req/hour. Set GITHUB_TOKEN for full access.";

  try {
    const sdkCache = new SDKCache(GLOBAL_DIR);

    // Try to get cached index (loads from disk if fresh, no network call)
    const wsPath = await resolveDefaultWorkspace();
    const version = await new VersionResolver().resolve(wsPath);
    const branch = version.branch !== "release/9.56" ? version.branch : "release/9.56";

    // loadIndex is private — use getIndex which checks cache first
    // We pass the branch without forcing a rebuild; it will serve from cache if fresh
    const cached = await sdkCache.getIndex(branch, version.version).catch(() => null);
    if (cached) {
      return JSON.stringify({
        source: "cache",
        branch: cached.branch,
        version: cached.version,
        downloadedAt: cached.downloadedAt,
        indexedAreas: cached.indexedAreas,
        totalSamples: cached.samples.length,
        githubRepo: "https://github.com/microsoft/Dynamics365Commerce.Solutions",
        officialDocs: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/",
        sdkNote,
      }, null, 2);
    }
  } catch (err) {
    logger.debug({ err: (err as Error).message }, "SDK cache miss, returning metadata");
  }

  // No cache or error — return reference metadata only (no network call)
  return JSON.stringify({
    source: "reference",
    branch: "release/9.56",
    githubRepo: "https://github.com/microsoft/Dynamics365Commerce.Solutions",
    officialDocs: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/",
    sdkNote: "SDK index not yet built. Call search_sdk or search_official_samples to trigger indexing.",
    knownBranches: ["release/9.50", "release/9.51", "release/9.52", "release/9.53", "release/9.54", "release/9.55", "release/9.56"],
    versionMapping: {
      "10.0.40": "release/9.50",
      "10.0.41": "release/9.51",
      "10.0.42": "release/9.52",
      "10.0.43": "release/9.53",
      "10.0.44": "release/9.54",
      "10.0.45": "release/9.55",
      "10.0.46": "release/9.56",
    },
    sdkAreas: [
      { area: "POS", path: "src/ExtendedLogon/Pos/", description: "Store Commerce POS extension samples" },
      { area: "CRT", path: "src/FiscalIntegration/EFRSample/CommerceRuntime/", description: "CRT handler samples" },
      { area: "RetailServer", path: "src/Extensions.AbandonedCartSample/", description: "Retail Server extension samples" },
      { area: "HardwareStation", path: "src/FiscalIntegration/EFRSample/HardwareStation/", description: "Hardware Station samples" },
    ],
  }, null, 2);
}

// ─── Resource: commerce://architecture ─────────────────────────────────────

export async function handleArchitectureResource(): Promise<string> {
  const advisor = new ArchitectureAdvisor();
  // Generate a reference plan covering ALL areas
  const plan = advisor.analyse(
    "complete e2e solution with pos trigger operation dialog view crt handler retail server api hardware station controller fiscal printer",
    ["POS", "CRT", "RetailServer", "HardwareStation"]
  );

  return JSON.stringify({
    title: "Dynamics 365 Commerce — Extension Architecture Reference",
    description: "Complete architecture map for D365 Commerce extensibility, covering all four layers.",
    updatedAt: new Date().toISOString(),
    officialRepo: "https://github.com/microsoft/Dynamics365Commerce.Solutions",
    officialDocs: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/",

    architectureLayers: [
      {
        layer: "Store Commerce POS",
        technology: "TypeScript / React (Chromium-based app)",
        patterns: ["PreTrigger", "PostTrigger", "CancelTrigger", "CustomOperation", "CustomView", "ShowDialog", "CustomControl"],
        packageFormat: "Extension Package (.scpkg)",
        entryPoint: "manifest.json",
        docs: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension-overview",
        sdkPath: "src/ExtendedLogon/Pos/",
      },
      {
        layer: "Commerce Runtime (CRT)",
        technology: "C# .NET 8 (runs inside CSU process)",
        patterns: ["SingleAsyncRequestHandler<TRequest>", "INamedRequestHandler", "IRequestHandlerAsync"],
        packageFormat: "Assembly (.dll) registered in CommerceRuntime.Ext.config",
        entryPoint: "CommerceRuntime.Ext.config",
        docs: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility",
        sdkPath: "src/FiscalIntegration/EFRSample/CommerceRuntime/",
      },
      {
        layer: "Retail Server / CSU",
        technology: "C# .NET 8 (ASP.NET Core OData service)",
        patterns: ["IController (RoutePrefix + BindEntity)", "CommerceAuthorization"],
        packageFormat: "Assembly (.dll) registered in extension config",
        entryPoint: "Extension registration",
        docs: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility",
        sdkPath: "src/Extensions.AbandonedCartSample/",
      },
      {
        layer: "Hardware Station",
        technology: "C# .NET 8 (local Windows service / IIS)",
        patterns: ["IHardwareStationController (RoutePrefix)"],
        packageFormat: "Assembly (.dll) registered in HardwareStation.Extension.config",
        entryPoint: "HardwareStation.Extension.config",
        docs: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension",
        sdkPath: "src/FiscalIntegration/EFRSample/HardwareStation/",
      },
    ],

    dataFlowReference: plan.dataFlow,
    commonRisks: plan.risks,
    testingReference: plan.testing,
    deploymentReference: plan.deploymentNotes,
    officialReferences: plan.officialReferences,

    versionBranchMapping: {
      "10.0.40": "release/9.50",
      "10.0.41": "release/9.51",
      "10.0.42": "release/9.52",
      "10.0.43": "release/9.53",
      "10.0.44": "release/9.54",
      "10.0.45": "release/9.55",
      "10.0.46": "release/9.56",
    },
  }, null, 2);
}
