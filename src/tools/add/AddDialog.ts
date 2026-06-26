import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const AddDialogSchema = z.object({
  workspacePath: z.string().min(1),
  name: z.string().min(1).describe("Dialog class name e.g. 'PinInputDialog'"),
  description: z.string().optional(),
  outputDir: z.string().optional(),
});

export const AddDialogTool: RegisteredTool = {
  definition: {
    name: "AddDialog",
    description: "Generates a Store Commerce POS custom dialog (Request + Handler) using the official ShowDialogClientRequest pattern. Validates before generating.",
    inputSchema: {
      type: "object",
      properties: {
        workspacePath: { type: "string" },
        name: { type: "string", description: "Dialog class name e.g. PinInputDialog" },
        description: { type: "string" },
        outputDir: { type: "string" },
      },
      required: ["workspacePath", "name"],
    },
  },
  schema: AddDialogSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof AddDialogSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");

    const version = await new VersionResolver().resolve(p.workspacePath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const outputDir = p.outputDir
      ? path.join(p.workspacePath, p.outputDir)
      : p.workspacePath;

    const result = await generator.addPosDialog({
      className: p.name,
      description: p.description ?? `Custom POS dialog ${p.name}`,
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
