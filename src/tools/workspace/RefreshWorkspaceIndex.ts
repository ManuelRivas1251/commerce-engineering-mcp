import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { WorkspaceAnalyzer } from "../../core/WorkspaceAnalyzer.js";

export const RefreshWorkspaceIndexSchema = z.object({
  workspacePath: z.string().min(1),
  force: z.boolean().optional().default(false).describe("Force full rebuild even if index is fresh"),
});

export type RefreshWorkspaceIndexInput = z.infer<typeof RefreshWorkspaceIndexSchema>;

const analyzer = new WorkspaceAnalyzer();

export const RefreshWorkspaceIndexTool: RegisteredTool = {
  definition: {
    name: "RefreshWorkspaceIndex",
    description:
      "Forces a full rebuild of the local .mcp/ index for the given workspace. " +
      "Use after adding new files, changing the SDK version, or when the index appears stale.",
    inputSchema: {
      type: "object",
      properties: {
        workspacePath: { type: "string", description: "Absolute path to the workspace root" },
        force: { type: "boolean", description: "Force rebuild even if index is fresh" },
      },
      required: ["workspacePath"],
    },
  },
  schema: RefreshWorkspaceIndexSchema,
  handler: async (input: unknown) => {
    const { workspacePath, force } = input as RefreshWorkspaceIndexInput;
    const { index } = await analyzer.analyze(workspacePath, force ?? true);

    return {
      refreshed: true,
      lastUpdated: index.lastUpdated,
      version: index.version,
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
    };
  },
};
