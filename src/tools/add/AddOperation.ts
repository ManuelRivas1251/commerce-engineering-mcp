import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const AddOperationSchema = z.object({
  workspacePath: z.string().min(1),
  name: z.string().min(1).describe("Class name e.g. 'CustomPriceOverrideOperation'"),
  operationId: z.number().int().min(4000).describe("Custom operation ID (must be >= 4000 to avoid conflicts with built-in operations)"),
  description: z.string().optional(),
  outputDir: z.string().optional(),
});

export const AddOperationTool: RegisteredTool = {
  definition: {
    name: "AddOperation",
    description: "Generates a custom Store Commerce POS operation following the official Microsoft pattern. Custom operation IDs must be >= 4000. Validates before generating code.",
  },
  schema: AddOperationSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof AddOperationSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");

    const version = await new VersionResolver().resolve(p.workspacePath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const outputDir = p.outputDir
      ? path.join(p.workspacePath, p.outputDir)
      : p.workspacePath;

    const result = await generator.addPosOperation({
      className: p.name,
      operationId: p.operationId,
      operationName: p.name,
      description: p.description ?? `Custom POS operation ${p.name}`,
      outputDir,
      version,
      workspacePath: p.workspacePath,
    });

    return {
      success: result.success,
      detectedVersion: version,
      files: result.files,
      validationSummary: result.validationResult
        ? {
            approved: result.validationResult.approved,
            blocked: result.validationResult.blocked,
            failedConditions: result.validationResult.conditions.filter(c => !c.passed).map(c => c.label),
          }
        : null,
      notes: result.notes,
    };
  },
};
