import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { buildSearchContext } from "../../sources/SearchContext.js";

export const SearchCRTApiSchema = z.object({
  query: z.string().min(1),
  workspacePath: z.string().optional(),
  version: z.string().optional(),
  maxResults: z.number().int().min(1).max(20).optional().default(8),
});

export type SearchCRTApiInput = z.infer<typeof SearchCRTApiSchema>;

export const SearchCRTApiTool: RegisteredTool = {
  definition: {
    name: "SearchCRTApi",
    description:
      "Searches for official Commerce Runtime (CRT) APIs, services, request handlers, " +
      "and extension points for the detected Commerce version.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        workspacePath: { type: "string" },
        version: { type: "string" },
        maxResults: { type: "number" },
      },
      required: ["query"],
    },
  },
  schema: SearchCRTApiSchema,
  handler: async (input: unknown) => {
    const { query, workspacePath, version, maxResults } = input as SearchCRTApiInput;

    const ctx = await buildSearchContext(workspacePath, version);

    const [githubResults, learnResults] = await Promise.all([
      ctx.github.searchCode(`${query} path:src/ScaleUnit`, ctx.branch, { maxResults }),
      ctx.learn.search(`Dynamics 365 Commerce Runtime CRT ${query}`, { maxResults: 3 }),
    ]);

    return {
      query,
      area: "CRT",
      version: ctx.version.version,
      branch: ctx.branch,
      confidence: ctx.version.confidence,
      githubMatches: githubResults.map((r) => ({
        name: r.name,
        path: r.path,
        htmlUrl: r.htmlUrl,
        sourceUrl: r.htmlUrl,
        retrievedAt: new Date().toISOString(),
      })),
      documentation: learnResults,
      repoUrl: `https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${ctx.branch}/src/ScaleUnit`,
    };
  },
};
