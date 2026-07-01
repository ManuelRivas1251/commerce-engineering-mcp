import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { buildSearchContext } from "../../sources/SearchContext.js";

export const SearchSamplesByVersionSchema = z.object({
  query: z.string().min(1),
  version: z.string().describe("Commerce version e.g. '10.0.46'"),
  maxResults: z.number().int().min(1).max(30).optional().default(10),
});

export type SearchSamplesByVersionInput = z.infer<typeof SearchSamplesByVersionSchema>;

export const SearchSamplesByVersionTool: RegisteredTool = {
  definition: {
    name: "SearchSamplesByVersion",
    description:
      "Searches for official samples in Dynamics365Commerce.Solutions scoped strictly to the " +
      "specified version branch. Never returns samples from a different version.",
  },
  schema: SearchSamplesByVersionSchema,
  handler: async (input: unknown) => {
    const { query, version, maxResults } = input as SearchSamplesByVersionInput;

    const ctx = await buildSearchContext(undefined, version);

    // Verify the branch actually exists
    const branchExists = await ctx.github.branchExists(ctx.branch);
    if (!branchExists) {
      const available = await ctx.github.listReleaseBranches();
      return {
        error: `Branch '${ctx.branch}' does not exist in Dynamics365Commerce.Solutions.`,
        availableBranches: available.slice(0, 10),
        suggestion: available[0]
          ? `Closest available: '${available[0]}'`
          : "Check the repository for available release branches.",
      };
    }

    const sdkSamples = await ctx.sdk.searchSamples(query, ctx.branch, version);
    const samples =
      sdkSamples.length > 0
        ? sdkSamples.slice(0, maxResults)
        : (await ctx.github.searchSamples(query, ctx.branch, maxResults)).map((r) => ({
            name: r.name,
            path: r.path,
            area: "Unknown",
            description: r.name,
            htmlUrl: r.htmlUrl,
            branch: r.branch,
            version,
          }));

    return {
      query,
      version,
      branch: ctx.branch,
      branchVerified: true,
      resultCount: samples.length,
      samples,
      repoUrl: `https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${ctx.branch}`,
    };
  },
};
