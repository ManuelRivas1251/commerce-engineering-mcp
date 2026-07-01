import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { buildSearchContext } from "../../sources/SearchContext.js";

export const SearchSDKSchema = z.object({
  query: z.string().min(1),
  area: z.enum(["POS", "CRT", "RetailServer", "HardwareStation", "All"]).optional().default("All"),
  workspacePath: z.string().optional(),
  version: z.string().optional(),
});

export type SearchSDKInput = z.infer<typeof SearchSDKSchema>;

// Maps area to the directory paths to search in GitHub
const AREA_PATHS: Record<string, string[]> = {
  POS: ["src/StoreCommerce"],
  CRT: ["src/ScaleUnit"],
  RetailServer: ["src/ScaleUnit"],
  HardwareStation: ["src/HardwareStation"],
  All: ["src/StoreCommerce", "src/ScaleUnit", "src/HardwareStation", "src/FiscalIntegration"],
};

export const SearchSDKTool: RegisteredTool = {
  definition: {
    name: "SearchSDK",
    description:
      "Searches the local SDK cache or the official GitHub repository for SDK types, " +
      "interfaces, and APIs in the correct Commerce version branch.",
  },
  schema: SearchSDKSchema,
  handler: async (input: unknown) => {
    const { query, area, workspacePath, version } = input as SearchSDKInput;

    const ctx = await buildSearchContext(workspacePath, version);
    const paths = AREA_PATHS[area ?? "All"] ?? AREA_PATHS["All"]!;

    // Search SDK cache
    const sdkSamples = await ctx.sdk.searchSamples(query, ctx.branch, ctx.version.version);
    const relevantSamples = sdkSamples.filter((s) =>
      area === "All" ? true : s.area.includes(area ?? "")
    );

    // Also search GitHub code directly for the query in the relevant paths
    const githubResults = await ctx.github.searchCode(
      `${query} path:${paths[0]}`,
      ctx.branch,
      { maxResults: 8 }
    );

    return {
      query,
      area,
      version: ctx.version.version,
      branch: ctx.branch,
      confidence: ctx.version.confidence,
      sdkSamples: relevantSamples,
      githubMatches: githubResults.map((r) => ({
        name: r.name,
        path: r.path,
        htmlUrl: r.htmlUrl,
      })),
      repoUrl: `https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${ctx.branch}`,
    };
  },
};
