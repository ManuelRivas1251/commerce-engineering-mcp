import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { WorkspaceAnalyzer } from "../../core/WorkspaceAnalyzer.js";

export const ListExistingDialogsSchema = z.object({ workspacePath: z.string().min(1) });

const analyzer = new WorkspaceAnalyzer();

export const ListExistingDialogsTool: RegisteredTool = {
  definition: {
    name: "ListExistingDialogs",
    description: "Returns all custom POS Dialogs detected in the workspace from the local index.",
  },
  schema: ListExistingDialogsSchema,
  handler: async (input: unknown) => {
    const { workspacePath } = input as { workspacePath: string };
    const { index } = await analyzer.analyze(workspacePath);
    return { count: index.dialogs.length, dialogs: index.dialogs };
  },
};
