import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { logger } from "./core/Logger.js";
import { ToolRegistry } from "./core/ToolRegistry.js";
import { assertPathAllowed, getAllowedRoots } from "./core/PathGuard.js";

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
import { AddCustomColumnTool, AddCustomColumnSchema } from "./tools/add/AddCustomColumn.js";
import { AddTotalsFieldTool, AddTotalsFieldSchema } from "./tools/add/AddTotalsField.js";
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
import { ValidateManifestTool, ValidateManifestSchema } from "./tools/validate/ValidateManifest.js";

// ── Build tools ──────────────────────────────────────────────────────────────
import { BuildExtensionTool, BuildExtensionSchema } from "./tools/build/BuildExtension.js";
import { PackageInstallerTool, PackageInstallerSchema } from "./tools/build/PackageInstaller.js";

// ── Resources ────────────────────────────────────────────────────────────────
import { WORKSPACE_RESOURCES } from "./resources/WorkspaceResource.js";
import {
  handleWorkspaceResource,
  handleOperationsResource,
  handleTriggersResource,
  handleRequestsResource,
  handleSdkResource,
  handleArchitectureResource,
  handleDocsResource,
  saveLastWorkspace,
} from "./resources/ResourceHandlers.js";

// ── Prompts ──────────────────────────────────────────────────────────────────
import { ArchitectModePrompt, buildArchitectModeMessage } from "./prompts/ArchitectModePrompt.js";
import { ImplementModePrompt, buildImplementModeMessage } from "./prompts/ImplementModePrompt.js";
import { E2ESolutionPrompt, buildE2ESolutionMessage } from "./prompts/E2ESolutionPrompt.js";

// ── Tool annotations ──────────────────────────────────────────────────────────
// Hints for MCP clients (permission UIs, auto-approval policies).

// Pure lookups against local/static data.
const READ_LOCAL: ToolAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
// Lookups that may call GitHub / Microsoft Learn.
const READ_NETWORK: ToolAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: true };
// Generate code as tool output (nothing written to the workspace); validators may hit the network.
const GENERATE: ToolAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
// Writes the workspace index under <workspace>/.mcp/.
const INDEX_WRITE: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false };
// Runs the .NET build toolchain (writes bin/obj, NuGet restore hits the network).
const BUILD: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true };

// ── Registry ──────────────────────────────────────────────────────────────────
const registry = new ToolRegistry();

const ALL_TOOLS_WITH_SCHEMA = [
  // Workspace
  { tool: AnalyzeWorkspaceTool, schema: AnalyzeWorkspaceSchema, annotations: INDEX_WRITE },
  { tool: DetectCommerceVersionTool, schema: DetectCommerceVersionSchema, annotations: READ_LOCAL },
  { tool: RefreshWorkspaceIndexTool, schema: RefreshWorkspaceIndexSchema, annotations: INDEX_WRITE },
  // Search
  { tool: SearchMicrosoftLearnTool, schema: SearchMicrosoftLearnSchema, annotations: READ_NETWORK },
  { tool: SearchOfficialSamplesTool, schema: SearchOfficialSamplesSchema, annotations: READ_NETWORK },
  { tool: SearchSDKTool, schema: SearchSDKSchema, annotations: READ_NETWORK },
  { tool: SearchPOSApiTool, schema: SearchPOSApiSchema, annotations: READ_NETWORK },
  { tool: SearchCRTApiTool, schema: SearchCRTApiSchema, annotations: READ_NETWORK },
  { tool: SearchRetailServerTool, schema: SearchRetailServerSchema, annotations: READ_NETWORK },
  { tool: SearchHardwareStationTool, schema: SearchHardwareStationSchema, annotations: READ_NETWORK },
  { tool: SearchDocumentationTool, schema: SearchDocumentationSchema, annotations: READ_NETWORK },
  { tool: SearchSamplesByVersionTool, schema: SearchSamplesByVersionSchema, annotations: READ_NETWORK },
  { tool: GetOfficialPatternTool, schema: GetOfficialPatternSchema, annotations: READ_NETWORK },
  { tool: GetHQIntegrationGuideTool, schema: GetHQIntegrationGuideSchema, annotations: READ_LOCAL },
  // Add
  { tool: AddTriggerTool, schema: AddTriggerSchema, annotations: GENERATE },
  { tool: AddOperationTool, schema: AddOperationSchema, annotations: GENERATE },
  { tool: AddDialogTool, schema: AddDialogSchema, annotations: GENERATE },
  { tool: AddViewTool, schema: AddViewSchema, annotations: GENERATE },
  { tool: AddControlTool, schema: AddControlSchema, annotations: GENERATE },
  { tool: AddCustomColumnTool, schema: AddCustomColumnSchema, annotations: GENERATE },
  { tool: AddTotalsFieldTool, schema: AddTotalsFieldSchema, annotations: GENERATE },
  { tool: AddLocalizationTool, schema: AddLocalizationSchema, annotations: GENERATE },
  { tool: AddManifestTool, schema: AddManifestSchema, annotations: GENERATE },
  // Create
  { tool: CreateStoreCommerceProjectTool, schema: CreateStoreCommerceProjectSchema, annotations: GENERATE },
  { tool: CreateCRTProjectTool, schema: CreateCRTProjectSchema, annotations: GENERATE },
  { tool: CreateRetailServerExtensionTool, schema: CreateRetailServerExtensionSchema, annotations: GENERATE },
  { tool: CreateHardwareStationExtensionTool, schema: CreateHardwareStationExtensionSchema, annotations: GENERATE },
  // List
  { tool: ListExistingOperationsTool, schema: ListExistingOperationsSchema, annotations: READ_LOCAL },
  { tool: ListExistingTriggersTool, schema: ListExistingTriggersSchema, annotations: READ_LOCAL },
  { tool: ListExistingRequestsTool, schema: ListExistingRequestsSchema, annotations: READ_LOCAL },
  { tool: ListExistingDialogsTool, schema: ListExistingDialogsSchema, annotations: READ_LOCAL },
  { tool: ListExistingViewsTool, schema: ListExistingViewsSchema, annotations: READ_LOCAL },
  // Validate
  { tool: PatternValidatorTool, schema: PatternValidatorSchema, annotations: READ_NETWORK },
  { tool: ArchitectureReviewTool, schema: ArchitectureReviewSchema, annotations: READ_LOCAL },
  { tool: GenerateSolutionTool, schema: GenerateSolutionSchema, annotations: GENERATE },
  { tool: ValidateManifestTool, schema: ValidateManifestSchema, annotations: READ_LOCAL },
  // Build
  { tool: BuildExtensionTool, schema: BuildExtensionSchema, annotations: BUILD },
  { tool: PackageInstallerTool, schema: PackageInstallerSchema, annotations: BUILD },
] as const;

