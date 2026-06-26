import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { buildSearchContext } from "../../sources/SearchContext.js";

export const SearchOfficialSamplesSchema = z.object({
  query: z.string().min(1),
  version: z.string().optional(),
  workspacePath: z.string().optional(),
  maxResults: z.number().int().min(1).max(30).optional().default(10),
});

export type SearchOfficialSamplesInput = z.infer<typeof SearchOfficialSamplesSchema>;

export const SearchOfficialSamplesTool: RegisteredTool = {
  definition: {
    name: "SearchOfficialSamples",
    description:
      "Searches the official Microsoft/Dynamics365Commerce.Solutions repository for samples " +
      "matching the detected or specified Commerce version. Uses the local SDK cache first, " +
      "then falls back to GitHub API. Returns sample path, description, and GitHub URL.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        version: { type: "string", description: "Commerce version (auto-detected if omitted)" },
        workspacePath: { type: "string", description: "Used to auto-detect version if not provided" },
        maxResults: { type: "number" },
      },
      required: ["query"],
    },
  },
  schema: SearchOfficialSamplesSchema,
  handler: async (input: unknown) => {
    const { query, version, workspacePath, maxResults } = input as SearchOfficialSamplesInput;

    const ctx = await buildSearchContext(workspacePath, version);

    if (ctx.version.confidence === "UNKNOWN") {
      return {
        warning:
          "Commerce version could not be determined. Searching in 'main' branch. " +
          "Provide 'version' or 'workspacePath' for version-accurate results.",
        query,
        branch: ctx.branch,
        samples: [],
      };
    }

    // SDK cache first
    const sdkSamples = await ctx.sdk.searchSamples(query, ctx.branch, ctx.version.version);

    // If SDK cache has results use them; otherwise hit GitHub directly
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
            version: ctx.version.version,
          }));

    return {
      query,
      version: ctx.version.version,
      branch: ctx.branch,
      detectedFrom: ctx.version.detectedFrom,
      resultCount: samples.length,
      samples,
      source: sdkSamples.length > 0 ? "SDK Cache" : "GitHub API",
      repoUrl: `https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${ctx.branch}`,
    };
  },
};
