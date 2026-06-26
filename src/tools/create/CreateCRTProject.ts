import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator } from "../../core/CodeGenerator.js";
import path from "path";
import os from "os";

export const CreateCRTProjectSchema = z.object({
  targetPath: z.string().min(1).describe("Absolute path where the CRT project will be created"),
  namespace: z.string().min(1).describe("C# namespace e.g. 'Contoso.Commerce.Runtime.MyExtension'"),
  projectName: z.string().min(1).describe("Project name e.g. 'Contoso.Commerce.Runtime.MyExtension'"),
  handlerName: z.string().min(1).describe("Initial request handler class name e.g. 'MyRequestHandler'"),
  requestName: z.string().optional(),
  responseName: z.string().optional(),
  description: z.string().optional(),
  workspacePath: z.string().optional().describe("Workspace root for version detection"),
});

export const CreateCRTProjectTool: RegisteredTool = {
  definition: {
    name: "CreateCRTProject",
    description: "Scaffolds a complete Commerce Runtime (CRT) extension project: Request, Response, Handler .cs files + .csproj + CommerceRuntime.Ext.config. Based on official Microsoft patterns from Dynamics365Commerce.Solutions.",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: { type: "string" },
        namespace: { type: "string" },
        projectName: { type: "string" },
        handlerName: { type: "string" },
        requestName: { type: "string" },
        responseName: { type: "string" },
        description: { type: "string" },
        workspacePath: { type: "string" },
      },
      required: ["targetPath", "namespace", "projectName", "handlerName"],
    },
  },
  schema: CreateCRTProjectSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof CreateCRTProjectSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");
    const wsPath = p.workspacePath ?? p.targetPath;

    const version = await new VersionResolver().resolve(wsPath);
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const requestName = p.requestName ?? `${p.handlerName.replace(/Handler$/, "")}Request`;
    const responseName = p.responseName ?? `${p.handlerName.replace(/Handler$/, "")}Response`;
    const description = p.description ?? `CRT extension: ${p.handlerName}`;

    const result = await generator.addCRTRequestHandler({
      namespace: p.namespace,
      handlerClassName: p.handlerName,
      requestClassName: requestName,
      responseClassName: responseName,
      description,
      outputDir: p.targetPath,
      version,
      workspacePath: wsPath,
    });

    // Add .csproj — real pattern: single Sdk.Runtime package (not 5 separate packages)
    if (result.success) {
      const csprojContent = `<Project Sdk="Microsoft.NET.Sdk">
  <Import Project="..\\CustomizationPackage.props" />

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
    <AssemblyName>${p.namespace}</AssemblyName>
    <RootNamespace>${p.namespace}</RootNamespace>
    <!-- Pre-existing messages lack [DataContract] attribute; suppress analyzer to unblock build. -->
    <NoWarn>$(NoWarn);MakeDataContractAnalyzer</NoWarn>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Runtime" Version="$(CommerceSdkPackagesVersion)" />
    <PackageReference Include="Newtonsoft.Json" Version="$(NewtonsoftJsonVersion)" />
  </ItemGroup>
</Project>`;

      result.files.push({
        relativePath: path.join(p.targetPath, `${p.projectName}.csproj`).replace(/\\/g, "/"),
        content: csprojContent,
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
