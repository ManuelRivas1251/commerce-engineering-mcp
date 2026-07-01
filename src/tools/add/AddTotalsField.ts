import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const AddTotalsFieldSchema = z.object({
  workspacePath: z.string().min(1).describe("Absolute path to the POS project folder"),
  className: z.string().min(1).describe("PascalCase TypeScript class name, e.g. 'SampleCustomField'"),
  fieldName: z.string().min(1).describe("Field name that MUST match the name registered in HQ (Retail → Custom fields). Case-sensitive."),
  description: z.string().optional(),
  outputDir: z.string().optional().describe("Output path relative to workspacePath. Defaults to 'Extensions/Cart'"),
});

export const AddTotalsFieldTool: RegisteredTool = {
  definition: {
    name: "AddTotalsField",
    description:
      "Generates a Store Commerce POS custom field for the CartView Totals panel. " +
      "Extends CartViewTotalsPanelCustomFieldBase with a computeValue(cart) method that returns the display string. " +
      "Also outputs the manifest.json snippet and the required HQ configuration steps " +
      "(Language Text → Custom Fields → Screen Layout Designer → job 1090).",
  },
  schema: AddTotalsFieldSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof AddTotalsFieldSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");

    const version = await new VersionResolver().resolve(p.workspacePath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const outputDir = p.outputDir
      ? path.join(p.workspacePath, p.outputDir)
      : path.join(p.workspacePath, "Extensions", "Cart");

    const result = await generator.addPosTotalsField({
      className:    p.className,
      fieldName:    p.fieldName,
      description:  p.description ?? `${p.fieldName} custom field for the CartView Totals panel`,
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
