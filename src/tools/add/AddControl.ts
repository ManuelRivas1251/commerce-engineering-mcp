import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const AddControlSchema = z.object({
  workspacePath: z.string().min(1).describe("Absolute path to the POS project folder"),
  className: z.string().min(1).describe("PascalCase base name, e.g. 'LineDetails' → generates LineDetailsCustomControl + LineDetailsCartViewController"),
  controlName: z.string().min(1).describe("camelCase control identifier used in manifest.json and HQ Screen Layout Designer, e.g. 'lineDetails'"),
  folder: z.string().default("Cart").describe("Subfolder under Extensions where files are placed, e.g. 'Cart'"),
  packageName: z.string().optional().describe("Package name from manifest.json (used as HTML template ID prefix). Defaults to className."),
  description: z.string().optional(),
  outputDir: z.string().optional().describe("Output path relative to workspacePath. Defaults to 'Extensions'"),
});

export const AddControlTool: RegisteredTool = {
  definition: {
    name: "AddControl",
    description: "Scaffolds a complete Store Commerce POS custom transaction page control following the official CartView pattern. Generates three files: CartViewController (handles line selection), CustomControl TypeScript (Knockout observables + onReady/init), and HTML Knockout template. Also outputs the manifest.json snippet and HQ Screen Layout Designer instructions.",
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
      : path.join(p.workspacePath, "Extensions");

    const result = await generator.addPosControl({
      className: p.className,
      controlName: p.controlName,
      folder: p.folder ?? "Cart",
      packageName: p.packageName ?? p.className,
      description: p.description ?? `${p.className} custom control for the CartView transaction page`,
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
