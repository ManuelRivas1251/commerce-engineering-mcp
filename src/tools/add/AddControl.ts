import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const AddControlSchema = z.object({
  workspacePath: z.string().min(1),
  name: z.string().min(1).describe("Control class name e.g. 'NumpadControl'"),
  description: z.string().optional(),
  outputDir: z.string().optional(),
});

export const AddControlTool: RegisteredTool = {
  definition: {
    name: "AddControl",
    description: "Generates a Store Commerce POS custom control following the official ICustomControlContext pattern.",
    inputSchema: {
      type: "object",
      properties: {
        workspacePath: { type: "string" },
        name: { type: "string", description: "Control class name e.g. NumpadControl" },
        description: { type: "string" },
        outputDir: { type: "string" },
      },
      required: ["workspacePath", "name"],
    },
  },
  schema: AddControlSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof AddControlSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");

    const version = await new VersionResolver().resolve(p.workspacePath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const outputDir = p.outputDir
      ? path.join(p.workspacePath, p.outputDir)
      : p.workspacePath;

    const result = await generator.addPosControl({
      className: p.name,
      description: p.description ?? `Custom POS control ${p.name}`,
      outputDir,
      version,
      workspacePath: p.workspacePath,
    });

    return {
      success: result.success,
      detectedVersion: version,
      files: result.files,
      validationSummary: result.validationResult
        ? { approved: result.validationResult.approved, blocked: result.validationResult.blocked }
        : null,
      notes: result.notes,
    };
  },
};
