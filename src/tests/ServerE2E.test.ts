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
  it("lists exactly 33 tools", async () => {
    const result = await client.send<{ tools: { name: string }[] }>("tools/list", {});
    expect(result.tools.length).toBe(33);
  });

  it("lists exactly 6 resources", async () => {
    const result = await client.send<{ resources: unknown[] }>("resources/list", {});
    expect(result.resources.length).toBe(6);
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
