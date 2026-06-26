import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { D365FOBridge, type HQExtensionArea } from "../../sources/D365FOBridge.js";

export const GetHQIntegrationGuideSchema = z.object({
  topic: z.enum([
    "hq-to-channel",
    "channel-to-hq",
    "channel-db-extension",
    "hq-table-extension",
    "hq-cdx-job",
    "hq-sync-subjob",
    "retail-channel-table",
    "hq-form-extension",
    "integration-map",
  ]).describe("The HQ/CDX integration topic"),
  scenario: z.string().optional()
    .describe("Free-text scenario description (used for integration-map topic to auto-select relevant guidance)"),
});

export const GetHQIntegrationGuideTool: RegisteredTool = {
  definition: {
    name: "GetHQIntegrationGuide",
    description:
      "Returns official guidance for integrating Dynamics 365 Commerce extensions with D365 Finance & Operations (HQ) " +
      "via CDX (Commerce Data Exchange), channel database extensions, and AX table/form extensions. " +
      "Covers: HQ→Channel sync (CDX Download), Channel→HQ upload (P-jobs), channel DB extension scripts, " +
      "and HQ AOT extensions. All content grounded in official Microsoft documentation.",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: [
            "hq-to-channel",
            "channel-to-hq",
            "channel-db-extension",
            "hq-table-extension",
            "hq-cdx-job",
            "hq-sync-subjob",
            "retail-channel-table",
            "hq-form-extension",
            "integration-map",
          ],
          description: "The HQ/CDX integration topic to get guidance for",
        },
        scenario: {
          type: "string",
          description: "Scenario description — used with integration-map to auto-select relevant guidance",
        },
      },
      required: ["topic"],
    },
  },
  schema: GetHQIntegrationGuideSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof GetHQIntegrationGuideSchema>;
    const bridge = new D365FOBridge();

    switch (p.topic) {
      case "hq-to-channel":
        return bridge.getCDXGuide("hq-to-channel");

      case "channel-to-hq":
        return bridge.getCDXGuide("channel-to-hq");

      case "channel-db-extension":
        return bridge.getChannelDbGuide();

      case "hq-table-extension":
        return bridge.getHQExtensionGuide("Table");

      case "hq-cdx-job":
        return bridge.getHQExtensionGuide("CDXJob");

      case "hq-sync-subjob":
        return bridge.getHQExtensionGuide("SyncSubjob");

      case "retail-channel-table":
        return bridge.getHQExtensionGuide("RetailChannelTable");

      case "hq-form-extension":
        return bridge.getHQExtensionGuide("Form");

      case "integration-map": {
        const scenario = p.scenario ?? "custom data sync";
        const map = bridge.getIntegrationMap(scenario);
        return {
          scenario,
          integrationMap: map,
          availableTopics: bridge.listAllTopics(),
          note: "Use the specific topic names above to get detailed guides with code snippets for each layer.",
        };
      }

      default:
        return {
          error: `Unknown topic: ${p.topic}`,
          availableTopics: bridge.listAllTopics(),
        };
    }
  },
};
