import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { logger } from "./core/Logger.js";
import { ToolRegistry } from "./core/ToolRegistry.js";

// ── Workspace tools ──────────────────────────────────────────────────────────
import { AnalyzeWorkspaceTool, AnalyzeWorkspaceSchema } from "./tools/workspace/AnalyzeWorkspace.js";
import { DetectCommerceVersionTool, DetectCommerceVersionSchema } from "./tools/workspace/DetectCommerceVersion.js";
import { RefreshWorkspaceIndexTool, RefreshWorkspaceIndexSchema } from "./tools/workspace/RefreshWorkspaceIndex.js";

// ── Search tools ─────────────────────────────────────────────────────────────
import { SearchMicrosoftLearnTool, SearchMicrosoftLearnSchema } from "./tools/search/SearchMicrosoftLearn.js";
import { SearchOfficialSamplesTool, SearchOfficialSamplesSchema } from "./tools/search/SearchOfficialSamples.js";
import { SearchSDKTool, SearchSDKSchema } from "./tools/search/SearchSDK.js";
import { SearchPOSApiTool, SearchPOSApiSchema } from "./tools/search/SearchPOSApi.js";
import { SearchCRTApiTool, SearchCRTApiSchema } from "./tools/search/SearchCRTApi.js";
import { SearchRetailServerTool, SearchRetailServerSchema } from "./tools/search/SearchRetailServer.js";
import { SearchHardwareStationTool, SearchHardwareStationSchema } from "./tools/search/SearchHardwareStation.js";
import { SearchDocumentationTool, SearchDocumentationSchema } from "./tools/search/SearchDocumentation.js";
import { SearchSamplesByVersionTool, SearchSamplesByVersionSchema } from "./tools/search/SearchSamplesByVersion.js";
import { GetOfficialPatternTool, GetOfficialPatternSchema } from "./tools/search/GetOfficialPattern.js";
import { GetHQIntegrationGuideTool, GetHQIntegrationGuideSchema } from "./tools/search/GetHQIntegrationGuide.js";

// ── Add tools ────────────────────────────────────────────────────────────────
import { AddTriggerTool, AddTriggerSchema } from "./tools/add/AddTrigger.js";
import { AddOperationTool, AddOperationSchema } from "./tools/add/AddOperation.js";
import { AddDialogTool, AddDialogSchema } from "./tools/add/AddDialog.js";
import { AddViewTool, AddViewSchema } from "./tools/add/AddView.js";
import { AddControlTool, AddControlSchema } from "./tools/add/AddControl.js";
import { AddLocalizationTool, AddLocalizationSchema } from "./tools/add/AddLocalization.js";
import { AddManifestTool, AddManifestSchema } from "./tools/add/AddManifest.js";

// ── Create tools ─────────────────────────────────────────────────────────────
import { CreateStoreCommerceProjectTool, CreateStoreCommerceProjectSchema } from "./tools/create/CreateStoreCommerceProject.js";
import { CreateCRTProjectTool, CreateCRTProjectSchema } from "./tools/create/CreateCRTProject.js";
import { CreateRetailServerExtensionTool, CreateRetailServerExtensionSchema } from "./tools/create/CreateRetailServerExtension.js";
import { CreateHardwareStationExtensionTool, CreateHardwareStationExtensionSchema } from "./tools/create/CreateHardwareStationExtension.js";

// ── List tools ───────────────────────────────────────────────────────────────
import { ListExistingOperationsTool, ListExistingOperationsSchema } from "./tools/list/ListExistingOperations.js";
import { ListExistingTriggersTool, ListExistingTriggersSchema } from "./tools/list/ListExistingTriggers.js";
import { ListExistingRequestsTool, ListExistingRequestsSchema } from "./tools/list/ListExistingRequests.js";
import { ListExistingDialogsTool, ListExistingDialogsSchema } from "./tools/list/ListExistingDialogs.js";
import { ListExistingViewsTool, ListExistingViewsSchema } from "./tools/list/ListExistingViews.js";

