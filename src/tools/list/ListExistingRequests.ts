import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { WorkspaceAnalyzer } from "../../core/WorkspaceAnalyzer.js";

export const ListExistingRequestsSchema = z.object({ workspacePath: z.string().min(1) });

const analyzer = new WorkspaceAnalyzer();

export const ListExistingRequestsTool: RegisteredTool = {
  definition: {
    name: "ListExistingRequests",
    description: "Returns all custom CRT/POS Requests detected in the workspace from the local index.",
  },
  schema: ListExistingRequestsSchema,
  handler: async (input: unknown) => {
    const { workspacePath } = input as { workspacePath: string };
    const { index } = await analyzer.analyze(workspacePath);
    return { count: index.requests.length, requests: index.requests };
  },
};
