import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { WorkspaceAnalyzer } from "../../core/WorkspaceAnalyzer.js";

export const ListExistingOperationsSchema = z.object({ workspacePath: z.string().min(1) });

const analyzer = new WorkspaceAnalyzer();

export const ListExistingOperationsTool: RegisteredTool = {
  definition: {
    name: "ListExistingOperations",
    description: "Returns all custom POS operations detected in the workspace from the local index.",
  },
  schema: ListExistingOperationsSchema,
  handler: async (input: unknown) => {
    const { workspacePath } = input as { workspacePath: string };
    const { index } = await analyzer.analyze(workspacePath);
    return { count: index.operations.length, operations: index.operations };
  },
};
