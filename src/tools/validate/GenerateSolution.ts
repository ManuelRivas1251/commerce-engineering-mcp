import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { logger } from "../../core/Logger.js";
import { ArchitectureAdvisor, type ArtifactRecommendation } from "../../core/ArchitectureAdvisor.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { CodeGenerator, type GeneratedFile } from "../../core/CodeGenerator.js";
import { renderManifest } from "../../templates/pos/manifest.js";
import type { CommerceArea } from "../../types/commerce.js";
import path from "path";
import os from "os";

export const GenerateSolutionSchema = z.object({
  workspacePath: z.string().min(1),
  scenario: z.string().min(1).describe("E2E scenario description"),
  components: z
    .array(z.enum(["POS", "CRT", "RetailServer", "HardwareStation"]))
    .min(1)
    .describe("Commerce areas to include in the solution"),
  solutionName: z.string().optional().describe("Solution/extension name prefix e.g. 'ContosoLoyalty'"),
  namespace: z.string().optional().describe("C# namespace root e.g. 'Contoso.Commerce'"),
  publisher: z.string().optional().describe("Publisher name for POS manifest"),
  outputDir: z.string().optional().describe("Output directory (relative to workspacePath). Defaults to 'src/'"),
});

export const GenerateSolutionTool: RegisteredTool = {
  definition: {
    name: "GenerateSolution",
    description:
      "Generates a complete End-to-End Dynamics 365 Commerce extension solution for the given scenario, " +
      "covering all requested areas (POS, CRT, Retail Server, Hardware Station). " +
      "First runs ArchitectureAdvisor to plan, then validates ALL patterns via PatternValidator before generating any code. " +
      "Returns a complete set of files ready to build.",
    inputSchema: {
      type: "object",
      properties: {
        workspacePath: { type: "string" },
        scenario: { type: "string" },
        components: {
          type: "array",
          items: { type: "string", enum: ["POS", "CRT", "RetailServer", "HardwareStation"] },
        },
        solutionName: { type: "string" },
        namespace: { type: "string" },
        publisher: { type: "string" },
        outputDir: { type: "string" },
      },
      required: ["workspacePath", "scenario", "components"],
    },
  },
  schema: GenerateSolutionSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof GenerateSolutionSchema>;
    const mcpDir = path.join(os.homedir(), ".commerce-engineering-mcp");

    // ── Step 1: Detect version ────────────────────────────────────────────
    const version = await new VersionResolver().resolve(p.workspacePath);

    // ── Step 2: Architecture plan ─────────────────────────────────────────
    const advisor = new ArchitectureAdvisor();
    const plan = advisor.analyse(p.scenario, p.components as CommerceArea[]);

    // ── Step 3: Derive naming ─────────────────────────────────────────────
    const solutionName = p.solutionName ?? deriveNameFromScenario(p.scenario);
    const nsRoot = p.namespace ?? `Contoso.Commerce`;
    const publisher = p.publisher ?? "Contoso";
    const outBase = p.outputDir
      ? path.join(p.workspacePath, p.outputDir)
      : path.join(p.workspacePath, "src");

    // ── Step 4: Validate all patterns before generating ───────────────────
    const validator = new PatternValidatorCore(mcpDir);
    const generator = new CodeGenerator(validator);

    const validationResults: Array<{
      artifact: string;
      area: string;
      approved: boolean;
      blocked: boolean;
      blockReason?: string;
    }> = [];

    for (const artifact of plan.layers.flatMap(l => l.artifacts)) {
      try {
        const vr = await validator.validate(
          artifact.baseClass,
          artifact.area,
          artifact.artifactType,
          version.branch,
          version.version,
          p.workspacePath
        );
        validationResults.push({
          artifact: artifact.suggestedName,
          area: artifact.area,
          approved: vr.approved,
          blocked: vr.blocked,
          blockReason: vr.blockReason,
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.warn({ artifact: artifact.suggestedName, err: errMsg }, "Validation threw — treating as blocked");
        validationResults.push({
          artifact: artifact.suggestedName,
          area: artifact.area,
          approved: false,
          blocked: true,
          blockReason: `Validation error: ${errMsg}`,
        });
      }
    }

    const anyBlocked = validationResults.some(v => v.blocked);
    if (anyBlocked) {
      return {
        success: false,
        detectedVersion: version,
        scenario: p.scenario,
        blockedValidations: validationResults.filter(v => v.blocked),
        files: [],
        notes: ["One or more patterns failed validation. No code was generated. Fix the blocked patterns and retry."],
      };
    }

    // ── Step 5: Generate all files ────────────────────────────────────────
    const allFiles: GeneratedFile[] = [];
    const allNotes: string[] = [];
    const generationLog: Array<{ artifact: string; area: string; files: string[] }> = [];

    for (const artifact of plan.layers.flatMap(l => l.artifacts)) {
      const genResult = await generateArtifact(
        artifact, generator, version,
        solutionName, nsRoot, outBase, p.workspacePath
      );
      if (genResult.files.length > 0) {
        allFiles.push(...genResult.files);
        allNotes.push(...genResult.notes);
        generationLog.push({
          artifact: artifact.suggestedName,
          area: artifact.area,
          files: genResult.files.map(f => f.relativePath),
        });
      }
    }

    // ── Step 6: Generate POS manifest if POS included ─────────────────────
    if (plan.detectedAreas.includes("POS")) {
      const posArtifacts = plan.layers.find(l => l.area === "POS")?.artifacts ?? [];
      const triggers = posArtifacts
        .filter(a => a.artifactType === "Trigger")
        .map(a => ({
          name: a.suggestedName,
          description: a.description,
          triggerType: a.baseClass.replace("IPreTrigger", "PreSuspendTransaction").replace("IPostTrigger", "PostSuspendTransaction"),
          modulePath: `Triggers/${a.suggestedName}`,
        }));
      const operations = posArtifacts
        .filter(a => a.artifactType === "Operation")
        .map(a => ({
          operationId: 4000,
          operationName: a.suggestedName,
          modulePath: `Operations/${a.suggestedName}`,
        }));
      const views = posArtifacts
        .filter(a => a.artifactType === "View")
        .map(a => ({
          name: a.suggestedName,
          description: a.description,
          modulePath: `Views/${a.suggestedName}`,
        }));

      const sdkVer = version.sdkPackageVersion ?? "9.56.0";
      const minPosVersion = sdkVer.split(".").slice(0, 2).join(".") + ".0.0";

      allFiles.push({
        relativePath: path.join(outBase, `${solutionName}.Pos`, "manifest.json").replace(/\\/g, "/"),
        content: renderManifest(
          { packageName: `${solutionName}`, publisher, version: "1.0.0.0", description: p.scenario, minimumPosVersion: minPosVersion },
          { triggers, operations, views }
        ),
        language: "json",
      });
    }

    // ── Step 7: Generate CustomizationPackage.props ───────────────────────
    allFiles.push({
      relativePath: path.join(outBase, "CustomizationPackage.props").replace(/\\/g, "/"),
      content: buildCustomizationProps(version.version !== "UNKNOWN" ? version.version : "10.0.46"),
      language: "xml",
    });

    // ── Step 8: Generate solution .sln ────────────────────────────────────
    allFiles.push({
      relativePath: path.join(outBase, `${solutionName}.sln`).replace(/\\/g, "/"),
      content: buildSlnStub(solutionName, plan.detectedAreas),
      language: "xml",
    });

    return {
      success: true,
      detectedVersion: version,
      scenario: p.scenario,
      solutionName,
      architectureAreas: plan.detectedAreas,
      validationSummary: validationResults,
      generationLog,
      files: allFiles,
      notes: [
        ...allNotes,
        `Total files generated: ${allFiles.length}`,
        `All patterns validated against branch ${version.branch}`,
        `Next: Run build to verify compilation, then deploy following the deployment notes from architecture_review.`,
        `Official samples: https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${version.branch}/src`,
      ],
    };
  },
};

// ─── Artifact code generation dispatcher ──────────────────────────────────

async function generateArtifact(
  artifact: ArtifactRecommendation,
  generator: CodeGenerator,
  version: Awaited<ReturnType<VersionResolver["resolve"]>>,
  solutionName: string,
  nsRoot: string,
  outBase: string,
  workspacePath: string
): Promise<{ files: GeneratedFile[]; notes: string[] }> {

  const area = artifact.area;
  const name = artifact.suggestedName;

  try {
    if (area === "POS") {
      if (artifact.artifactType === "Trigger") {
        const triggerType = artifact.patternName.startsWith("Pre") ? "Pre" : artifact.patternName.startsWith("Post") ? "Post" : "Cancel";
        const triggerTypeName = name.replace(/^(Pre|Post|Cancel)/, "").replace(/Trigger$/, "");
        const r = await generator.addPosTrigger({
          className: name,
          triggerType: triggerType as "Pre" | "Post" | "Cancel",
          triggerTypeName: triggerTypeName || "Transaction",
          description: artifact.description,
          namespace: `${nsRoot}.Pos`,
          outputDir: path.join(outBase, `${solutionName}.Pos`),
          version,
          workspacePath,
        });
        return { files: r.files, notes: r.notes };
      }
      if (artifact.artifactType === "Operation") {
        const r = await generator.addPosOperation({
          className: name,
          operationId: 4000,
          operationName: name,
          description: artifact.description,
          outputDir: path.join(outBase, `${solutionName}.Pos`),
          version,
          workspacePath,
        });
        return { files: r.files, notes: r.notes };
      }
      if (artifact.artifactType === "Dialog") {
        const r = await generator.addPosDialog({
          className: name,
          description: artifact.description,
          outputDir: path.join(outBase, `${solutionName}.Pos`),
          version,
          workspacePath,
        });
        return { files: r.files, notes: r.notes };
      }
      if (artifact.artifactType === "View") {
        const r = await generator.addPosView({
          className: name,
          description: artifact.description,
          outputDir: path.join(outBase, `${solutionName}.Pos`),
          version,
          workspacePath,
        });
        return { files: r.files, notes: r.notes };
      }
    }

    if (area === "CRT") {
      const baseName = name.replace(/RequestHandler$|Handler$/, "");
      const r = await generator.addCRTRequestHandler({
        namespace: `${nsRoot}.Runtime`,
        handlerClassName: name,
        requestClassName: `${baseName}Request`,
        responseClassName: `${baseName}Response`,
        description: artifact.description,
        outputDir: path.join(outBase, `${solutionName}.CommerceRuntime`),
        version,
        workspacePath,
      });
      return { files: r.files, notes: r.notes };
    }

    if (area === "RetailServer") {
      const entityName = name.replace(/Controller$/, "");
      const r = await generator.addRetailServerController({
        namespace: `${nsRoot}.RetailServer`,
        controllerClassName: name,
        entityName,
        description: artifact.description,
        projectName: `${solutionName}.RetailServer`,
        outputDir: path.join(outBase, `${solutionName}.RetailServer`),
        version,
        workspacePath,
      });
      return { files: r.files, notes: r.notes };
    }

    if (area === "HardwareStation") {
      const deviceName = name.replace(/Controller$/, "");
      const r = await generator.addHardwareStationController({
        namespace: `${nsRoot}.HardwareStation`,
        controllerClassName: name,
        deviceName,
        description: artifact.description,
        outputDir: path.join(outBase, `${solutionName}.HardwareStation`),
        version,
        workspacePath,
      });
      return { files: r.files, notes: r.notes };
    }
  } catch (err) {
    return { files: [], notes: [`Warning: Could not generate ${name} (${area}): ${(err as Error).message}`] };
  }

  return { files: [], notes: [] };
}

function deriveNameFromScenario(scenario: string): string {
  const words = scenario
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !["with", "from", "that", "this", "when", "have", "will", "should", "into", "using", "based", "after", "before"].includes(w.toLowerCase()))
    .slice(0, 3);

  if (words.length === 0) return "ContosoExtension";
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
}

