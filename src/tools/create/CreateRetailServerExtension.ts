import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const CreateRetailServerExtensionSchema = z.object({
  targetPath: z.string().min(1),
  namespace: z.string().min(1).describe("C# namespace e.g. 'Contoso.RetailServer.MyExtension'"),
  projectName: z.string().min(1),
  controllerName: z.string().min(1).describe("Controller class name e.g. 'MyEntityController'"),
  entityName: z.string().min(1).describe("Entity class name e.g. 'MyEntity'"),
  description: z.string().optional(),
  workspacePath: z.string().optional(),
});

export const CreateRetailServerExtensionTool: RegisteredTool = {
  definition: {
    name: "CreateRetailServerExtension",
    description: "Scaffolds a complete Retail Server (CSU) extension project: IController implementation + .csproj. Based on official Microsoft patterns from Dynamics365Commerce.Solutions.",
  },
  schema: CreateRetailServerExtensionSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof CreateRetailServerExtensionSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");
    const wsPath = p.workspacePath ?? p.targetPath;

    const version = await new VersionResolver().resolve(wsPath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const result = await generator.addRetailServerController({
      namespace: p.namespace,
      controllerClassName: p.controllerName,
      entityName: p.entityName,
      description: p.description ?? `Retail Server extension: ${p.controllerName}`,
      projectName: p.projectName,
      outputDir: p.targetPath,
      version,
      workspacePath: wsPath,
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
