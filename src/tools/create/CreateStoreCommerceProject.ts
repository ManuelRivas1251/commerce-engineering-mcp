import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";

export const CreateStoreCommerceProjectSchema = z.object({
  targetPath: z.string().min(1).describe("Absolute path for the repo root (e.g. C:\\Projects\\MyExtension)"),
  packageName: z.string().min(1).describe("Solution/package name e.g. 'ContosoRetail'"),
  publisher: z.string().default("Contoso"),
  description: z.string().optional(),
  workspacePath: z.string().optional().describe("Existing workspace for version detection"),
});

export const CreateStoreCommerceProjectTool: RegisteredTool = {
  definition: {
    name: "CreateStoreCommerceProject",
    description:
      "Scaffolds a full Commerce extension solution matching the real AMSales/AMP structure: repo root with repo.props + nuget.config, then src/<Name>/ with CommerceRuntime, POS, ScaleUnit, ScaleUnit.Installer, StoreCommerce.Installer, HardwareStation, HardwareStation.Installer and ChannelDatabase projects.",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: { type: "string" },
        packageName: { type: "string" },
        publisher: { type: "string" },
        description: { type: "string" },
        workspacePath: { type: "string" },
      },
      required: ["targetPath", "packageName"],
    },
  },
  schema: CreateStoreCommerceProjectSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof CreateStoreCommerceProjectSchema>;
    const wsPath = p.workspacePath ?? p.targetPath;
    const version = await new VersionResolver().resolve(wsPath);

    const sdkMinor = (() => {
      const m = version.version.match(/^10\.0\.(\d+)/);
      return m ? parseInt(m[1], 10) + 10 : 56;
    })();
    const sdkVersion = `9.${sdkMinor}`;
    const publisher = p.publisher ?? "Contoso";
    const name = p.packageName;                      // e.g. "ContosoTest"
    const description = p.description ?? `${name} Commerce Customization`;
    const branch = version.branch !== "UNKNOWN" ? version.branch : `release/${sdkVersion}`;

    // ── Paths ──────────────────────────────────────────────────────────────────
    const R = p.targetPath.replace(/\\/g, "/");      // repo root
    const S = `${R}/src/${name}`;                    // solution folder

    // ── repo.props ─────────────────────────────────────────────────────────────
    const repoProps = `<Project>
  <PropertyGroup>
    <BuildNumber Condition="'$(BuildNumber)' == ''">0.0</BuildNumber>
    <MajorVersion>${sdkVersion}</MajorVersion>
    <Version>$(MajorVersion).$(BuildNumber)</Version>
  </PropertyGroup>

  <PropertyGroup>
    <!-- Workaround for breaking changes in PackageDefinitions metadata. https://github.com/dotnet/sdk/issues/30809 -->
    <!-- TODO: avoid of the PackageDefinitions usage. -->
    <EmitLegacyAssetsFileItems>true</EmitLegacyAssetsFileItems>
  </PropertyGroup>

  <PropertyGroup>
    <Publisher Condition="'$(Publisher)' == ''">CN=${publisher}</Publisher>
    <PublisherDisplayName Condition="'$(PublisherDisplayName)' == ''">${publisher}</PublisherDisplayName>
  </PropertyGroup>

  <PropertyGroup>
    <CommerceSdkPackagesVersion>[${sdkVersion}.*-*,9.${sdkMinor + 1})</CommerceSdkPackagesVersion>
    <CommercePosPackagesVersion>[${sdkVersion}.*-*,9.${sdkMinor + 1})</CommercePosPackagesVersion>
    <CommerceChannelPackagesVersion>[${sdkVersion}.*-*,9.${sdkMinor + 1})</CommerceChannelPackagesVersion>
    <CommerceHwsPackagesVersion>[${sdkVersion}.*-*,9.${sdkMinor + 1})</CommerceHwsPackagesVersion>
    <CommerceToolsPackagesVersion>[10.37.*-*,10.38)</CommerceToolsPackagesVersion>
    <CommercePaymentsPackagesVersion>[10.${sdkMinor}.*-*,10.${sdkMinor + 1})</CommercePaymentsPackagesVersion>
    <!-- Newtonsoft.Json -->
    <NewtonsoftJsonVersion>13.0.3</NewtonsoftJsonVersion>
    <MSTestAdapterVersion>3.6.1</MSTestAdapterVersion>
    <MSTestFrameworkVersion>3.6.1</MSTestFrameworkVersion>
    <MicoroftNetTestSdkVersion>17.11.1</MicoroftNetTestSdkVersion>
  </PropertyGroup>
</Project>`;

    // ── nuget.config ───────────────────────────────────────────────────────────
    const nugetConfig = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <config>
    <add key="repositoryPath" value="src/Dependencies" />
  </config>
  <packageSources>
    <clear />
    <add key="dynamics365-commerce" value="https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/nuget/v3/index.json" />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
  </packageSources>
  <disabledPackageSources>
    <clear />
  </disabledPackageSources>
