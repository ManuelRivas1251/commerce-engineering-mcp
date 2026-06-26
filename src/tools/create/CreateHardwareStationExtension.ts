import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const CreateHardwareStationExtensionSchema = z.object({
  targetPath: z.string().min(1),
  namespace: z.string().min(1).describe("C# namespace e.g. 'Contoso.HardwareStation.FiscalPrinter'"),
  projectName: z.string().min(1),
  controllerName: z.string().min(1).describe("Controller class name e.g. 'FiscalPrinterController'"),
  deviceName: z.string().min(1).describe("Device route name e.g. 'FiscalPrinter'"),
  description: z.string().optional(),
  workspacePath: z.string().optional(),
});

export const CreateHardwareStationExtensionTool: RegisteredTool = {
  definition: {
    name: "CreateHardwareStationExtension",
    description: "Scaffolds a complete Hardware Station extension project: IHardwareStationController implementation + .csproj. Based on official Microsoft patterns from Dynamics365Commerce.Solutions.",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: { type: "string" },
        namespace: { type: "string" },
        projectName: { type: "string" },
        controllerName: { type: "string" },
        deviceName: { type: "string" },
        description: { type: "string" },
        workspacePath: { type: "string" },
      },
      required: ["targetPath", "namespace", "projectName", "controllerName", "deviceName"],
    },
  },
  schema: CreateHardwareStationExtensionSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof CreateHardwareStationExtensionSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");
    const wsPath = p.workspacePath ?? p.targetPath;

    const version = await new VersionResolver().resolve(wsPath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const result = await generator.addHardwareStationController({
      namespace: p.namespace,
      controllerClassName: p.controllerName,
      deviceName: p.deviceName,
      description: p.description ?? `Hardware Station extension: ${p.controllerName}`,
      outputDir: p.targetPath,
      version,
      workspacePath: wsPath,
    });

    if (result.success) {
      const csproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <AssemblyName>${p.namespace}</AssemblyName>
    <RootNamespace>${p.namespace}</RootNamespace>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.HardwareStation.PeripheralRequests" Version="$(MicrosoftDynamicsCommerceVersion)" />
  </ItemGroup>
</Project>`;

      result.files.push({
        relativePath: path.join(p.targetPath, `${p.projectName}.csproj`).replace(/\\/g, "/"),
        content: csproj,
        language: "xml",
      });
    }

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
