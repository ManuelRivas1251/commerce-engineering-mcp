import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const AddViewSchema = z.object({
  workspacePath: z.string().min(1),
  name: z.string().min(1).describe("View class name e.g. 'CustomProductSearchView'"),
  description: z.string().optional(),
  outputDir: z.string().optional(),
});

export const AddViewTool: RegisteredTool = {
  definition: {
    name: "AddView",
    description: "Generates a Store Commerce POS custom view (ViewController + HTML template) following the official CustomViewControllerBase pattern.",
    inputSchema: {
      type: "object",
      properties: {
        workspacePath: { type: "string" },
        name: { type: "string", description: "View class name e.g. CustomProductSearchView" },
        description: { type: "string" },
        outputDir: { type: "string" },
      },
      required: ["workspacePath", "name"],
    },
  },
  schema: AddViewSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof AddViewSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");

    const version = await new VersionResolver().resolve(p.workspacePath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const outputDir = p.outputDir
      ? path.join(p.workspacePath, p.outputDir)
      : p.workspacePath;

    const result = await generator.addPosView({
      className: p.name,
      description: p.description ?? `Custom POS view ${p.name}`,
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