</configuration>`;

    // ── global.json ────────────────────────────────────────────────────────────
    const globalJson = `{
  "sdk": {
    "allowPrerelease": false,
    "rollForward": "latestPatch",
    "version": "8.0.415"
  }
}`;

    // ── CustomizationPackage.props — lives in src/<Name>/, imports ..\..\repo.props
    const custProps = `<Project>
  <Import Project="..\\..\\repo.props" />

  <PropertyGroup>
    <PackagePublisher Condition="'$(PackagePublisher)' == ''">$(Publisher)</PackagePublisher>
    <PackagePublisherDisplayName Condition="'$(PackagePublisherDisplayName)' == ''">$(PublisherDisplayName)</PackagePublisherDisplayName>
    <PackageVersion Condition="'$(PackageVersion)' == ''">$(Version)</PackageVersion>
    <PackageName Condition="'$(PackageName)' == ''">${name}</PackageName>
    <PackageDisplayName Condition="'$(PackageDisplayName)' == ''">${description}</PackageDisplayName>
    <PackageDescription Condition="'$(PackageDescription)' == ''">${description}</PackageDescription>
  </PropertyGroup>
</Project>`;

    // ── .sln — GUIDs generated deterministically per project
    const guids = {
      channelDb: "A8166D6A-9868-43C8-8732-0D2DD6C9826C",
      crt:       "40D5D52E-0065-25B3-15E8-BF1932811D17",
      pos:       "A2AAF656-6AF4-400B-8B87-53742617F44D",
      scaleUnit: "5E55DA5B-F274-84CE-3627-72B4301DFF7B",
      suInst:    "3D9832E8-B137-3CBE-8AE1-21F587C63633",
      scInst:    "86D16FE0-3078-AF38-8D5A-D720A67EB301",
      hs:        "DE1F1F7C-3F7B-F3AD-79C0-A01383492412",
      hsInst:    "A97E0109-332B-1EF6-1B7B-EAD6AF035774",
      solution:  "D8D07A3D-D311-441B-A70E-A959154EE41B",
    };

    const slnProject = (guid: string, projName: string, path: string, typeGuid = "FAE04EC0-301F-11D3-BF4B-00C04F79EFBC") =>
      `Project("{${typeGuid}}") = "${projName}", "${path}", "{${guid}}"\nEndProject`;

    const slnCfg = (guid: string) =>
      `\t\t{${guid}}.Debug|Any CPU.ActiveCfg = Debug|Any CPU\n` +
      `\t\t{${guid}}.Debug|Any CPU.Build.0 = Debug|Any CPU\n` +
      `\t\t{${guid}}.Release|Any CPU.ActiveCfg = Release|Any CPU\n` +
      `\t\t{${guid}}.Release|Any CPU.Build.0 = Release|Any CPU`;

    const sln = `
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.32112.339
MinimumVisualStudioVersion = 16.0.0.0
${slnProject(guids.channelDb, `ChannelDatabase.${name}`, `ChannelDatabase\\ChannelDatabase.${name}.csproj`, "9A19103F-16F7-4668-BE54-9A1E7A4F7556")}
${slnProject(guids.crt,       `${name}.CommerceRuntime`,       `${name}.CommerceRuntime\\${name}.CommerceRuntime.csproj`)}
${slnProject(guids.pos,       `${name}.POS`,                   `${name}.POS\\${name}.POS.csproj`)}
${slnProject(guids.scaleUnit, `${name}.ScaleUnit`,             `${name}.ScaleUnit\\${name}.ScaleUnit.csproj`)}
${slnProject(guids.suInst,    `${name}.ScaleUnit.Installer`,   `${name}.ScaleUnit.Installer\\${name}.ScaleUnit.Installer.csproj`)}
${slnProject(guids.scInst,    `${name}.StoreCommerce.Installer`, `${name}.StoreCommerce.Installer\\${name}.StoreCommerce.Installer.csproj`)}
${slnProject(guids.hs,        `${name}.HardwareStation`,       `${name}.HardwareStation\\${name}.HardwareStation.csproj`)}
${slnProject(guids.hsInst,    `${name}.HardwareStation.Installer`, `${name}.HardwareStation.Installer\\${name}.HardwareStation.Installer.csproj`)}
Global
\tGlobalSection(SolutionConfigurationPlatforms) = preSolution
\t\tDebug|Any CPU = Debug|Any CPU
\t\tRelease|Any CPU = Release|Any CPU
\tEndGlobalSection
\tGlobalSection(ProjectConfigurationPlatforms) = postSolution
${Object.values(guids).filter((_, i) => i < 8).map(slnCfg).join("\n")}
\tEndGlobalSection
\tGlobalSection(SolutionProperties) = preSolution
\t\tHideSolutionNode = FALSE
\tEndGlobalSection
\tGlobalSection(ExtensibilityGlobals) = postSolution
\t\tSolutionGuid = {${guids.solution}}
\tEndGlobalSection
EndGlobal`;

    // ── CommerceRuntime.csproj — single Sdk.Runtime package (real pattern)
    const crtCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <Import Project="..\\CustomizationPackage.props" />

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
    <!-- Pre-existing messages lack [DataContract] attribute; suppress analyzer to unblock build. -->
    <NoWarn>$(NoWarn);MakeDataContractAnalyzer;CA2007</NoWarn>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Runtime" Version="$(CommerceSdkPackagesVersion)" />
    <PackageReference Include="Newtonsoft.Json" Version="$(NewtonsoftJsonVersion)" />
  </ItemGroup>
</Project>`;

    // ── POS .csproj — PrivateAssets pattern + knockoutjs + ProjectRef to CRT
    const posCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <Import Project="..\\CustomizationPackage.props" />

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <Compile Remove="devDependencies\\schemas\\**" />
    <EmbeddedResource Remove="devDependencies\\schemas\\**" />
    <TypeScriptCompile Remove="devDependencies\\schemas\\**" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Pos" Version="$(CommerceSdkPackagesVersion)">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.TypeScript.MSBuild" Version="4.0.6">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="knockoutjs" Version="3.5.1" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\\${name}.CommerceRuntime\\${name}.CommerceRuntime.csproj" />
  </ItemGroup>

  <!--
    Workaround: Microsoft.TypeScript.targets adds "should_not_exist.file" to GeneratedJavascript when
    TypeScriptInputFiles is non-empty but GeneratedJavascript is empty (line 334 of TypeScript.targets).
    CompileTypeScriptWithTSConfig removes it and adds real .js outputs, but that target is NOT in the
    dependency chain of GetPosExtensionPackageContent (called by the installer via GetCommercePackagingOutput).
    This empty target forces TypeScript to compile before GetPosExtensionPackageContent runs, ensuring
    should_not_exist.file is replaced by real outputs before the Commerce SDK packaging reads them.
  -->
  <Target Name="EnsureTypeScriptCompiledForPackaging"
          BeforeTargets="GetPosExtensionPackageContent"
          DependsOnTargets="CompileTypeScriptWithTSConfig" />

  <Target Name="ContentIncludeKnockoutLibrary" BeforeTargets="AssignTargetPaths" DependsOnTargets="RunResolvePackageDependencies">
    <PropertyGroup>
      <KnockoutjsFile>Libraries/knockout.js</KnockoutjsFile>
      <KnockoutLibraryFilePath Condition="'%(PackageDefinitions.Name)' == 'knockoutjs'">%(PackageDefinitions.ResolvedPath)\\Content\\Scripts\\knockout-%(PackageDefinitions.Version).js</KnockoutLibraryFilePath>
    </PropertyGroup>
    <Copy SourceFiles="$(KnockoutLibraryFilePath)" DestinationFiles="$(KnockoutjsFile)" SkipUnchangedFiles="true" />
    <ItemGroup>
      <Content Include="$(KnockoutjsFile)"></Content>
    </ItemGroup>
  </Target>