// ── Validate tools ───────────────────────────────────────────────────────────
import { PatternValidatorTool, PatternValidatorSchema } from "./tools/validate/PatternValidator.js";
import { ArchitectureReviewTool, ArchitectureReviewSchema } from "./tools/validate/ArchitectureReview.js";
import { GenerateSolutionTool, GenerateSolutionSchema } from "./tools/validate/GenerateSolution.js";

// ── Resources ────────────────────────────────────────────────────────────────
import { WORKSPACE_RESOURCES } from "./resources/WorkspaceResource.js";
import {
  handleWorkspaceResource,
  handleOperationsResource,
  handleTriggersResource,
  handleRequestsResource,
  handleSdkResource,
  handleArchitectureResource,
  saveLastWorkspace,
} from "./resources/ResourceHandlers.js";

// ── Prompts ──────────────────────────────────────────────────────────────────
import { ArchitectModePrompt, buildArchitectModeMessage } from "./prompts/ArchitectModePrompt.js";
import { ImplementModePrompt, buildImplementModeMessage } from "./prompts/ImplementModePrompt.js";
import { E2ESolutionPrompt, buildE2ESolutionMessage } from "./prompts/E2ESolutionPrompt.js";

// ── Registry ──────────────────────────────────────────────────────────────────
const registry = new ToolRegistry();

const ALL_TOOLS_WITH_SCHEMA = [
  // Workspace
  { tool: AnalyzeWorkspaceTool, schema: AnalyzeWorkspaceSchema },
  { tool: DetectCommerceVersionTool, schema: DetectCommerceVersionSchema },
  { tool: RefreshWorkspaceIndexTool, schema: RefreshWorkspaceIndexSchema },
  // Search
  { tool: SearchMicrosoftLearnTool, schema: SearchMicrosoftLearnSchema },
  { tool: SearchOfficialSamplesTool, schema: SearchOfficialSamplesSchema },
  { tool: SearchSDKTool, schema: SearchSDKSchema },
  { tool: SearchPOSApiTool, schema: SearchPOSApiSchema },
  { tool: SearchCRTApiTool, schema: SearchCRTApiSchema },
  { tool: SearchRetailServerTool, schema: SearchRetailServerSchema },
  { tool: SearchHardwareStationTool, schema: SearchHardwareStationSchema },
  { tool: SearchDocumentationTool, schema: SearchDocumentationSchema },
  { tool: SearchSamplesByVersionTool, schema: SearchSamplesByVersionSchema },
  { tool: GetOfficialPatternTool, schema: GetOfficialPatternSchema },
  { tool: GetHQIntegrationGuideTool, schema: GetHQIntegrationGuideSchema },  // Phase 7
  // Add
  { tool: AddTriggerTool, schema: AddTriggerSchema },
  { tool: AddOperationTool, schema: AddOperationSchema },
  { tool: AddDialogTool, schema: AddDialogSchema },
  { tool: AddViewTool, schema: AddViewSchema },
  { tool: AddControlTool, schema: AddControlSchema },
  { tool: AddLocalizationTool, schema: AddLocalizationSchema },
  { tool: AddManifestTool, schema: AddManifestSchema },
  // Create
  { tool: CreateStoreCommerceProjectTool, schema: CreateStoreCommerceProjectSchema },
  { tool: CreateCRTProjectTool, schema: CreateCRTProjectSchema },
  { tool: CreateRetailServerExtensionTool, schema: CreateRetailServerExtensionSchema },
  { tool: CreateHardwareStationExtensionTool, schema: CreateHardwareStationExtensionSchema },
  // List
  { tool: ListExistingOperationsTool, schema: ListExistingOperationsSchema },
  { tool: ListExistingTriggersTool, schema: ListExistingTriggersSchema },
  { tool: ListExistingRequestsTool, schema: ListExistingRequestsSchema },
  { tool: ListExistingDialogsTool, schema: ListExistingDialogsSchema },
  { tool: ListExistingViewsTool, schema: ListExistingViewsSchema },
  // Validate
  { tool: PatternValidatorTool, schema: PatternValidatorSchema },
  { tool: ArchitectureReviewTool, schema: ArchitectureReviewSchema },
  { tool: GenerateSolutionTool, schema: GenerateSolutionSchema },
] as const;

