import type { ZodSchema } from "zod";
import { logger } from "./Logger.js";

// The JSON Schema exposed to clients is derived from each tool's Zod schema
// by the MCP SDK — never hand-written, so it cannot drift.
export interface ToolDefinition {
  name: string;
  description: string;
}

export interface RegisteredTool {
  definition: ToolDefinition;
  schema: ZodSchema;
  handler: (input: unknown) => Promise<unknown>;
}

export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  register(tool: RegisteredTool): void {
    if (this.tools.has(tool.definition.name)) {
      logger.warn({ name: tool.definition.name }, "Tool already registered — overwriting");
    }
    this.tools.set(tool.definition.name, tool);
    logger.debug({ name: tool.definition.name }, "Tool registered");
  }

  get(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  listDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  // Input is validated by the MCP SDK against the tool's Zod shape before the
  // server calls dispatch, so it is not re-parsed here. Callers outside the
  // SDK pipeline (e.g. tests) must validate with `tool.schema` themselves.
  async dispatch(name: string, input: unknown): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    logger.info({ tool: name }, "Dispatching tool");
    return tool.handler(input);
  }
}