for (const { tool } of ALL_TOOLS_WITH_SCHEMA) {
  registry.register(tool);
}

// ── MCP Server ────────────────────────────────────────────────────────────────
const server = new McpServer({
  name: "commerce-engineering-mcp",
  version: "1.0.0",
});

// Tool inputs that carry filesystem paths, validated against COMMERCE_ALLOWED_ROOTS.
const PATH_INPUT_KEYS = ["workspacePath", "targetPath", "projectPath", "installerProjectPath", "manifestPath"] as const;

// Register all tools. The SDK derives the JSON Schema from the Zod shape and
// validates every call against it before invoking the handler.
for (const { tool, schema, annotations } of ALL_TOOLS_WITH_SCHEMA) {
  const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
  server.registerTool(
    tool.definition.name,
    {
      description: tool.definition.description,
      inputSchema: shape,
      annotations,
    },
    async (input: Record<string, unknown>) => {
      try {
        for (const key of PATH_INPUT_KEYS) {
          const value = input[key];
          if (typeof value === "string" && value.length > 0) {
            assertPathAllowed(value, key);
          }
        }

        // Side-effect: track last workspace for resources
        const wsPath = (input["workspacePath"] ?? input["targetPath"]) as string | undefined;
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
  "commerce://docs": handleDocsResource,
};

for (const resource of WORKSPACE_RESOURCES) {
  const handler = RESOURCE_HANDLERS[resource.uri];
  server.registerResource(
    resource.name,
    resource.uri,
    {
      description: resource.description,
      mimeType: resource.mimeType ?? "application/json",
    },
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

server.registerPrompt(
  ArchitectModePrompt.name,
  {
    description: ArchitectModePrompt.description ?? "",
    argsSchema: {
      scenario: z.string().describe("The Commerce scenario or feature to design"),
      workspacePath: z.string().optional().describe("Workspace path"),
    },
  },
  async ({ scenario, workspacePath }) => ({
    messages: [{
      role: "user" as const,
      content: { type: "text" as const, text: buildArchitectModeMessage(scenario, workspacePath) },
    }],
  })
);

server.registerPrompt(
  ImplementModePrompt.name,
  {
    description: ImplementModePrompt.description ?? "",
    argsSchema: {
      task: z.string().describe("What to implement"),
      workspacePath: z.string().describe("Path to the workspace"),
    },
  },
  async ({ task, workspacePath }) => ({
    messages: [{
      role: "user" as const,
      content: { type: "text" as const, text: buildImplementModeMessage(task, workspacePath) },
    }],
  })
);

server.registerPrompt(
  E2ESolutionPrompt.name,
  {
    description: E2ESolutionPrompt.description ?? "",
    argsSchema: {
      scenario: z.string().describe("The E2E scenario to implement"),
      workspacePath: z.string().describe("Path to the workspace"),
      components: z.string().optional().describe("Comma-separated: POS,CRT,RetailServer,HardwareStation"),
    },
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
      allowedRoots: getAllowedRoots(),
    },
    "commerce-engineering-mcp started"
  );
}

main().catch((err) => {
  logger.fatal({ err }, "Server failed to start");
  process.exit(1);
});
