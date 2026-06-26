import { fetch } from "undici";
import { logger } from "../core/Logger.js";

const GITHUB_API = "https://api.github.com";
const REPO = "microsoft/Dynamics365Commerce.Solutions";
const DEFAULT_BRANCH = "release/10.0.46";

export interface GitHubSearchResult {
  name: string;
  path: string;
  url: string;
  htmlUrl: string;
  repository: string;
  branch: string;
  snippet?: string;
}

export interface GitHubFileContent {
  path: string;
  content: string;
  htmlUrl: string;
  size: number;
}

export interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  url: string;
}

export class GitHubClient {
  private readonly token: string | undefined;
  private readonly rateLimit = new RateLimiter(25, 60_000); // 25 req/min without token

  constructor() {
    this.token = process.env["GITHUB_TOKEN"];
    if (!this.token) {
      logger.warn("GITHUB_TOKEN not set — GitHub API calls are rate-limited to 60 req/hour");
    }
  }

  // Search code inside the Commerce Solutions repo scoped to a branch.
  async searchCode(
    query: string,
    branch: string,
    options: { maxResults?: number; path?: string } = {}
  ): Promise<GitHubSearchResult[]> {
    await this.rateLimit.acquire();

    const scopedQuery = `${query} repo:${REPO}`;
    const params = new URLSearchParams({
      q: scopedQuery,
      per_page: String(Math.min(options.maxResults ?? 10, 30)),
    });

    const url = `${GITHUB_API}/search/code?${params}`;
    try {
      const data = await this.get<{ items: GitHubCodeItem[] }>(url);
      return (data.items ?? []).map((item) => ({
        name: item.name,
        path: item.path,
        url: item.url,
        htmlUrl: item.html_url,
        repository: REPO,
        branch,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("401") || msg.includes("403")) {
        logger.warn(
          "GitHub Code Search requires a GITHUB_TOKEN. " +
          "Set the GITHUB_TOKEN environment variable to enable code search. " +
          "Tree and content endpoints will still work unauthenticated."
        );
        return [];
      }
      throw err;
    }
  }

  // Get file contents from the repo at a specific branch.
  async getFileContent(filePath: string, branch: string): Promise<GitHubFileContent | null> {
    await this.rateLimit.acquire();

    const url = `${GITHUB_API}/repos/${REPO}/contents/${encodeURIPath(filePath)}?ref=${encodeURIComponent(branch)}`;
    try {
      const data = await this.get<GitHubContentItem>(url);
      if (data.type !== "file" || !data.content) return null;

      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return {
        path: filePath,
        content,
        htmlUrl: data.html_url,
        size: data.size,
      };
    } catch (err) {
      logger.debug({ filePath, branch, err }, "File not found in GitHub");
      return null;
    }
  }

  // List the tree of a directory at a specific branch (non-recursive).
  async listTree(dirPath: string, branch: string): Promise<GitHubTreeItem[]> {
    await this.rateLimit.acquire();

    const url = `${GITHUB_API}/repos/${REPO}/contents/${encodeURIPath(dirPath)}?ref=${encodeURIComponent(branch)}`;
    try {
      const data = await this.get<GitHubContentItem[]>(url);
      if (!Array.isArray(data)) return [];

      return data.map((item) => ({
        path: item.path,
        type: item.type === "dir" ? "tree" : "blob",
        url: item.html_url,
      }));
    } catch {
      return [];
    }
  }

  // Get the full recursive tree of a directory (uses git trees API).
  async getFullTree(dirPath: string, branch: string): Promise<GitHubTreeItem[]> {
    await this.rateLimit.acquire();

    // First get the tree SHA for the given path
    const contentsUrl = `${GITHUB_API}/repos/${REPO}/contents/${encodeURIPath(dirPath)}?ref=${encodeURIComponent(branch)}`;
    try {
      // Get the commit SHA for the branch
      const refUrl = `${GITHUB_API}/repos/${REPO}/git/ref/heads/${encodeURIComponent(branch)}`;
      const refData = await this.get<{ object: { sha: string } }>(refUrl);
      const commitSha = refData.object.sha;

      // Get the tree recursively
      const treeUrl = `${GITHUB_API}/repos/${REPO}/git/trees/${commitSha}?recursive=1`;
      const treeData = await this.get<{ tree: GitHubTreeItemRaw[] }>(treeUrl);

      return (treeData.tree ?? [])
        .filter((item) => item.path.startsWith(dirPath))
        .map((item) => ({
          path: item.path,
          type: item.type === "tree" ? "tree" : "blob",
          url: `https://github.com/${REPO}/blob/${branch}/${item.path}`,
        }));
    } catch (err) {
      logger.debug({ dirPath, branch, err }, "getFullTree failed — falling back to listTree");
      return this.listTree(dirPath, branch);
    }
  }

  // Search for samples in known sample directories.
  async searchSamples(
    query: string,
    branch: string,
    maxResults = 10
  ): Promise<GitHubSearchResult[]> {
    const sampleDirs = [
      "src/StoreCommerce",
      "src/ScaleUnit",
      "src/FiscalIntegration",
      "src/HardwareStation",
    ];

    const results: GitHubSearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const dir of sampleDirs) {
      if (results.length >= maxResults) break;
      try {
        const tree = await this.listTree(dir, branch);
        for (const item of tree) {
          if (results.length >= maxResults) break;
          if (item.path.toLowerCase().includes(lowerQuery) || item.type === "tree") {
            results.push({
              name: item.path.split("/").pop() ?? item.path,
              path: item.path,
              url: item.url,
              htmlUrl: item.url,
              repository: REPO,
              branch,
            });
          }
        }
      } catch {
        // dir not found for this branch — skip
      }
    }

    return results;
  }

  // Returns true when the token is set (required for code search).
  hasToken(): boolean {
    return !!this.token;
  }

  // Verify a branch exists in the repo.
  async branchExists(branch: string): Promise<boolean> {
    await this.rateLimit.acquire();
    try {
      const url = `${GITHUB_API}/repos/${REPO}/branches/${encodeURIComponent(branch)}`;
      await this.get(url);
      return true;
    } catch {
      return false;
    }
  }

  // List available release branches (release/10.0.X).
  async listReleaseBranches(): Promise<string[]> {
    await this.rateLimit.acquire();
    try {
      const url = `${GITHUB_API}/repos/${REPO}/branches?per_page=100`;
      const data = await this.get<{ name: string }[]>(url);
      return (data ?? [])
        .map((b) => b.name)
        .filter((n) => /^release\/10\.\d+\.\d+/.test(n))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }

  private async get<T>(url: string, attempt = 0): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "commerce-engineering-mcp/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    } catch (err) {
      // Retry on network / timeout errors (not on auth failures)
      if (attempt < 2) {
        await new Promise<void>((r) => setTimeout(r, 300 * (2 ** attempt)));
        return this.get<T>(url, attempt + 1);
      }
      throw err;
    }

    if (!response.ok) {
      const body = await response.text();
      // Retry on transient server errors
      if (response.status >= 500 && attempt < 2) {
        await new Promise<void>((r) => setTimeout(r, 300 * (2 ** attempt)));
        return this.get<T>(url, attempt + 1);
      }
      throw new Error(`GitHub API ${response.status}: ${body.slice(0, 200)}`);
    }

    return response.json() as Promise<T>;
  }
}

// ── Internal types ────────────────────────────────────────────────────────────

interface GitHubCodeItem {
  name: string;
  path: string;
  url: string;
  html_url: string;
}

interface GitHubContentItem {
  name: string;
  path: string;
  type: string;
  content?: string;
  encoding?: string;
  html_url: string;
  size: number;
}

interface GitHubTreeItemRaw {
  path: string;
  type: string;
  url: string;
}

// ── Rate limiter ──────────────────────────────────────────────────────────────

class RateLimiter {
  private readonly queue: number[] = [];

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  async acquire(): Promise<void> {
    const now = Date.now();
    // Remove requests outside the window
    while (this.queue.length > 0 && now - (this.queue[0] ?? 0) > this.windowMs) {
      this.queue.shift();
    }

    if (this.queue.length >= this.maxRequests) {
      const oldest = this.queue[0] ?? now;
      const waitMs = this.windowMs - (now - oldest) + 50;
      logger.debug({ waitMs }, "Rate limit — waiting");
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    this.queue.push(Date.now());
  }
}

function encodeURIPath(p: string): string {
  return p.split("/").map(encodeURIComponent).join("/");
}
