import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { WorkspaceAnalyzer } from "../../core/WorkspaceAnalyzer.js";

export const ListExistingViewsSchema = z.object({ workspacePath: z.string().min(1) });

const analyzer = new WorkspaceAnalyzer();

export const ListExistingViewsTool: RegisteredTool = {
  definition: {
    name: "ListExistingViews",
    description: "Returns all custom POS Views detected in the workspace from the local index.",
    inputSchema: {
      type: "object",
      properties: { workspacePath: { type: "string" } },
      required: ["workspacePath"],
    },
  },
  schema: ListExistingViewsSchema,
  handler: async (input: unknown) => {
    const { workspacePath } = input as { workspacePath: string };
    const { index } = await analyzer.analyze(workspacePath);
    return { count: index.views.length, views: index.views };
  },
};
