/**
 * E2E integration tests for the MCP server.
 *
 * Spawns the compiled server as a child process and communicates
 * via JSON-RPC over stdio, exactly as Claude Code would.
 *
 * Requires a successful `npm run build` before running.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import { resolve } from "path";
import path from "path";

const SERVER_JS = resolve(path.join(process.cwd(), "dist", "server.js"));

// ── JSON-RPC stdio client ──────────────────────────────────────────────────

class MCPTestClient {
  private proc: ChildProcessWithoutNullStreams;
  private buffer = "";
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private nextId = 1;

  constructor() {
    this.proc = spawn("node", [SERVER_JS], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "test", LOG_LEVEL: "error" },
    });

    this.proc.stdout.on("data", (chunk: Buffer) => {
      this.buffer += chunk.toString();
      const lines = this.buffer.split("\n");
      this.buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as { id?: number; result?: unknown; error?: unknown };
          if (msg.id != null) {
            const p = this.pending.get(msg.id);
            if (p) {
              this.pending.delete(msg.id);
              if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
              else p.resolve(msg.result);
            }
          }
        } catch { /* ignore non-JSON lines */ }
      }
    });
  }

  send<T = unknown>(method: string, params: unknown): Promise<T> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      this.proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  }

  async initialize(): Promise<void> {
    await this.send("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "vitest", version: "1.0" },
    });
  }

  close(): void {
    this.proc.stdin.end();
    this.proc.kill();
  }
}

// ── Test suite ─────────────────────────────────────────────────────────────

let client: MCPTestClient;

beforeAll(async () => {
  client = new MCPTestClient();
  await client.initialize();
}, 10000);

afterAll(() => { client.close(); });

// ── Server startup ─────────────────────────────────────────────────────────

describe("Server startup", () => {
  it("lists exactly 38 tools", async () => {
    const result = await client.send<{ tools: { name: string }[] }>("tools/list", {});
    expect(result.tools.length).toBe(38);
  });

  it("declares annotations on read-only and build tools", async () => {
    const result = await client.send<{ tools: { name: string; annotations?: { readOnlyHint?: boolean } }[] }>("tools/list", {});
    const byName = new Map(result.tools.map((t) => [t.name, t]));
    expect(byName.get("SearchSDK")?.annotations?.readOnlyHint).toBe(true);
    expect(byName.get("ValidateManifest")?.annotations?.readOnlyHint).toBe(true);
    expect(byName.get("BuildExtension")?.annotations?.readOnlyHint).toBe(false);
  });

  it("lists exactly 7 resources", async () => {
    const result = await client.send<{ resources: unknown[] }>("resources/list", {});
    expect(result.resources.length).toBe(7);
  });

  it("lists exactly 3 prompts", async () => {
    const result = await client.send<{ prompts: unknown[] }>("prompts/list", {});
    expect(result.prompts.length).toBe(3);
  });

  it("includes expected tool names", async () => {
    const result = await client.send<{ tools: { name: string }[] }>("tools/list", {});
    const names = result.tools.map((t) => t.name);
    expect(names).toContain("AnalyzeWorkspace");
    expect(names).toContain("PatternValidator");
    expect(names).toContain("ArchitectureReview");
    expect(names).toContain("GenerateSolution");
    expect(names).toContain("AddTrigger");
    expect(names).toContain("CreateCRTProject");
    expect(names).toContain("GetHQIntegrationGuide");
    expect(names).toContain("ValidateManifest");
    expect(names).toContain("BuildExtension");
    expect(names).toContain("PackageInstaller");
  });
});

// ── ValidateManifest tool ──────────────────────────────────────────────────

