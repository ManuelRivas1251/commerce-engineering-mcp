import { promises as fs } from "fs";
import path from "path";
import { GitHubClient } from "./GitHubClient.js";
import { logger } from "../core/Logger.js";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SDK_AREAS = [
  "src/StoreCommerce",
  "src/ScaleUnit",
  "src/FiscalIntegration",
  "src/HardwareStation",
];

export interface SampleEntry {
  name: string;
  path: string;
  area: string;
  description: string;
  htmlUrl: string;
  branch: string;
  version: string;
}

export interface SDKIndex {
  version: string;
  branch: string;
  downloadedAt: string;
  indexedAreas: string[];
  samples: SampleEntry[];
}

export class SDKCache {
  private readonly sdkDir: string;
  private readonly indexPath: string;
  private readonly github = new GitHubClient();

  constructor(mcpDir: string) {
    this.sdkDir = path.join(mcpDir, "sdk-cache");
    this.indexPath = path.join(this.sdkDir, "sdk.json");
  }

  async getIndex(branch: string, version: string): Promise<SDKIndex> {
    const cached = await this.loadIndex();
    if (cached && cached.branch === branch && !this.isStale(cached.downloadedAt)) {
      logger.debug({ branch }, "SDK cache hit");
      return cached;
    }

    logger.info({ branch, version }, "Building SDK index from GitHub");
    return this.buildIndex(branch, version);
  }

  async searchSamples(query: string, branch: string, version: string): Promise<SampleEntry[]> {
    const index = await this.getIndex(branch, version);
    const lowerQuery = query.toLowerCase();
    return index.samples.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.path.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery)
    );
  }

  async getFileContent(filePath: string, branch: string): Promise<string | null> {
    // Check local file cache first
    const localPath = path.join(this.sdkDir, "files", filePath.replace(/\//g, path.sep));
    try {
      const stat = await fs.stat(localPath);
      if (!this.isStale(new Date(stat.mtimeMs).toISOString())) {
        return fs.readFile(localPath, "utf-8");
      }
    } catch {
      // not cached
    }

    // Fetch from GitHub
    const content = await this.github.getFileContent(filePath, branch);
    if (!content) return null;

    // Cache locally
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, content.content, "utf-8");
    return content.content;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async buildIndex(branch: string, version: string): Promise<SDKIndex> {
    const samples: SampleEntry[] = [];

    for (const area of SDK_AREAS) {
      try {
        const items = await this.github.listTree(area, branch);
        for (const item of items) {
          if (item.type === "tree") {
            const name = item.path.split("/").pop() ?? item.path;
            samples.push({
              name,
              path: item.path,
              area: this.classifyArea(item.path),
              description: this.inferDescription(name),
              htmlUrl: item.url,
              branch,
              version,
            });
          }
        }
      } catch (err) {
        logger.debug({ area, branch, err }, "Could not list SDK area — skipping");
      }
    }

    const index: SDKIndex = {
      version,
      branch,
      downloadedAt: new Date().toISOString(),
      indexedAreas: SDK_AREAS,
      samples,
    };

    await this.saveIndex(index);
    return index;
  }

  private classifyArea(filePath: string): string {
    if (filePath.startsWith("src/StoreCommerce")) return "POS";
    if (filePath.startsWith("src/ScaleUnit")) return "CRT+RetailServer";
    if (filePath.startsWith("src/FiscalIntegration")) return "FiscalIntegration";
    if (filePath.startsWith("src/HardwareStation")) return "HardwareStation";
    return "General";
  }

  private inferDescription(name: string): string {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .trim();
  }

  private isStale(downloadedAt: string): boolean {
    return Date.now() - new Date(downloadedAt).getTime() > CACHE_TTL_MS;
  }

  private async loadIndex(): Promise<SDKIndex | null> {
    try {
      const raw = await fs.readFile(this.indexPath, "utf-8");
      return JSON.parse(raw) as SDKIndex;
    } catch {
      return null;
    }
  }

  private async saveIndex(index: SDKIndex): Promise<void> {
    await fs.mkdir(this.sdkDir, { recursive: true });
    await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2), "utf-8");
    logger.info({ samples: index.samples.length }, "SDK index saved");
  }
}
