import type { ZodSchema } from "zod";
import { logger } from "./Logger.js";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
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

  async dispatch(name: string, rawInput: unknown): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    const parsed = tool.schema.safeParse(rawInput);
    if (!parsed.success) {
      throw new Error(`Invalid input for tool "${name}": ${parsed.error.message}`);
    }

    logger.info({ tool: name }, "Dispatching tool");
    return tool.handler(parsed.data);
  }
}