for (const { tool } of ALL_TOOLS_WITH_SCHEMA) {
  registry.register(tool);
}

// ── MCP Server ────────────────────────────────────────────────────────────────
const server = new McpServer({
  name: "commerce-engineering-mcp",
  version: "1.0.0",
});

// Register all tools using Zod shape directly (SDK 1.29 API)
for (const { tool, schema } of ALL_TOOLS_WITH_SCHEMA) {
  const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
  server.tool(
    tool.definition.name,
    tool.definition.description,
    shape,
    async (input) => {
      try {
        // Side-effect: track last workspace for resources
        const anyInput = input as Record<string, unknown>;
        const wsPath = (anyInput["workspacePath"] ?? anyInput["targetPath"]) as string | undefined;
        if (wsPath) saveLastWorkspace(wsPath).catch(() => {/* non-fatal */});

        const result = await registry.dispatch(tool.definition.name, input);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error({ tool: tool.definition.name, err: message }, "Tool error");
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}

// ── Resources with real data ─────────────────────────────────────────────────

const RESOURCE_HANDLERS: Record<string, () => Promise<string>> = {
  "commerce://workspace": handleWorkspaceResource,
  "commerce://operations": handleOperationsResource,
  "commerce://triggers": handleTriggersResource,
  "commerce://requests": handleRequestsResource,
  "commerce://sdk": handleSdkResource,
  "commerce://architecture": handleArchitectureResource,
};

for (const resource of WORKSPACE_RESOURCES) {
  const handler = RESOURCE_HANDLERS[resource.uri];
  server.resource(
    resource.name,
    resource.uri,
    async () => {
      const text = handler
        ? await handler().catch((err) =>
            JSON.stringify({ error: (err as Error).message, uri: resource.uri })
          )
        : JSON.stringify({ status: "no_handler", uri: resource.uri });

      return {
        contents: [
          {
            uri: resource.uri,
            mimeType: resource.mimeType ?? "application/json",
            text,
          },
        ],
      };
    }
  );
}

// ── Prompts with real content ─────────────────────────────────────────────────

server.prompt(
  ArchitectModePrompt.name,
  ArchitectModePrompt.description ?? "",
  { scenario: z.string().describe("The Commerce scenario or feature to design"), workspacePath: z.string().optional().describe("Workspace path") },
  async ({ scenario, workspacePath }) => ({
    messages: [{
      role: "user" as const,
      content: { type: "text" as const, text: buildArchitectModeMessage(scenario, workspacePath) },
    }],
  })
);

server.prompt(
  ImplementModePrompt.name,
  ImplementModePrompt.description ?? "",
  { task: z.string().describe("What to implement"), workspacePath: z.string().describe("Path to the workspace") },
  async ({ task, workspacePath }) => ({
    messages: [{
      role: "user" as const,
      content: { type: "text" as const, text: buildImplementModeMessage(task, workspacePath) },
    }],
  })
);

server.prompt(
  E2ESolutionPrompt.name,
  E2ESolutionPrompt.description ?? "",
  {
    scenario: z.string().describe("The E2E scenario to implement"),
    workspacePath: z.string().describe("Path to the workspace"),
    components: z.string().optional().describe("Comma-separated: POS,CRT,RetailServer,HardwareStation"),
  },
  async ({ scenario, workspacePath, components }) => ({
    messages: [{
      role: "user" as const,
      content: { type: "text" as const, text: buildE2ESolutionMessage(scenario, workspacePath, components) },
    }],
  })
);

// ── Start ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info(
    {
      tools: ALL_TOOLS_WITH_SCHEMA.length,
      resources: WORKSPACE_RESOURCES.length,
      prompts: 3,
    },
    "commerce-engineering-mcp started"
  );
}

main().catch((err) => {
  logger.fatal({ err }, "Server failed to start");
  process.exit(1);
});