</Project>`;

    // ── POS manifest.json
    const manifest = `{
  "$schema": "./devDependencies/schemas/manifestSchema.json",
  "name": "${name}",
  "publisher": "${publisher}",
  "version": "1.0.0",
  "minimumPosVersion": "9.29.0.0",
  "description": "${description}",
  "components": {
    "extend": {
      "triggers": [],
      "requestHandlers": []
    }
  }
}`;

    // ── ScaleUnit (runtime packaging project)
    const scaleUnitCsproj = `<Project Sdk="Microsoft.NET.Sdk" ToolsVersion="15.0">
  <Import Project="..\\CustomizationPackage.props" />

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\\${name}.CommerceRuntime\\${name}.CommerceRuntime.csproj" />
    <ProjectReference Include="..\\${name}.POS\\${name}.POS.csproj" />
    <ProjectReference Include="..\\ChannelDatabase\\ChannelDatabase.${name}.csproj" ReferenceOutputAssembly="false" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.ScaleUnit" Version="$(CommerceSdkPackagesVersion)">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>
</Project>`;

    // ── ScaleUnit.Installer
    const suInstallerCsproj = `<Project Sdk="Microsoft.NET.Sdk" InitialTargets="EnsureNuGetContentAssetDirectories">
  <Import Project="..\\CustomizationPackage.props" />

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net472</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Installers.ScaleUnit" Version="$(CommerceSdkPackagesVersion)" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\\${name}.HardwareStation\\${name}.HardwareStation.csproj" />
    <ProjectReference Include="..\\${name}.CommerceRuntime\\${name}.CommerceRuntime.csproj" />
    <ProjectReference Include="..\\${name}.POS\\${name}.POS.csproj" />
    <ProjectReference Include="..\\ChannelDatabase\\ChannelDatabase.${name}.csproj" ReferenceOutputAssembly="false" />
  </ItemGroup>

  <!-- Workaround: ProduceContentAssets (net472 MSBuild) does not call Directory.CreateDirectory before
       writing preprocessed NuGet content assets, causing DirectoryNotFoundException on clean builds.
       InitialTargets ensures this runs before everything else, including ProduceContentAssets. -->
  <Target Name="EnsureNuGetContentAssetDirectories">
    <MakeDir Directories="$(MSBuildProjectDirectory)\\obj\\$(Configuration)\\net472\\NuGet" />
  </Target>
