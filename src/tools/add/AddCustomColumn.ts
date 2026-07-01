import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const AddCustomColumnSchema = z.object({
  workspacePath: z.string().min(1).describe("Absolute path to the POS project folder"),
  className: z.string().min(1).describe("PascalCase class name, e.g. 'LineNumberColumn'"),
  title: z.string().min(1).describe("Column header text shown in the transaction grid, e.g. 'Line Number'"),
  gridType: z.enum(["Lines", "Payments", "Delivery"]).default("Lines").describe("Which transaction grid receives the column"),
  columnNumber: z.number().int().min(1).max(10).default(1).describe("Custom column slot (1–10). The layout supports up to 10 custom columns."),
  description: z.string().optional(),
  outputDir: z.string().optional().describe("Output path relative to workspacePath. Defaults to 'Extensions/Cart/LinesGrid'"),
});

export const AddCustomColumnTool: RegisteredTool = {
  definition: {
    name: "AddCustomColumn",
    description:
      "Generates a Store Commerce POS custom column for the CartView transaction grid (Lines, Payments, or Delivery). " +
      "Extends CustomLinesGridColumnBase / CustomPaymentsGridColumnBase / CustomDeliveryGridColumnBase with title(), computeValue(), and alignment(). " +
      "Also outputs the manifest.json snippet and HQ Screen Layout Designer steps.",
  },
  schema: AddCustomColumnSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof AddCustomColumnSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");

    const version = await new VersionResolver().resolve(p.workspacePath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const gridType = p.gridType ?? "Lines";
    const colNum   = p.columnNumber ?? 1;

    const gridFolder = gridType === "Lines"    ? "LinesGrid"
                     : gridType === "Payments" ? "PaymentsGrid"
                     :                           "DeliveryGrid";

    const outputDir = p.outputDir
      ? path.join(p.workspacePath, p.outputDir)
      : path.join(p.workspacePath, "Extensions", "Cart", gridFolder);

    const result = await generator.addPosCustomColumn({
      className:    p.className,
      title:        p.title,
      gridType,
      columnNumber: colNum,
      description:  p.description ?? `${p.title} custom column for the CartView ${gridType} grid`,
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
