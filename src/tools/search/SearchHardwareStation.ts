import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { buildSearchContext } from "../../sources/SearchContext.js";

export const SearchHardwareStationSchema = z.object({
  query: z.string().min(1),
  workspacePath: z.string().optional(),
  version: z.string().optional(),
  maxResults: z.number().int().min(1).max(20).optional().default(8),
});

export type SearchHardwareStationInput = z.infer<typeof SearchHardwareStationSchema>;

export const SearchHardwareStationTool: RegisteredTool = {
  definition: {
    name: "SearchHardwareStation",
    description:
      "Searches for official Hardware Station extension APIs, device handlers, " +
      "and peripheral integration patterns for the detected Commerce version.",
  },
  schema: SearchHardwareStationSchema,
  handler: async (input: unknown) => {
    const { query, workspacePath, version, maxResults } = input as SearchHardwareStationInput;

    const ctx = await buildSearchContext(workspacePath, version);

    const [githubResults, learnResults] = await Promise.all([
      ctx.github.searchCode(`${query} path:src/HardwareStation`, ctx.branch, { maxResults }),
      ctx.learn.search(`Dynamics 365 Commerce Hardware Station ${query}`, { maxResults: 3 }),
    ]);

    return {
      query,
      area: "HardwareStation",
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
      repoUrl: `https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${ctx.branch}/src/HardwareStation`,
    };
  },
};
