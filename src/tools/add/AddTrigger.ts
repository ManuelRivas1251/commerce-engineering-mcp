import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import { WorkspaceAnalyzer } from "../../core/WorkspaceAnalyzer.js";
import { IndexManager } from "../../core/IndexManager.js";
import path from "path";
import os from "os";

export const AddTriggerSchema = z.object({
  workspacePath: z.string().min(1),
  name: z.string().min(1).describe("Trigger class name e.g. 'PostCustomerSearchTrigger'"),
  triggerType: z.enum(["Pre", "Post", "Cancel"]),
  triggerTypeName: z.string().min(1).describe("POS trigger type name e.g. 'LogOn', 'SuspendTransaction'"),
  namespace: z.string().optional().describe("TypeScript namespace / extension package name"),
  outputDir: z.string().optional().describe("Output directory relative to workspacePath"),
});

export const AddTriggerTool: RegisteredTool = {
  definition: {
    name: "AddTrigger",
    description: "Generates an official Store Commerce POS trigger (Pre/Post/Cancel) validated against the official SDK for the detected version. Runs PatternValidator before generating code.",
  },
  schema: AddTriggerSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof AddTriggerSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");

    const version = await new VersionResolver().resolve(p.workspacePath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const outputDir = p.outputDir
      ? path.join(p.workspacePath, p.outputDir)
      : p.workspacePath;

    const result = await generator.addPosTrigger({
      className: p.name,
      triggerType: p.triggerType,
      triggerTypeName: p.triggerTypeName,
      description: `${p.triggerType}${p.triggerTypeName} trigger`,
      namespace: p.namespace ?? "Contoso",
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