describe("ValidateManifest tool", () => {
  it("reports a missing manifest file without crashing", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "ValidateManifest",
      arguments: { manifestPath: "C:\\does\\not\\exist\\manifest.json" },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.valid).toBe(false);
    expect(data.findings[0].message).toContain("not found");
  });

  it("validates a well-formed manifest and flags a bad one", async () => {
    const { mkdtemp, writeFile, rm } = await import("fs/promises");
    const os = await import("os");
    const dir = await mkdtemp(path.join(os.tmpdir(), "manifest-test-"));
    try {
      const good = path.join(dir, "manifest.json");
      await writeFile(good, JSON.stringify({
        name: "ContosoTest",
        publisher: "Contoso",
        version: "1.0.0",
        minimumPosVersion: "9.29.0.0",
        components: { extend: { triggers: [] } },
      }), "utf-8");

      const okResult = await client.send<{ content: { text: string }[] }>("tools/call", {
        name: "ValidateManifest",
        arguments: { manifestPath: good },
      });
      const ok = JSON.parse(okResult.content[0].text);
      expect(ok.valid).toBe(true);
      expect(ok.errorCount).toBe(0);

      const bad = path.join(dir, "bad-manifest.json");
      await writeFile(bad, JSON.stringify({
        name: "Contoso Test!",           // invalid characters
        version: "not-a-version",        // invalid semver, missing publisher
        components: { extend: { triggers: [{ modulePath: "Triggers/DoesNotExist" }] } },
      }), "utf-8");

      const badResult = await client.send<{ content: { text: string }[] }>("tools/call", {
        name: "ValidateManifest",
        arguments: { manifestPath: bad },
      });
      const badData = JSON.parse(badResult.content[0].text);
      expect(badData.valid).toBe(false);
      const paths = badData.findings.map((f: { path: string }) => f.path);
      expect(paths).toContain("name");
      expect(paths).toContain("version");
      expect(paths).toContain("publisher");
      expect(paths.some((p: string) => p.includes("modulePath"))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

// ── BuildExtension tool ────────────────────────────────────────────────────

describe("BuildExtension tool", () => {
  it("reports a nonexistent project path cleanly", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "BuildExtension",
      arguments: { projectPath: "C:\\does\\not\\exist\\Contoso.sln" },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.success).toBe(false);
    expect(data.message).toContain("does not exist");
  });
});

// ── ArchitectureReview tool ────────────────────────────────────────────────

describe("ArchitectureReview tool (no network)", () => {
  it("returns architecture plan for a POS trigger scenario", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "ArchitectureReview",
      arguments: {
        workspacePath: process.cwd(),
        scenario: "add a pre-trigger to validate cashier pin before logon",
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.detectedAreas).toContain("POS");
    expect(data.detectedAreas).toContain("CRT");
    expect(data.layers).toBeDefined();
    expect(data.dataFlow).toBeDefined();
    expect(data.risks).toBeDefined();
    expect(data.nextStep).toContain("generate_solution");
  });

  it("architecture diagram is a non-empty string", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "ArchitectureReview",
      arguments: {
        workspacePath: process.cwd(),
        scenario: "fiscal printer for receipt",
        components: ["POS", "HardwareStation"],
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(typeof data.architectureDiagram).toBe("string");
    expect(data.architectureDiagram.length).toBeGreaterThan(50);
    expect(data.architectureDiagram).toContain("Store Commerce POS");
    expect(data.architectureDiagram).toContain("Hardware Station");
  });
});

// ── GetHQIntegrationGuide tool ─────────────────────────────────────────────

describe("GetHQIntegrationGuide tool", () => {
  it("returns CDX hq-to-channel guide with code snippets", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "GetHQIntegrationGuide",
      arguments: { topic: "hq-to-channel" },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.direction).toBe("HQToChannel");
    expect(data.steps.length).toBeGreaterThan(0);
    expect(data.codeSnippets.length).toBeGreaterThan(0);
  });

  it("returns integration-map for loyalty scenario", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "GetHQIntegrationGuide",
      arguments: { topic: "integration-map", scenario: "sync customer loyalty points from HQ" },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.integrationMap).toBeDefined();
    expect(data.integrationMap.cdxJobs).toBeDefined();
    expect(data.availableTopics.length).toBe(8);
  });
});

// ── Resources ─────────────────────────────────────────────────────────────

