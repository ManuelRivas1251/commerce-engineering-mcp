import { promises as fs } from "fs";
import path from "path";
import type { WorkspaceIndex, CommerceArtifact } from "../types/commerce.js";
import type { CommerceVersion } from "../types/commerce.js";
import { logger } from "./Logger.js";

const MCP_DIR = ".mcp";
const INDEX_FILE = "workspace-analysis.json";
const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes — refresh if older

export class IndexManager {
  private readonly mcpDir: string;
  private readonly indexPath: string;

  constructor(private readonly workspacePath: string) {
    this.mcpDir = path.join(workspacePath, MCP_DIR);
    this.indexPath = path.join(this.mcpDir, INDEX_FILE);
  }

  async ensureDir(): Promise<void> {
    await fs.mkdir(this.mcpDir, { recursive: true });
  }

  async isStale(): Promise<boolean> {
    try {
      const stat = await fs.stat(this.indexPath);
      return Date.now() - stat.mtimeMs > MAX_AGE_MS;
    } catch {
      return true; // doesn't exist → stale
    }
  }

  async load(): Promise<WorkspaceIndex | null> {
    try {
      const raw = await fs.readFile(this.indexPath, "utf-8");
      return JSON.parse(raw) as WorkspaceIndex;
    } catch {
      return null;
    }
  }

  async save(index: WorkspaceIndex): Promise<void> {
    await this.ensureDir();
    await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2), "utf-8");
    logger.debug({ path: this.indexPath }, "Index saved");
  }

  // Write a dedicated JSON slice for a specific artifact collection.
  async saveSlice(sliceName: string, data: unknown): Promise<void> {
    await this.ensureDir();
    const slicePath = path.join(this.mcpDir, `${sliceName}.json`);
    await fs.writeFile(slicePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async loadSlice<T>(sliceName: string): Promise<T | null> {
    try {
      const raw = await fs.readFile(path.join(this.mcpDir, `${sliceName}.json`), "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  buildEmpty(version: CommerceVersion | null): WorkspaceIndex {
    return {
      schemaVersion: "1.0",
      lastUpdated: new Date().toISOString(),
      workspacePath: this.workspacePath,
      version,
      operations: [],
      triggers: [],
      requests: [],
      responses: [],
      dialogs: [],
      views: [],
      controls: [],
      crt: [],
      retailServer: [],
      hardwareStation: [],
    };
  }

  // Merge new artifacts into an existing index slice — no duplicates by filePath+name.
  merge(existing: CommerceArtifact[], incoming: CommerceArtifact[]): CommerceArtifact[] {
    const map = new Map<string, CommerceArtifact>();
    for (const a of existing) map.set(`${a.filePath}::${a.name}`, a);
    for (const a of incoming) map.set(`${a.filePath}::${a.name}`, a);
    return Array.from(map.values());
  }
}
