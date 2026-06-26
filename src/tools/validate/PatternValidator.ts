import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { PatternValidatorCore } from "../../core/PatternValidatorCore.js";
import { buildSearchContext } from "../../sources/SearchContext.js";
import type { CommerceArea, CommerceArtifactType } from "../../types/commerce.js";
import path from "path";

export const PatternValidatorSchema = z.object({
  pattern: z.string().min(1).describe("Class name, interface, or pattern to validate"),
  commerceArea: z.enum(["POS", "CRT", "RetailServer", "HardwareStation"]),
  artifactType: z.enum([
    "Operation", "Trigger", "Request", "Response", "Handler",
    "Dialog", "View", "Control", "CRTService", "RetailServerAPI", "HardwareStationExtension",
  ]),
  workspacePath: z.string().optional(),
  version: z.string().optional(),
});

export type PatternValidatorInput = z.infer<typeof PatternValidatorSchema>;

export const PatternValidatorTool: RegisteredTool = {
  definition: {
    name: "PatternValidator",
    description:
      "Validates that a given class, interface, or pattern is officially supported by Microsoft " +
      "for the specified Commerce area and version. Runs 7 validation conditions: " +
      "(1) API exists, (2) area matches, (3) sample exists, (4) docs exist, " +
      "(5) artifact type correct, (6) no duplicate in workspace, (7) version compatible. " +
      "If Microsoft recommends a different pattern, returns the alternative and blocks code generation.",
    inputSchema: {
      type: "object",
      properties: {
        pattern: { type: "string", description: "Class name, interface, or pattern to validate" },
        commerceArea: { type: "string", enum: ["POS", "CRT", "RetailServer", "HardwareStation"] },
        artifactType: {
          type: "string",
          enum: ["Operation", "Trigger", "Request", "Response", "Handler",
                 "Dialog", "View", "Control", "CRTService", "RetailServerAPI", "HardwareStationExtension"],
        },
        workspacePath: { type: "string" },
        version: { type: "string", description: "Commerce version (auto-detected if omitted)" },
      },
      required: ["pattern", "commerceArea", "artifactType"],
    },
  },
  schema: PatternValidatorSchema,
  handler: async (input: unknown) => {
    const { pattern, commerceArea, artifactType, workspacePath, version } =
      input as PatternValidatorInput;

    const ctx = await buildSearchContext(workspacePath, version);
    const mcpDir = workspacePath
      ? path.join(workspacePath, ".mcp")
      : undefined;

    const validator = new PatternValidatorCore(mcpDir);

    const result = await validator.validate(
      pattern,
      commerceArea as CommerceArea,
      artifactType as CommerceArtifactType,
      ctx.branch,
      ctx.version.version,
      workspacePath
    );

    // Format for human readability
    const conditionSummary = result.conditions.map((c) => ({
      [`${c.id}. ${c.label}`]: c.passed ? `✓ ${c.detail}` : `✗ ${c.detail}`,
    }));

    // Non-critical conditions that failed — informational warnings
    const NON_CRITICAL = [3, 4, 6];
    const warnings = result.conditions
      .filter((c) => !c.passed && NON_CRITICAL.includes(c.id))
      .map((c) => c.detail);

    return {
      verdict: result.approved ? "APPROVED" : "BLOCKED",
      approved: result.approved,
      pattern: result.pattern,
      commerceArea: result.commerceArea,
      artifactType: result.artifactType,
      version: result.version,
      branch: result.branch,
      antiHallucination: {
        confidence: result.guard.confidence,
        verified: result.guard.verified,
      },
      ...(warnings.length > 0 ? { warnings } : {}),
      conditions: conditionSummary,
      ...(result.blocked
        ? {
            blockReason: result.blockReason,
            alternative: result.alternative,
            action: "Do NOT generate code using this pattern. Use the alternative above.",
          }
        : {
            action: "Pattern validated. Code generation is approved for this pattern.",
          }),
      sources: result.sources,
    };
  },
};