describe("Resources with real data", () => {
  it("commerce://sdk returns valid JSON with known fields", async () => {
    const result = await client.send<{ contents: { uri: string; text: string }[] }>("resources/read", {
      uri: "commerce://sdk",
    });
    const data = JSON.parse(result.contents[0].text);
    expect(data.githubRepo).toContain("Dynamics365Commerce.Solutions");
    expect(data.officialDocs).toContain("learn.microsoft.com");
    expect(result.contents[0].uri).toBe("commerce://sdk");
  });

  it("commerce://architecture returns layer definitions", async () => {
    const result = await client.send<{ contents: { text: string }[] }>("resources/read", {
      uri: "commerce://architecture",
    });
    const data = JSON.parse(result.contents[0].text);
    expect(data.architectureLayers).toHaveLength(4);
    expect(data.architectureLayers.map((l: { layer: string }) => l.layer)).toContain("Store Commerce POS");
    expect(data.architectureLayers.map((l: { layer: string }) => l.layer)).toContain("Commerce Runtime (CRT)");
    expect(data.versionBranchMapping["10.0.46"]).toBe("release/9.56");
  });

  it("commerce://workspace returns JSON (even without a workspace index)", async () => {
    const result = await client.send<{ contents: { text: string }[] }>("resources/read", {
      uri: "commerce://workspace",
    });
    const data = JSON.parse(result.contents[0].text);
    expect(data.workspacePath).toBeTruthy();
    // Either returns artifactCounts (has index) or error hint (no index) — both are valid
    expect(data.artifactCounts !== undefined || data.hint !== undefined || data.error !== undefined).toBe(true);
  });
});

// ── Embedded Docs Catalog ─────────────────────────────────────────────────

