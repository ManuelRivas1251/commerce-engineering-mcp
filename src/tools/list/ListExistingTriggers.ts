import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { WorkspaceAnalyzer } from "../../core/WorkspaceAnalyzer.js";

export const ListExistingTriggersSchema = z.object({ workspacePath: z.string().min(1) });

const analyzer = new WorkspaceAnalyzer();

export const ListExistingTriggersTool: RegisteredTool = {
  definition: {
    name: "ListExistingTriggers",
    description: "Returns all POS triggers detected in the workspace from the local index.",
    inputSchema: {
      type: "object",
      properties: { workspacePath: { type: "string" } },
      required: ["workspacePath"],
    },
  },
  schema: ListExistingTriggersSchema,
  handler: async (input: unknown) => {
    const { workspacePath } = input as { workspacePath: string };
    const { index } = await analyzer.analyze(workspacePath);
    return { count: index.triggers.length, triggers: index.triggers };
  },
};