function buildCustomizationProps(version: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!--
  CustomizationPackage.props
  Centralizes the Commerce SDK version for all projects in this solution.
  Source: https://github.com/microsoft/Dynamics365Commerce.Solutions
  Docs:   https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/retail-sdk-packaging
-->
<Project>
  <PropertyGroup>
    <MicrosoftDynamicsCommerceVersion>${version}</MicrosoftDynamicsCommerceVersion>
  </PropertyGroup>
</Project>
`;
}

function buildSlnStub(solutionName: string, areas: CommerceArea[]): string {
  const lines = [
    `# ${solutionName} — Dynamics 365 Commerce Extension Solution`,
    `# Generated by commerce-engineering-mcp`,
    `# Areas: ${areas.join(", ")}`,
    `#`,
    `# Projects in this solution:`,
  ];
  if (areas.includes("POS")) lines.push(`#   ${solutionName}.Pos/          — Store Commerce POS extension (TypeScript)`);
  if (areas.includes("CRT")) lines.push(`#   ${solutionName}.CommerceRuntime/ — CRT extension (C# .NET 8)`);
  if (areas.includes("RetailServer")) lines.push(`#   ${solutionName}.RetailServer/  — Retail Server extension (C# .NET 8)`);
  if (areas.includes("HardwareStation")) lines.push(`#   ${solutionName}.HardwareStation/ — Hardware Station extension (C# .NET 8)`);
  lines.push(`#`);
  lines.push(`# Reference: https://github.com/microsoft/Dynamics365Commerce.Solutions`);
  return lines.join("\n");
}
