import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { WorkspaceAnalyzer } from "../../core/WorkspaceAnalyzer.js";

export const AnalyzeWorkspaceSchema = z.object({
  workspacePath: z.string().min(1).describe("Absolute path to the workspace root"),
  force: z.boolean().optional().default(false).describe("Force full rebuild even if cache is fresh"),
});

export type AnalyzeWorkspaceInput = z.infer<typeof AnalyzeWorkspaceSchema>;

const analyzer = new WorkspaceAnalyzer();

export const AnalyzeWorkspaceTool: RegisteredTool = {
  definition: {
    name: "AnalyzeWorkspace",
    description:
      "Scans the given workspace and builds a complete model of the Dynamics 365 Commerce project: " +
      "version, SDK, extensions, triggers, operations, dialogs, views, CRT services, " +
      "Retail Server APIs, and Hardware Station extensions. Writes the result to .mcp/workspace-analysis.json.",
  },
  schema: AnalyzeWorkspaceSchema,
  handler: async (input: unknown) => {
    const { workspacePath, force } = input as AnalyzeWorkspaceInput;
    const { index, fromCache } = await analyzer.analyze(workspacePath, force);

    return {
      fromCache,
      version: index.version,
      lastUpdated: index.lastUpdated,
      summary: {
        operations: index.operations.length,
        triggers: index.triggers.length,
        requests: index.requests.length,
        responses: index.responses.length,
        dialogs: index.dialogs.length,
        views: index.views.length,
        controls: index.controls.length,
        crtServices: index.crt.length,
        retailServerApis: index.retailServer.length,
        hardwareStationExtensions: index.hardwareStation.length,
      },
      index,
    };
  },
};