describe("Embedded Docs Catalog", () => {
  it("commerce://docs resource returns catalog with expected entries", async () => {
    const result = await client.send<{ contents: { text: string }[] }>("resources/read", {
      uri: "commerce://docs",
    });
    const data = JSON.parse(result.contents[0].text);
    expect(data.totalEntries).toBeGreaterThanOrEqual(89);
    expect(data.entries).toBeDefined();
    expect(data.categorySummary["sdk-overview"]).toBeGreaterThanOrEqual(1);
    expect(data.categorySummary["migration"]).toBeGreaterThanOrEqual(1);
    expect(data.categorySummary["health-check"]).toBeGreaterThanOrEqual(1);
    expect(data.categorySummary["obsolete-apis"]).toBeGreaterThanOrEqual(1);
    expect(data.categorySummary["dev-environment"]).toBeGreaterThanOrEqual(2);
    expect(data.categorySummary["build-pipeline"]).toBeGreaterThanOrEqual(1);
    expect(data.categorySummary["payments"]).toBeGreaterThanOrEqual(5);
    expect(data.categorySummary["localization"]).toBeGreaterThanOrEqual(1);
    expect(data.categorySummary["headless-commerce"]).toBeGreaterThanOrEqual(2);
    expect(data.categorySummary["api-reference"]).toBeGreaterThanOrEqual(4);
    expect(data.categorySummary["extensibility"]).toBeGreaterThanOrEqual(13);
    expect(data.categorySummary["samples"]).toBeGreaterThanOrEqual(4);
    expect(data.categorySummary["deployment"]).toBeGreaterThanOrEqual(3);
    expect(data.categorySummary["pos-extensions"]).toBeGreaterThanOrEqual(33);
  });

  it("SearchDocumentation with EmbeddedDocs finds SDK migration content", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "migrate retail sdk commerce sdk",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const titles = data.sources.embeddedDocs.results.map((r: { title: string }) => r.title);
    expect(titles.some((t: string) => t.toLowerCase().includes("migrat"))).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds NuGet package info", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "nuget packages feed commerce sdk runtime",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const hasPackageEntry = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("pkgs.dev.azure.com")
    );
    expect(hasPackageEntry).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds CSU health check content", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "csu health check extensions icontroller",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const hasHealthCheck = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("healthcheck?testname=extensions")
    );
    expect(hasHealthCheck).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds obsolete HWS APIs", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "GenericWarningEvent obsolete hardware station removed",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const hasObsolete = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("GenericWarningEvent")
    );
    expect(hasObsolete).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds local dev environment prerequisites", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "local development environment prerequisites dotnet sql server nodejs",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const hasPrereqs = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("SQL Server")
    );
    expect(hasPrereqs).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds self-hosted CSU debug info", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "self-hosted csu debug f5 localhost 12345",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const hasDebug = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("localhost:12345")
    );
    expect(hasDebug).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds Azure DevOps build pipeline setup", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "build pipeline azure devops yaml csu extension package",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const hasPipeline = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("CloudScaleUnitExtensionPackage")
    );
    expect(hasPipeline).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds payment connector deploy locations", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "payment connector deploy ipaymentprocessor hardware station assemblies",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("IPaymentProcessor")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds tipping isTippingEnabled", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "tipping tip amount payment terminal isTippingEnabled",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("isTippingEnabled")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds incremental capture SupportsMultipleCaptures", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "incremental capture multiple authorization invoice payment connector",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("SupportsMultipleCaptures")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds L2/L3 payment data fields", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "payment data fields L2 L3 card not present ecommerce",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("L2Data")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds localization Language text and CommerceException", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "localization language text pos labels error messages crt",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("CommerceException")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds localization distribution schedule 1090", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "distribution schedule 1090 registers language text override",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("1090")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds SSL certificate setup for IIS CSU", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "ssl certificate thumbprint entra id csu install",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const hasCert = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.toLowerCase().includes("thumbprint")
    );
    expect(hasCert).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds CSU Core ASP.NET migration", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "csu core asp.net migrate lcs disable net standard 10.0.38",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("Disable CSU Core")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds headless commerce integration samples", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "headless commerce integration samples storefront retail server api azure function",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("HeadlessSampleConsoleApp")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds CSU API roles and authentication", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "CommerceRole Employee Customer Anonymous Application retail server auth entra",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("ManagerFactory")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds CSU Cart and SalesOrder controllers", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "Checkout AddCartLines AddTenderLine cart controller odata csu",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("AddTenderLine")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds TypeScript proxy generation", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "typescript proxy CommerceProxyGenerator DataServiceEntities POS retail server",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("DataServiceEntities.g.ts")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds CRT architecture layers", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "CRT commerce runtime architecture layers data access services workflow handler",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("CommerceRuntime.Ext.config")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation with EmbeddedDocs finds CRT services SaveCartRequest and CustomerService", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "SaveCartRequest CustomerService PricingService CalculatePricesServiceRequest CRT handler",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("GetCustomReceiptFieldServiceRequest")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds IController RoutePrefix BindEntity extension", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "IController RoutePrefix BindEntity HttpPost Authorization CommerceRoles Retail Server extension",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) => r.content.includes("extensionComposition")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds CRT triggers OnExecuting OnExecuted IRequestTriggerAsync", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "CRT trigger pre post ExecuteNextAsync GetNextAsyncRequestHandler NotHandledResponse override",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("IRequestTriggerAsync") && r.content.includes("OnExecuting")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds Application Insights TelemetryClient and ext.AppInsightsKey", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "Application Insights TelemetryClient ContosoLogger AppInsightsKey telemetry CRT POS logging",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("ext.AppInsightsKey") && r.content.includes("TraceTelemetry")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds async CRT SingleAsyncRequestHandler with ConfigureAwait", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "async CRT SingleAsyncRequestHandler IRequestHandlerAsync DatabaseContext ReadEntityAsync ConfigureAwait",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("SingleAsyncRequestHandler") && r.content.includes("ConfigureAwait(false)")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds channel DB EXT schema REPLICATIONCOUNTERFROMORIGIN", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "channel database EXT schema extension table REPLICATIONCOUNTERFROMORIGIN DataSyncUsersRole CDX",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("REPLICATIONCOUNTERFROMORIGIN") && r.content.includes("DataSyncUsersRole")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds CDX real-time RetailTransactionServiceEx and InvokeExtensionMethodRealtimeRequest", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "CDX real-time service RetailTransactionServiceEx X++ InvokeExtensionMethodRealtimeRequest HQ",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("RetailTransactionServiceEx") &&
        r.content.includes("InvokeExtensionMethodRealtimeRequest")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds CRT trigger OnExecuting OnExecuted IRequestTriggerAsync performance warning", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "CRT trigger OnExecuting OnExecuted IRequestTriggerAsync pre-trigger post-trigger performance cache",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("OnExecuting") && r.content.includes("OnExecuted") && r.content.includes("IRequestTriggerAsync")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds pre-extended columns INVENTSERIALID ValidateAddressLengthServiceRequest", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "pre-extended columns INVENTSERIALID STREET ValidateAddressLengthServiceRequest channel database field length",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("ValidateAddressLengthServiceRequest") && r.content.includes("INVENTSERIALID")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds CDX extensibility RetailCDXSeedDataBase registerCDXSeedDataExtension", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "CDX extensibility RetailCDXSeedDataBase registerCDXSeedDataExtension subjob push pull XML resource",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("RetailCDXSeedDataBase") && r.content.includes("registerCDXSeedDataExtension")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds custom receipt fields GetSalesTransactionCustomReceiptFieldServiceRequest", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "custom receipt fields GetSalesTransactionCustomReceiptFieldServiceRequest WARRANTYID custom receipt type",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("GetSalesTransactionCustomReceiptFieldServiceRequest")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds customer attributes configuration-driven no-code POS HQ", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "customer attributes configuration no-code attribute group Commerce parameters CDX 1010 1110",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("Customer attribute group") || r.content.includes("customer attribute group")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds order attributes AttributeTextValue SaveAttributesOnCartClientRequest", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "order attributes cash-and-carry transaction AttributeTextValue SaveAttributesOnCartClientRequest SuspendCartRequest",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("AttributeTextValue") && r.content.includes("SaveAttributesOnCartClientRequest")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds Key Vault secret management GetUserDefinedSecretStringValueServiceRequest", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "Azure Key Vault secrets CRT GetUserDefinedSecretStringValueServiceRequest X509Certificate2 credential rotation",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("GetUserDefinedSecretStringValueServiceRequest") && r.content.includes("Key Vault")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds blocking transaction trigger CartValidationException CustomerAccountIsBlocked", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "block transaction CRT trigger GetCustomersServiceRequest customer blocked CartValidationException",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("CartValidationException") &&
        r.content.includes("Microsoft_Dynamics_Commerce_Runtime_CustomerAccountIsBlocked")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds abandoned cart sample Retail Server Cosmos DB Emarsys", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "abandoned cart email notification Retail Server Cosmos DB IEmailProvider Emarsys connector",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("IEmailProvider") &&
        r.content.includes("AbandonedCartSample")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds loyalty extension FillInLoyaltyRewardPointLinesForSalesServiceRequest earn redeem", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "loyalty earn redeem same transaction FillInLoyaltyRewardPointLinesForSalesServiceRequest LoyaltyRewardPointLine",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("FillInLoyaltyRewardPointLinesForSalesServiceRequest") &&
        r.content.includes("LoyaltyRewardPointEntryType")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds packing slip PrintPackingSlipClientRequestHandler shipping carrier", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "packing slip shipping carrier PrintPackingSlipClientRequestHandler MarkAsPickedRealtimeRequest packingSlipExtensionPoint",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("PrintPackingSlipClientRequestHandler") &&
        r.content.includes("packingSlipExtensionPoint")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds CSU packaging CloudScaleUnitExtensionPackage Sdk.ScaleUnit NuGet", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "CSU packaging CloudScaleUnitExtensionPackage Sdk.ScaleUnit NuGet LCS deployment CommerceRuntimeExtensionSettings",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("CloudScaleUnitExtensionPackage") &&
        r.content.includes("Microsoft.Dynamics.Commerce.Sdk.ScaleUnit")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds merge CSU extensions ISV NuGet GeneratePackageOnBuild PackageReference", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "merge CSU extensions ISV NuGet GeneratePackageOnBuild PackageReference single package LCS",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("GeneratePackageOnBuild") && r.content.includes("PackageReference")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS extension package status Loaded Failed Skipped Settings view", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS extension package status Loaded Failed Skipped Settings view details troubleshooting",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("Loaded") && r.content.includes("Failed") && r.content.includes("Skipped")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS APIs GetCurrentCartClientRequest executeAsync PriceOverrideOperationRequest", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS APIs GetCurrentCartClientRequest executeAsync PriceOverrideOperationRequest TriggerToastNotificationClientRequest SaveAttributesOnCartClientRequest",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("GetCurrentCartClientRequest") &&
        r.content.includes("PriceOverrideOperationRequest")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS controls DataList controlFactory DatePicker Toggle NumPad", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS controls DataList controlFactory DatePicker Toggle NumPad IDataListOptions PosApi/Consume/Controls",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("controlFactory") && r.content.includes("DataList")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds dual display DualDisplayCustomControlBase CartChangedData manifest dualDisplay", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "dual display DualDisplayCustomControlBase CartChangedData CustomerChangedData manifest dualDisplay customControl",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("DualDisplayCustomControlBase") &&
        r.content.includes("CartChangedData")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds consume custom APIs TypeScript proxy DataServiceEntities DataServiceRequests auto-generation", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "consume custom CRT APIs POS TypeScript proxy DataServiceEntities.g.ts DataServiceRequests.g.ts auto-generation project reference",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("DataServiceEntities.g.ts") &&
        r.content.includes("DataServiceRequests.g.ts")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds Knockout.js POS extension bundle manifest dependencies alias amd ApplicationStart", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "Knockout.js POS extension bundle manifest dependencies alias amd __posStopExtensionsBinding ApplicationStart tsconfig paths",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("__posStopExtensionsBinding") &&
        r.content.includes("knockout")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds local dev environment self-hosted CSU localhost 12345 Dynamics365Commerce.ScaleUnit", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "local dev environment self-hosted CSU localhost 12345 Dynamics365Commerce.ScaleUnit sealed installer demo data baseProduct_UseSelfHost",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("localhost:12345") &&
        r.content.includes("baseProduct_UseSelfHost")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS extension overview Store Commerce MPOS CPOS independent packaging", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS extension overview Store Commerce MPOS independent packaging sealed SDK extension points triggers views operations",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("Store Commerce") && r.content.includes("independent packaging")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS extension basics manifest.json PosApi GetExtensionPackageDefinitionsRequest", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS extension basics manifest.json PosApi GetExtensionPackageDefinitionsRequest ExtensionPackageDefinition minimumPosVersion",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("GetExtensionPackageDefinitionsRequest") &&
        r.content.includes("minimumPosVersion")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS migration Retail SDK independent packaging ExtensionViewControllerBase CustomViewControllerBase", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "migrate POS extension Retail SDK independent packaging ExtensionViewControllerBase CustomViewControllerBase Pos.UI.Sdk Knockout",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("ExtensionViewControllerBase") &&
        r.content.includes("CustomViewControllerBase")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS create extension package CustomizationPackage.props tsconfig pos-tsconfig-base.json", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS extension package project CustomizationPackage.props tsconfig pos-tsconfig-base.json PackageName Microsoft.Dynamics.Commerce.Sdk.Pos",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("pos-tsconfig-base.json") &&
        r.content.includes("CustomizationPackage.props")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds Store Commerce debug VS Code launch.json port 9222 enablewebviewdevtools", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "debug Store Commerce VS Code launch.json port 9222 enablewebviewdevtools pwa-msedge StoreCommerce.Installer",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("--enablewebviewdevtools") &&
        r.content.includes("9222")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds MPOS appx UWP JavaScript ModernPos x86 platform MSIX packaging", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "MPOS appx UWP JavaScript ModernPos x86 platform MSIX packaging jsproj ProjectConfiguration Windows 1809",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("ModernPos") &&
        r.content.includes("ProjectConfiguration")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds debug MPOS CPOS sealed mklink IIS RetailCloudPos Extensions symlink Edge F12", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "debug sealed MPOS CPOS mklink IIS RetailCloudPos Extensions symlink Edge F12 JavaScript Source Mapping",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("mklink") &&
        r.content.includes("RetailCloudPos")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS custom operation ExtensionOperationRequestBase operationId button grid", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS custom operation ExtensionOperationRequestBase ExtensionOperationRequestHandlerBase operationId 4001 button grid manifest",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("ExtensionOperationRequestBase") &&
        r.content.includes("operationId")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS custom view CustomViewControllerBase onReady commandBar ICommandDefinition", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS custom view CustomViewControllerBase onReady dispose commandBar ICommandDefinition ICustomViewControllerConfiguration canExecute",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("ICustomViewControllerConfiguration") &&
        r.content.includes("commandBar")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds Hardware Station extension IController RoutePrefix HardwareStationDeviceActionRequest", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "Hardware Station extension new device IController RoutePrefix HttpPost HardwareStationDeviceActionRequest extension installer sealed",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("HardwareStationDeviceActionRequest") &&
        r.content.includes("RoutePrefix")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds payment connector INamedRequestHandler AuthorizePaymentTerminalDeviceRequest PaymentSdkData", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "payment connector INamedRequestHandler AuthorizePaymentTerminalDeviceRequest PaymentSdkData IPaymentProcessor GetMerchantAccountPropertyMetadata",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("INamedRequestHandler") &&
        r.content.includes("AuthorizePaymentTerminalDeviceRequest")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds payment custom error PaymentError isLocalized ResourceManager locale", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "payment custom error message PaymentError isLocalized ResourceManager locale resx satellite assembly AuthorizePaymentTerminalDeviceResponse",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("isLocalized") &&
        r.content.includes("PaymentError")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds duplicate payment protection GetTransactionReferencePaymentTerminalDeviceRequest PaymentTransactionReferenceData", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "duplicate payment protection GetTransactionReferencePaymentTerminalDeviceRequest GetTransactionByTransactionReferencePaymentTerminalDeviceRequest PaymentTransactionReferenceData idempotency recovery",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("GetTransactionReferencePaymentTerminalDeviceRequest") &&
        r.content.includes("PaymentTransactionReferenceData")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS view extension CustomerSearchExtensionCommandBase customerListConfiguration", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "extend POS view custom columns app bar button SearchView CustomerSearchExtensionCommandBase customerListConfiguration",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("CustomerSearchExtensionCommandBase") &&
        r.content.includes("customerListConfiguration")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds non-screen custom control SimpleProductDetailsCustomControlBase OrgUnitAvailability", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "custom control nonscreen POS view SimpleProductDetailsCustomControlBase product availability",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("SimpleProductDetailsCustomControlBase") &&
        r.content.includes("OrgUnitAvailability")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS header bar CustomPackingItem customPackingItems", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS header bar custom button CustomPackingItem cartChangedHandler",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("CustomPackingItem") &&
        r.content.includes("customPackingItems")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS notification extension GetNotificationsExtensionServiceRequest NotificationDetailCollection", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS notification extension CRT GetNotificationsExtensionServiceRequest NotificationDetailCollection",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("GetNotificationsExtensionServiceRequest") &&
        r.content.includes("NotificationDetailCollection")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS request handler override GetSerialNumberClientRequestHandler defaultExecuteAsync", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "override POS request handler GetSerialNumberClientRequestHandler executeAsync defaultExecuteAsync",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("GetSerialNumberClientRequestHandler") &&
        r.content.includes("defaultExecuteAsync")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS trigger printing PostSuspendTransactionTrigger CustomReceipt7", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS trigger printing PostSuspendTransactionTrigger GetReceiptsClientRequest CustomReceipt7",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("PostSuspendTransactionTrigger") &&
        r.content.includes("CustomReceipt7")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds cart view handlers CartExtensionViewControllerBase cartLineSelectedHandler", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "cart view event handlers CartExtensionViewControllerBase cartLineSelectedHandler tenderLineSelectedHandler",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("CartExtensionViewControllerBase") &&
        r.content.includes("cartLineSelectedHandler")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS totals custom field CartViewTotalsPanelCustomFieldBase computeValue", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "custom field POS totals panel CartViewTotalsPanelCustomFieldBase computeValue cart total amount",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("CartViewTotalsPanelCustomFieldBase") &&
        r.content.includes("computeValue")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS transaction custom column CustomLinesGridColumnBase linesGrid", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "custom column POS transaction grid CustomLinesGridColumnBase linesGrid CustomGridColumnAlignment",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("CustomLinesGridColumnBase") &&
        r.content.includes("linesGrid")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS transaction custom control CartViewCustomControlBase LineDetailsCustomControl", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS transaction page custom control Cart view CartViewCustomControlBase screen layout designer",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("CartViewCustomControlBase") &&
        r.content.includes("LineDetailsCustomControl")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS custom control views msPosDataList extensionPackageInfo", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS custom control views SimpleProductDetails msPosDataList static resources extensionPackageInfo",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("msPosDataList") &&
        r.content.includes("extensionPackageInfo")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds POS payment request handler PaymentTerminalAuthorizePaymentRequestHandlerExt FillExtensionProperties", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "POS payment extension override PaymentTerminalAuthorizePaymentRequestHandler extension properties connector",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("PaymentTerminalAuthorizePaymentRequestHandlerExt") &&
        r.content.includes("FillExtensionProperties")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds MPOS extension packaging ModernPos.Installer net461 ReferenceOutputAssembly", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "MPOS Modern POS extension installer packaging Microsoft.Dynamics.Commerce.Sdk.Installers.ModernPos net461",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("ModernPos.Installer") &&
        r.content.includes("net461")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds MPOS extension code signing PackageCertificateKeyFile pfx certificate", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "MPOS extension code signing certificate PackageCertificateKeyFile pfx MSIX appx",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("PackageCertificateKeyFile") &&
        r.content.includes(".pfx")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds CPOS extension packaging ScaleUnit Installers.ScaleUnit Extension.Config", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "Cloud POS CPOS extension package ScaleUnit Microsoft.Dynamics.Commerce.Sdk.Installers.ScaleUnit CSU",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("ScaleUnit.Installer") &&
        r.content.includes("Extension.Config")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds Store Commerce extension installer Sdk.Installers.StoreCommerce net472 CommerceRuntimeExtensionSettings", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "Store Commerce extension installer Microsoft.Dynamics.Commerce.Sdk.Installers.StoreCommerce net472",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("Sdk.Installers.StoreCommerce") &&
        r.content.includes("CommerceRuntimeExtensionSettings")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds Store Commerce Android iOS hardware station extensibility net8.0-android net8.0-ios APK IPA", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "Store Commerce Android iOS mobile hardware station extension APK IPA MAUI",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("net8.0-android") &&
        r.content.includes("net8.0-ios")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds customer CDX package extension RetailTransactionServiceCustomerExtensions addAdditionalCustomerDataToPackage", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "customer CDX package extension RetailTransactionServiceCustomerExtensions addAdditionalCustomerDataToPackage serializer writeRecord",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("RetailTransactionServiceCustomerExtensions") &&
        r.content.includes("addAdditionalCustomerDataToPackage")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds payment connector AOS package RetailPaymentConnectors deployable package LCS", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "payment connector AOS package RetailPaymentConnectors model deployable package LCS finance operations",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("RetailPaymentConnectors") &&
        r.content.includes("deployable package")
    );
    expect(found).toBe(true);
  });

  it("SearchDocumentation finds remove CSU extension package once per day LCS Shared asset library", async () => {
    const result = await client.send<{ content: { text: string }[] }>("tools/call", {
      name: "SearchDocumentation",
      arguments: {
        query: "remove CSU extension package LCS Shared asset library once per day cleanup uninstall",
        sources: ["EmbeddedDocs"],
        maxResults: 5,
      },
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.sources.embeddedDocs.count).toBeGreaterThan(0);
    const found = data.sources.embeddedDocs.results.some(
      (r: { content: string }) =>
        r.content.includes("Remove CSU Extension") && r.content.toLowerCase().includes("once per calendar day")
    );
    expect(found).toBe(true);
  });
});

