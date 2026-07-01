import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { buildSearchContext } from "../../sources/SearchContext.js";

export const SearchMicrosoftLearnSchema = z.object({
  query: z.string().min(1),
  version: z.string().optional().describe("Commerce version e.g. '10.0.46'. Auto-detected if omitted."),
  workspacePath: z.string().optional(),
  maxResults: z.number().int().min(1).max(20).optional().default(5),
  fetchPageContent: z.boolean().optional().default(false).describe("Also fetch and parse the top result pages"),
});

export type SearchMicrosoftLearnInput = z.infer<typeof SearchMicrosoftLearnSchema>;

export const SearchMicrosoftLearnTool: RegisteredTool = {
  definition: {
    name: "SearchMicrosoftLearn",
    description:
      "Searches Microsoft Learn for official Dynamics 365 Commerce documentation. " +
      "Always returns sourceUrl and retrievedAt. Never returns results without a verified source.",
  },
  schema: SearchMicrosoftLearnSchema,
  handler: async (input: unknown) => {
    const { query, version, workspacePath, maxResults, fetchPageContent } =
      input as SearchMicrosoftLearnInput;

    const ctx = await buildSearchContext(workspacePath, version);

    if (fetchPageContent) {
      const { results, pages } = await ctx.learn.searchWithContent(query, {
        maxResults,
        enrichTop: 3,
      });
      return {
        query,
        version: ctx.version.version,
        confidence: ctx.version.confidence,
        resultCount: results.length,
        results,
        pages,
        source: "Microsoft Learn",
      };
    }

    const results = await ctx.learn.search(query, { maxResults });
    return {
      query,
      version: ctx.version.version,
      confidence: ctx.version.confidence,
      resultCount: results.length,
      results,
      source: "Microsoft Learn",
    };
  },
};
