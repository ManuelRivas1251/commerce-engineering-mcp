import { fetch } from "undici";
import { load as cheerioLoad } from "cheerio";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { logger } from "../core/Logger.js";

const MS_LEARN_SEARCH_API = "https://learn.microsoft.com/api/search";
const MS_LEARN_BASE = "https://learn.microsoft.com";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface LearnSearchResult {
  title: string;
  url: string;
  description: string;
  sourceUrl: string;
  retrievedAt: string;
}

export interface LearnPageContent {
  title: string;
  url: string;
  headings: string[];
  codeBlocks: string[];
  summary: string;
  sourceUrl: string;
  retrievedAt: string;
}

export class MicrosoftLearnClient {
  private readonly cacheDir: string;

  constructor(mcpDir: string) {
    this.cacheDir = path.join(mcpDir, "docs-cache");
  }

  async search(
    query: string,
    options: { maxResults?: number; locale?: string } = {}
  ): Promise<LearnSearchResult[]> {
    const cacheKey = this.cacheKey(`search:${query}:${options.maxResults ?? 5}`);
    const cached = await this.loadCache<LearnSearchResult[]>(cacheKey);
    if (cached) return cached;

    // Add "store commerce" context if not already in the query to improve relevance
    const scopedQuery =
      query.toLowerCase().includes("commerce") || query.toLowerCase().includes("dynamics")
        ? query
        : `store commerce ${query}`;

    const params = new URLSearchParams({
      search: scopedQuery,
      locale: options.locale ?? "en-us",
      $top: String(Math.min(options.maxResults ?? 5, 20)),
      scope: "Dynamics 365",
    });

    const url = `${MS_LEARN_SEARCH_API}?${params}`;
    logger.debug({ url }, "Searching Microsoft Learn");

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "commerce-engineering-mcp/1.0" },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, "Microsoft Learn search failed");
        return [];
      }

      const data = (await response.json()) as MsLearnSearchResponse;
      const retrievedAt = new Date().toISOString();

      const results: LearnSearchResult[] = (data.results ?? []).map((item) => ({
        title: item.title ?? "",
        url: this.normaliseUrl(item.url ?? ""),
        description: item.description ?? "",
        sourceUrl: this.normaliseUrl(item.url ?? ""),
        retrievedAt,
      }));

      await this.saveCache(cacheKey, results);
      return results;
    } catch (err) {
      logger.warn({ err }, "Microsoft Learn search error");
      return [];
    }
  }

  async fetchPage(pageUrl: string): Promise<LearnPageContent | null> {
    const cacheKey = this.cacheKey(`page:${pageUrl}`);
    const cached = await this.loadCache<LearnPageContent>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(pageUrl, {
        headers: {
          "User-Agent": "commerce-engineering-mcp/1.0",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) return null;

      const html = await response.text();
      const $ = cheerioLoad(html);
      const retrievedAt = new Date().toISOString();

      // Extract title
      const title =
        $("h1").first().text().trim() ||
        $("title").text().replace(" | Microsoft Learn", "").trim();

      // Extract headings
      const headings: string[] = [];
      $("h2, h3").each((_, el) => {
        const text = $(el).text().trim();
        if (text) headings.push(text);
      });

      // Extract code blocks
      const codeBlocks: string[] = [];
      $("pre code, code.lang-csharp, code.lang-typescript, code.lang-javascript").each((_, el) => {
        const code = $(el).text().trim();
        if (code.length > 20 && codeBlocks.length < 10) {
          codeBlocks.push(code);
        }
      });

      // Extract summary (first meaningful paragraph)
      let summary = "";
      $("p").each((_, el) => {
        if (!summary) {
          const text = $(el).text().trim();
          if (text.length > 40) summary = text.slice(0, 500);
        }
      });

      const content: LearnPageContent = {
        title,
        url: pageUrl,
        headings,
        codeBlocks,
        summary,
        sourceUrl: pageUrl,
        retrievedAt,
      };

      await this.saveCache(cacheKey, content);
      return content;
    } catch (err) {
      logger.debug({ pageUrl, err }, "Failed to fetch MS Learn page");
      return null;
    }
  }

  // Search and enrich top results with page content.
  async searchWithContent(
    query: string,
    options: { maxResults?: number; enrichTop?: number } = {}
  ): Promise<{ results: LearnSearchResult[]; pages: LearnPageContent[] }> {
    const results = await this.search(query, { maxResults: options.maxResults ?? 5 });
    const enrichTop = options.enrichTop ?? 2;

    const pages = await Promise.all(
      results.slice(0, enrichTop).map((r) => this.fetchPage(r.url))
    );

    return {
      results,
      pages: pages.filter((p): p is LearnPageContent => p !== null),
    };
  }

  // ── Cache helpers ──────────────────────────────────────────────────────────

  private cacheKey(input: string): string {
    return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
  }

  private cachePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  private async loadCache<T>(key: string): Promise<T | null> {
    try {
      const filePath = this.cachePath(key);
      const stat = await fs.stat(filePath);
      if (Date.now() - stat.mtimeMs > CACHE_TTL_MS) return null;
      const raw = await fs.readFile(filePath, "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private async saveCache<T>(key: string, data: T): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      await fs.writeFile(this.cachePath(key), JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      logger.debug({ err }, "Failed to save MS Learn cache");
    }
  }

  private normaliseUrl(url: string): string {
    if (url.startsWith("http")) return url;
    return `${MS_LEARN_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  }
}

// ── Response types ─────────────────────────────────────────────────────────

interface MsLearnSearchResponse {
  results?: {
    title?: string;
    url?: string;
    description?: string;
  }[];
}