// ── Prompts ────────────────────────────────────────────────────────────────

describe("Prompts with real content", () => {
  it("architect-mode prompt contains workflow instructions", async () => {
    const result = await client.send<{ messages: { content: { text: string } }[] }>("prompts/get", {
      name: "architect-mode",
      arguments: { scenario: "add fiscal printer integration", workspacePath: process.cwd() },
    });
    const text = result.messages[0].content.text;
    expect(text).toContain("Architect Mode");
    expect(text).toContain("architecture_review");
    expect(text).toContain("Anti-hallucination");
    // The prompt mentions NgModule in its "do NOT use" rules — that's correct
    expect(text).toContain("NgModule");
  });

  it("implement-mode prompt contains mandatory workflow steps", async () => {
    const result = await client.send<{ messages: { content: { text: string } }[] }>("prompts/get", {
      name: "implement-mode",
      arguments: { task: "add pre-trigger", workspacePath: process.cwd() },
    });
    const text = result.messages[0].content.text;
    expect(text).toContain("detect_commerce_version");
    expect(text).toContain("pattern_validator");
    expect(text).toContain("NEVER invent API names");
  });

  it("e2e-solution prompt contains execution plan steps", async () => {
    const result = await client.send<{ messages: { content: { text: string } }[] }>("prompts/get", {
      name: "e2e-solution",
      arguments: { scenario: "fiscal receipt printing", workspacePath: process.cwd() },
    });
    const text = result.messages[0].content.text;
    expect(text).toContain("architecture_review");
    expect(text).toContain("generate_solution");
    expect(text).toContain("Step 1");
    expect(text).toContain("Step 4");
  });
});