</Project>`;

    // ── StoreCommerce.Installer — with InitialTargets directory workaround
    const scInstallerCsproj = `<Project Sdk="Microsoft.NET.Sdk" InitialTargets="EnsureNuGetContentAssetDirectories">
  <Import Project="..\\CustomizationPackage.props" />

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net472</TargetFramework>
    <CopyLocalLockFileAssemblies>true</CopyLocalLockFileAssemblies>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Installers.StoreCommerce" Version="$(CommerceSdkPackagesVersion)" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\\${name}.HardwareStation\\${name}.HardwareStation.csproj" />
    <ProjectReference Include="..\\ChannelDatabase\\ChannelDatabase.${name}.csproj" />
    <ProjectReference Include="..\\${name}.CommerceRuntime\\${name}.CommerceRuntime.csproj" />
    <ProjectReference Include="..\\${name}.POS\\${name}.POS.csproj" />
  </ItemGroup>

  <!-- Workaround: ProduceContentAssets (net472 MSBuild) does not call Directory.CreateDirectory before
       writing preprocessed NuGet content assets, causing DirectoryNotFoundException on clean builds.
       InitialTargets ensures this runs before everything else, including ProduceContentAssets. -->
  <Target Name="EnsureNuGetContentAssetDirectories">
    <MakeDir Directories="$(MSBuildProjectDirectory)\\obj\\$(Configuration)\\net472\\NuGet" />
  </Target>
