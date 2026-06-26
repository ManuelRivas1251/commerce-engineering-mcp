import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { ArchitectureAdvisor } from "../../core/ArchitectureAdvisor.js";
import type { CommerceArea } from "../../types/commerce.js";

export const ArchitectureReviewSchema = z.object({
  workspacePath: z.string().min(1),
  scenario: z.string().min(1).describe("Description of the scenario or feature to design"),
  components: z.array(z.enum(["POS", "CRT", "RetailServer", "HardwareStation"])).optional()
    .describe("Force specific Commerce areas (auto-detected from scenario if omitted)"),
});

export const ArchitectureReviewTool: RegisteredTool = {
  definition: {
    name: "ArchitectureReview",
    description:
      "Delivers a complete architecture design for a Dynamics 365 Commerce scenario: " +
      "objective, required areas (POS/CRT/Retail Server/Hardware Station), artifact recommendations, " +
      "data flow, risks, testing plan, and deployment notes. " +
      "Does NOT generate code — use generate_solution for that.",
    inputSchema: {
      type: "object",
      properties: {
        workspacePath: { type: "string" },
        scenario: { type: "string", description: "Describe the feature or scenario to design" },
        components: {
          type: "array",
          items: { type: "string", enum: ["POS", "CRT", "RetailServer", "HardwareStation"] },
          description: "Force specific areas (auto-detected if omitted)",
        },
      },
      required: ["workspacePath", "scenario"],
    },
  },
  schema: ArchitectureReviewSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof ArchitectureReviewSchema>;

    const version = await new VersionResolver().resolve(p.workspacePath);
    const advisor = new ArchitectureAdvisor();
    const plan = advisor.analyse(p.scenario, p.components as CommerceArea[] | undefined);

    // Format layers for readability
    const formattedLayers = plan.layers.map(layer => ({
      area: layer.area,
      pattern: layer.pattern,
      purpose: layer.purpose,
      artifacts: layer.artifacts.map(a => ({
        name: a.suggestedName,
        type: a.artifactType,
        baseClass: a.baseClass,
        description: a.description,
        ...(a.callsInto ? { callsInto: a.callsInto } : {}),
        ...(a.requiredBy ? { requiredBy: a.requiredBy } : {}),
        docs: a.docsUrl,
      })),
      docs: layer.docsUrl,
    }));

    // ASCII data flow diagram
    const flowDiagram = buildFlowDiagram(plan.detectedAreas);

    return {
      objective: plan.objective,
      detectedVersion: version,
      detectedAreas: plan.detectedAreas,

      architectureDiagram: flowDiagram,

      layers: formattedLayers,

      dataFlow: plan.dataFlow.map((step, i) => ({
        step: i + 1,
        from: step.from,
        to: step.to,
        mechanism: step.mechanism,
        description: step.description,
      })),

      risks: plan.risks.map(r => ({
        severity: r.severity,
        area: r.area,
        risk: r.risk,
        mitigation: r.mitigation,
      })),

      testing: plan.testing.map(t => ({
        area: t.area,
        strategy: t.strategy,
        tools: t.tools,
        notes: t.notes,
      })),

      deployment: plan.deploymentNotes,

      officialReferences: plan.officialReferences,

      nextStep:
        "Architecture design complete. To generate code for this solution, " +
        `call generate_solution with scenario="${p.scenario}" ` +
        `and components=${JSON.stringify(plan.detectedAreas)}.`,
    };
  },
};

function buildFlowDiagram(areas: CommerceArea[]): string {
  const parts: string[] = [];

  if (areas.includes("POS")) parts.push("[ Store Commerce POS (TypeScript) ]");
  if (areas.includes("CRT")) parts.push("[ Commerce Runtime / CSU (C#) ]");
  if (areas.includes("RetailServer")) parts.push("[ Retail Server API (OData/REST) ]");
  if (areas.includes("HardwareStation")) parts.push("[ Hardware Station (C#) ]");

  if (parts.length === 0) return "(no areas detected)";

  const lines: string[] = [
    "D365 Commerce Extension Architecture",
    "═".repeat(50),
  ];

  if (areas.includes("POS")) {
    lines.push("  ┌────────────────────────────────────┐");
    lines.push("  │  Store Commerce POS (TypeScript)   │ ← Cashier interactions");
    lines.push("  │  • Triggers (Pre/Post/Cancel)      │");
    lines.push("  │  • Custom Operations               │");
    lines.push("  │  • Views / Dialogs / Controls      │");
    lines.push("  └────────────────┬───────────────────┘");
    lines.push("                   │ ClientRequest → ServerRequest");
  }

  if (areas.includes("CRT")) {
    if (areas.includes("POS")) lines.push("                   ▼");
    lines.push("  ┌────────────────────────────────────┐");
    lines.push("  │  Commerce Runtime (CRT) — C#       │ ← Business logic");
    lines.push("  │  • SingleAsyncRequestHandler       │");
    lines.push("  │  • INamedRequestHandler            │");
    lines.push("  │  → Channel Database / HQ via CDX   │");
    lines.push("  └────────────────────────────────────┘");
  }

  if (areas.includes("RetailServer")) {
    lines.push("");
    lines.push("  ┌────────────────────────────────────┐");
    lines.push("  │  Retail Server / CSU (OData)       │ ← External clients");
    lines.push("  │  • IController (CommerceController)│");
    lines.push("  │  ↓ dispatches to CRT handlers      │");
    lines.push("  └────────────────────────────────────┘");
    lines.push("       ▲                    ▲");
    lines.push("  e-Commerce            Call Center / External API");
  }

  if (areas.includes("HardwareStation")) {
    lines.push("");
    lines.push("  ┌────────────────────────────────────┐");
    lines.push("  │  Hardware Station (C#)             │ ← Device layer");
    lines.push("  │  • IHardwareStationController      │");
    lines.push("  │  → Printer / Fiscal / EFT device   │");
    lines.push("  └────────────────────────────────────┘");
    lines.push("       ▲");
    lines.push("  HardwareStationDeviceActionRequest (from POS)");
  }

  return lines.join("\n");
}
