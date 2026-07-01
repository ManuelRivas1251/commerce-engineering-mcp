import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import path from "path";
import os from "os";

export const AddManifestSchema = z.object({
  workspacePath: z.string().min(1),
  packageName: z.string().min(1).describe("Extension package name e.g. 'ContosoRetailExtensions'"),
  publisher: z.string().default("Contoso"),
  version: z.string().default("1.0.0.0"),
  description: z.string().optional(),
  outputDir: z.string().optional(),
});

export const AddManifestTool: RegisteredTool = {
  definition: {
    name: "AddManifest",
    description: "Generates a Store Commerce POS manifest.json following the official schema (src/ExtendedLogon/Pos/manifest.json pattern). Detects the minimum POS version from the workspace.",
  },
  schema: AddManifestSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof AddManifestSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");

    const version = await new VersionResolver().resolve(p.workspacePath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    // Derive minimumPosVersion from detected SDK version
    // 10.0.46 → sdkPackageVersion like "9.56.x" → minimumPosVersion "9.56.0.0"
    const sdkVer = version.sdkPackageVersion ?? "9.56.0.0";
    const minPosVersion = sdkVer.replace(/\.\d+$/, ".0").replace(/^(\d+\.\d+).*/, "$1.0.0");

    const file = generator.generateManifest(
      {
        packageName: p.packageName,
        publisher: p.publisher ?? "Contoso",
        version: p.version ?? "1.0.0.0",
        description: p.description ?? `${p.packageName} Store Commerce extensions`,
        minimumPosVersion: minPosVersion,
      },
      {}
    );

    const outputPath = p.outputDir
      ? path.join(p.workspacePath, p.outputDir, "manifest.json")
      : path.join(p.workspacePath, "manifest.json");

    return {
      success: true,
      detectedVersion: version,
      files: [{ ...file, relativePath: outputPath }],
      notes: [
        `manifest.json generated with minimumPosVersion: ${minPosVersion}`,
        `Add triggers, operations, and views to the components.extend section as you generate them.`,
        `Schema reference: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension-manifest`,
      ],
    };
  },
};