</Project>`;

    // ── HardwareStation
    const hsCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <Import Project="..\\CustomizationPackage.props" />

  <PropertyGroup>
    <AssemblyName>$(MSBuildProjectName)</AssemblyName>
    <RootNamespace>$(MSBuildProjectName)</RootNamespace>
    <TargetFramework>netstandard2.0</TargetFramework>
    <DefaultLanguage>en-US</DefaultLanguage>
    <AutoGenerateBindingRedirects>true</AutoGenerateBindingRedirects>
    <GenerateAssemblyInfo>false</GenerateAssemblyInfo>
    <CopyLocalLockFileAssemblies>true</CopyLocalLockFileAssemblies>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.HardwareAndPeripherals" Version="$(CommerceHwsPackagesVersion)" />
  </ItemGroup>
</Project>`;

    // ── HardwareStation.Installer
    const hsInstallerCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <Import Project="..\\CustomizationPackage.props" />

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net48</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Installers.HardwareStation" Version="$(CommerceSdkPackagesVersion)" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\\${name}.HardwareStation\\${name}.HardwareStation.csproj" />
  </ItemGroup>
</Project>`;

    // ── ChannelDatabase
    const channelDbCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <Import Project="..\\CustomizationPackage.props" />

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.ChannelDatabase" Version="$(CommerceSdkPackagesVersion)" />
  </ItemGroup>
</Project>`;

    // ── Sample CRT files
    const sampleHandler = `namespace ${name}.CommerceRuntime
{
    using System.Threading.Tasks;
    using Microsoft.Dynamics.Commerce.Runtime;
    using Microsoft.Dynamics.Commerce.Runtime.Messages;

    public sealed class SampleRequestHandler : SingleAsyncRequestHandler<SampleRequest>
    {
        protected override async Task<Response> Process(SampleRequest request)
        {
            ThrowIf.Null(request, nameof(request));

            // TODO: Implement handler logic here.

            return await Task.FromResult(new SampleResponse()).ConfigureAwait(false);
        }
    }
}`;

    const sampleRequest = `namespace ${name}.CommerceRuntime
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;

    public sealed class SampleRequest : Request
    {
        public SampleRequest() { }
    }
}`;

    const sampleResponse = `namespace ${name}.CommerceRuntime
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;

    public sealed class SampleResponse : Response
    {
        public SampleResponse() { }
    }
}`;

    const channelDbSql = `-- ============================================================
-- ${name} Channel Database Extension
-- Place SQL scripts here to extend the channel database
-- ============================================================

-- Example: Add a custom table
-- CREATE TABLE [ext].[CONTOSO_SAMPLE_TABLE] (
--     [ID]          BIGINT      NOT NULL,
--     [DATAAREAID]  NVARCHAR(4) NOT NULL,
--     CONSTRAINT [PK_CONTOSO_SAMPLE_TABLE] PRIMARY KEY ([ID], [DATAAREAID])
-- );`;

    // ── File list ──────────────────────────────────────────────────────────────
    const files = [
      // ── Repo root
      { relativePath: `${R}/repo.props`,                                                                      content: repoProps,           language: "xml"  as const },
      { relativePath: `${R}/nuget.config`,                                                                    content: nugetConfig,          language: "xml"  as const },
      { relativePath: `${R}/global.json`,                                                                     content: globalJson,           language: "json" as const },
      // ── Solution folder
      { relativePath: `${S}/CustomizationPackage.props`,                                                      content: custProps,            language: "xml"  as const },
      { relativePath: `${S}/${name}.sln`,                                                                     content: sln,                  language: "xml"  as const },
      // ── CommerceRuntime
      { relativePath: `${S}/${name}.CommerceRuntime/${name}.CommerceRuntime.csproj`,                          content: crtCsproj,            language: "xml"  as const },
      { relativePath: `${S}/${name}.CommerceRuntime/Handlers/SampleRequestHandler.cs`,                        content: sampleHandler,        language: "csharp" as const },
      { relativePath: `${S}/${name}.CommerceRuntime/Messages/SampleRequest.cs`,                               content: sampleRequest,        language: "csharp" as const },
      { relativePath: `${S}/${name}.CommerceRuntime/Messages/SampleResponse.cs`,                              content: sampleResponse,       language: "csharp" as const },
      // ── POS
      { relativePath: `${S}/${name}.POS/${name}.POS.csproj`,                                                  content: posCsproj,            language: "xml"  as const },
      { relativePath: `${S}/${name}.POS/manifest.json`,                                                       content: manifest,             language: "json" as const },
      { relativePath: `${S}/${name}.POS/tsconfig.json`,                                                       content: JSON.stringify({ extends: "./devDependencies/pos-tsconfig-base.json", compilerOptions: { baseUrl: ".", paths: { knockout: ["Libraries/knockout"] }, noImplicitAny: false, sourceMap: true } }, null, 4) + "\n", language: "json" as const },
      { relativePath: `${S}/${name}.POS/DataService/DataServiceEntities.ts`,                                  content: "/**\n * Placeholder module — TypeScript must produce at least one .js output so the Commerce SDK\n * packaging pipeline does not inject a 'should_not_exist.file' sentinel into the installer zip.\n * Add your POS TypeScript extensions in the DataService or Extensions folders.\n */\nexport {};\n", language: "typescript" as const },
      // ── ScaleUnit
      { relativePath: `${S}/${name}.ScaleUnit/${name}.ScaleUnit.csproj`,                                      content: scaleUnitCsproj,      language: "xml"  as const },
      // ── ScaleUnit.Installer
      { relativePath: `${S}/${name}.ScaleUnit.Installer/${name}.ScaleUnit.Installer.csproj`,                  content: suInstallerCsproj,    language: "xml"  as const },
      // ── StoreCommerce.Installer
      { relativePath: `${S}/${name}.StoreCommerce.Installer/${name}.StoreCommerce.Installer.csproj`,          content: scInstallerCsproj,    language: "xml"  as const },
      // ── HardwareStation
      { relativePath: `${S}/${name}.HardwareStation/${name}.HardwareStation.csproj`,                          content: hsCsproj,             language: "xml"  as const },
      // ── HardwareStation.Installer
      { relativePath: `${S}/${name}.HardwareStation.Installer/${name}.HardwareStation.Installer.csproj`,      content: hsInstallerCsproj,    language: "xml"  as const },
      // ── ChannelDatabase
      { relativePath: `${S}/ChannelDatabase/ChannelDatabase.${name}.csproj`,                                  content: channelDbCsproj,      language: "xml"  as const },
      { relativePath: `${S}/ChannelDatabase/01_ext_${name}_Sample.sql`,                                       content: channelDbSql,         language: "sql"  as const },
    ];

    return {
      success: true,
      detectedVersion: version,
      files,
      notes: [
        `Repo root: ${p.targetPath}/`,
        `  repo.props                        ← SDK ${sdkVersion} + all package version ranges`,
        `  nuget.config                      ← dynamics365-commerce feed + nuget.org`,
        `  global.json                       ← .NET SDK 8.0.415`,
        ``,
        `Solution: ${p.targetPath}/src/${name}/`,
        `  CustomizationPackage.props        ← imports ..\\..\\repo.props`,
        `  ${name}.sln`,
        `  ${name}.CommerceRuntime/          ← Sdk.Runtime (single package)`,
        `    Handlers/SampleRequestHandler.cs`,
        `    Messages/SampleRequest.cs`,
        `    Messages/SampleResponse.cs`,
        `  ${name}.POS/                      ← Sdk.Pos + knockoutjs + ProjectRef→CRT`,
        `    manifest.json`,
        `    tsconfig.json                   ← baseUrl + knockout path + sourceMap`,
        `    DataService/DataServiceEntities.ts ← placeholder .ts so TypeScript produces .js output`,
        `  ${name}.ScaleUnit/                ← Sdk.ScaleUnit (packaging)`,
        `  ${name}.ScaleUnit.Installer/      ← net472 + Installers.ScaleUnit`,
        `  ${name}.StoreCommerce.Installer/  ← net472 + Installers.StoreCommerce`,
        `  ${name}.HardwareStation/          ← Sdk.HardwareAndPeripherals`,
        `  ${name}.HardwareStation.Installer/ ← net48 + Installers.HardwareStation`,
        `  ChannelDatabase/                  ← Sdk.ChannelDatabase + SQL scripts`,
        ``,
        `Source: https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${branch}`,
      ],
    };
  },
};
