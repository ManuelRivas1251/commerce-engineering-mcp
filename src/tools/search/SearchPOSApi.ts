import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { buildSearchContext } from "../../sources/SearchContext.js";

export const SearchPOSApiSchema = z.object({
  query: z.string().min(1),
  workspacePath: z.string().optional(),
  version: z.string().optional(),
  maxResults: z.number().int().min(1).max(20).optional().default(8),
});

export type SearchPOSApiInput = z.infer<typeof SearchPOSApiSchema>;

export const SearchPOSApiTool: RegisteredTool = {
  definition: {
    name: "SearchPOSApi",
    description:
      "Searches for official Store Commerce POS APIs, operations, triggers, " +
      "request/response types, and interfaces for the detected Commerce version.",
  },
  schema: SearchPOSApiSchema,
  handler: async (input: unknown) => {
    const { query, workspacePath, version, maxResults } = input as SearchPOSApiInput;

    const ctx = await buildSearchContext(workspacePath, version);

    const [githubResults, learnResults] = await Promise.all([
      ctx.github.searchCode(`${query} path:src/StoreCommerce`, ctx.branch, { maxResults }),
      ctx.learn.search(`Dynamics 365 Commerce POS ${query}`, { maxResults: 3 }),
    ]);

    return {
      query,
      area: "POS",
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
      repoUrl: `https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${ctx.branch}/src/StoreCommerce`,
    };
  },
};
