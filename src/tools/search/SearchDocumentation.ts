import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { buildSearchContext } from "../../sources/SearchContext.js";

export const SearchDocumentationSchema = z.object({
  query: z.string().min(1),
  sources: z
    .array(z.enum(["MicrosoftLearn", "GitHub", "SDK"]))
    .optional()
    .default(["MicrosoftLearn", "GitHub", "SDK"]),
  workspacePath: z.string().optional(),
  version: z.string().optional(),
  maxResults: z.number().int().min(1).max(20).optional().default(5),
});

export type SearchDocumentationInput = z.infer<typeof SearchDocumentationSchema>;

export const SearchDocumentationTool: RegisteredTool = {
  definition: {
    name: "SearchDocumentation",
    description:
      "Searches all official sources (Microsoft Learn, GitHub, local SDK cache) simultaneously " +
      "and returns merged, deduplicated results with mandatory source citations.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        sources: {
          type: "array",
          items: { type: "string", enum: ["MicrosoftLearn", "GitHub", "SDK"] },
        },
        workspacePath: { type: "string" },
        version: { type: "string" },
        maxResults: { type: "number" },
      },
      required: ["query"],
    },
  },
  schema: SearchDocumentationSchema,
  handler: async (input: unknown) => {
    const { query, sources, workspacePath, version, maxResults } =
      input as SearchDocumentationInput;

    const ctx = await buildSearchContext(workspacePath, version);
    const activeSources = sources ?? ["MicrosoftLearn", "GitHub", "SDK"];
    const retrievedAt = new Date().toISOString();

    // Fan out to all requested sources in parallel
    const [learnResults, githubResults, sdkSamples] = await Promise.all([
      activeSources.includes("MicrosoftLearn")
        ? ctx.learn.search(query, { maxResults })
        : Promise.resolve([]),
      activeSources.includes("GitHub")
        ? ctx.github.searchCode(query, ctx.branch, { maxResults })
        : Promise.resolve([]),
      activeSources.includes("SDK")
        ? ctx.sdk.searchSamples(query, ctx.branch, ctx.version.version)
        : Promise.resolve([]),
    ]);

    const githubNote = !ctx.github.hasToken() && activeSources.includes("GitHub")
      ? "GitHub Code Search requires a GITHUB_TOKEN env variable. Tree/content endpoints work without it."
      : undefined;

    // Build a deduplicated flat list across all sources (by URL)
    const seen = new Set<string>();
    const merged: Array<{
      title: string;
      url: string;
      description: string;
      source: "MicrosoftLearn" | "GitHub" | "SDK";
      retrievedAt: string;
    }> = [];

    for (const r of learnResults) {
      if (r.url && !seen.has(r.url)) {
        seen.add(r.url);
        merged.push({ title: r.title, url: r.url, description: r.description, source: "MicrosoftLearn", retrievedAt });
      }
    }
    for (const r of githubResults) {
      if (r.htmlUrl && !seen.has(r.htmlUrl)) {
        seen.add(r.htmlUrl);
        merged.push({ title: r.name, url: r.htmlUrl, description: r.path, source: "GitHub", retrievedAt });
      }
    }
    for (const r of sdkSamples) {
      if (r.htmlUrl && !seen.has(r.htmlUrl)) {
        seen.add(r.htmlUrl);
        merged.push({ title: r.name, url: r.htmlUrl, description: r.description, source: "SDK", retrievedAt });
      }
    }

    return {
      query,
      version: ctx.version.version,
      branch: ctx.branch,
      confidence: ctx.version.confidence,
      retrievedAt,
      ...(githubNote ? { githubNote } : {}),
      merged: merged.slice(0, maxResults),
      mergedCount: merged.length,
      sources: {
        microsoftLearn: {
          active: activeSources.includes("MicrosoftLearn"),
          results: learnResults,
          count: learnResults.length,
        },
        github: {
          active: activeSources.includes("GitHub"),
          authenticated: ctx.github.hasToken(),
          results: githubResults.map((r) => ({
            name: r.name,
            path: r.path,
            htmlUrl: r.htmlUrl,
            sourceUrl: r.htmlUrl,
            retrievedAt,
          })),
          count: githubResults.length,
        },
        sdk: {
          active: activeSources.includes("SDK"),
          results: sdkSamples.slice(0, maxResults),
          count: sdkSamples.length,
        },
      },
    };
  },
};
