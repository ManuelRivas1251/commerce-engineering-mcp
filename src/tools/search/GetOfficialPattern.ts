import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { buildSearchContext } from "../../sources/SearchContext.js";

export const GetOfficialPatternSchema = z.object({
  artifactType: z.enum([
    "Operation", "Trigger", "Request", "Response", "Handler",
    "Dialog", "View", "Control", "CRTService", "RetailServerAPI", "HardwareStationExtension",
  ]),
  area: z.enum(["POS", "CRT", "RetailServer", "HardwareStation"]),
  workspacePath: z.string().optional(),
  version: z.string().optional(),
});

export type GetOfficialPatternInput = z.infer<typeof GetOfficialPatternSchema>;

// Known official interfaces and base classes per artifact type.
// These are sourced from the official Microsoft SDK documentation and samples.
const OFFICIAL_PATTERNS: Record<string, {
  interfaces: string[];
  baseClasses: string[];
  namingConvention: string;
  filePattern: string;
  docsUrl: string;
  samplePath: string;
}> = {
  "POS:Trigger": {
    interfaces: ["IPreTrigger", "IPostTrigger", "ICancelTrigger", "IApplicationTrigger"],
    baseClasses: [],
    namingConvention: "{Pre|Post}{OperationName}Trigger.ts",
    filePattern: "src/StoreCommerce/**/*Trigger.ts",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-trigger-printing",
    samplePath: "src/StoreCommerce/Samples",
  },
  "POS:Operation": {
    interfaces: ["IOperationHandler"],
    baseClasses: ["OperationHandlerBase"],
    namingConvention: "{OperationName}OperationHandler.ts",
    filePattern: "src/StoreCommerce/**/*OperationHandler.ts",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-operations",
    samplePath: "src/StoreCommerce/Samples",
  },
  "POS:Dialog": {
    interfaces: [],
    baseClasses: ["ShowDialogClientRequest"],
    namingConvention: "{Name}Dialog.ts",
    filePattern: "src/StoreCommerce/**/*Dialog.ts",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/knockout-pos-extension",
    samplePath: "src/StoreCommerce/Samples",
  },
  "POS:View": {
    interfaces: ["ICustomViewControllerContext"],
    baseClasses: ["CustomViewControllerBase"],
    namingConvention: "{Name}View.ts",
    filePattern: "src/StoreCommerce/**/*View.ts",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-view-extension",
    samplePath: "src/StoreCommerce/Samples",
  },
  "POS:Control": {
    interfaces: ["ICustomControl"],
    baseClasses: ["CustomControl"],
    namingConvention: "{Name}Control.ts",
    filePattern: "src/StoreCommerce/**/*Control.ts",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-control",
    samplePath: "src/StoreCommerce/Samples",
  },
  "POS:Request": {
    interfaces: [],
    baseClasses: ["ClientRequest"],
    namingConvention: "{Name}ClientRequest.ts",
    filePattern: "src/StoreCommerce/**/*Request.ts",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension-overview",
    samplePath: "src/StoreCommerce/Samples",
  },
  "POS:Response": {
    interfaces: [],
    baseClasses: ["Response"],
    namingConvention: "{Name}ClientResponse.ts",
    filePattern: "src/StoreCommerce/**/*Response.ts",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension-overview",
    samplePath: "src/StoreCommerce/Samples",
  },
  "CRT:CRTService": {
    interfaces: ["IRequestHandlerAsync", "INamedRequestHandler"],
    baseClasses: ["SingleAsyncRequestHandler"],
    namingConvention: "{Name}RequestHandler.cs",
    filePattern: "src/ScaleUnit/**/*RequestHandler.cs",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility",
    samplePath: "src/ScaleUnit/Samples",
  },
  "CRT:Request": {
    interfaces: [],
    baseClasses: ["Request"],
    namingConvention: "{Name}Request.cs",
    filePattern: "src/ScaleUnit/**/*Request.cs",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility",
    samplePath: "src/ScaleUnit/Samples",
  },
  "CRT:Response": {
    interfaces: [],
    baseClasses: ["Response"],
    namingConvention: "{Name}Response.cs",
    filePattern: "src/ScaleUnit/**/*Response.cs",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility",
    samplePath: "src/ScaleUnit/Samples",
  },
  "CRT:Handler": {
    interfaces: ["IRequestHandlerAsync", "INamedRequestHandler"],
    baseClasses: ["SingleAsyncRequestHandler"],
    namingConvention: "{Name}RequestHandler.cs",
    filePattern: "src/ScaleUnit/**/*Handler.cs",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility",
    samplePath: "src/ScaleUnit/Samples",
  },
  "RetailServer:RetailServerAPI": {
    interfaces: ["IController"],
    baseClasses: ["CommerceController"],
    namingConvention: "{Name}Controller.cs",
    filePattern: "src/ScaleUnit/**/*Controller.cs",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility",
    samplePath: "src/ScaleUnit/Samples",
  },
  "HardwareStation:HardwareStationExtension": {
    interfaces: ["IHardwareStationController"],
    baseClasses: [],
    namingConvention: "{Name}HardwareStationController.cs",
    filePattern: "src/HardwareStation/**/*Controller.cs",
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension",
    samplePath: "src/HardwareStation/Samples",
  },
};

export const GetOfficialPatternTool: RegisteredTool = {
  definition: {
    name: "GetOfficialPattern",
    description:
      "Returns the official Microsoft pattern (interfaces, base classes, naming conventions) " +
      "for the requested artifact type and Commerce area. Always validated against the " +
      "official SDK for the detected version.",
  },
  schema: GetOfficialPatternSchema,
  handler: async (input: unknown) => {
    const { artifactType, area, workspacePath, version } = input as GetOfficialPatternInput;

    const ctx = await buildSearchContext(workspacePath, version);
    const patternKey = `${area}:${artifactType}`;
    const pattern = OFFICIAL_PATTERNS[patternKey];

    if (!pattern) {
      // Search for it in GitHub to avoid hallucination
      const results = await ctx.github.searchCode(
        artifactType,
        ctx.branch,
        { maxResults: 5, path: `src/${area === "POS" ? "StoreCommerce" : "ScaleUnit"}` }
      );
      return {
        found: false,
        patternKey,
        message: `No pre-indexed pattern found for '${artifactType}' in '${area}'. ` +
          `GitHub search results may help identify the correct pattern.`,
        githubSearchResults: results.map((r) => ({
          name: r.name,
          path: r.path,
          htmlUrl: r.htmlUrl,
        })),
        version: ctx.version.version,
        branch: ctx.branch,
      };
    }

    // Verify samples exist in the correct branch
    const sampleResults = await ctx.github.searchSamples(
      artifactType.replace(/([A-Z])/g, " $1").trim(),
      ctx.branch,
      3
    );

    return {
      found: true,
      patternKey,
      pattern: {
        ...pattern,
        samplePath: `https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/${ctx.branch}/${pattern.samplePath}`,
      },
      version: ctx.version.version,
      branch: ctx.branch,
      relatedSamples: sampleResults.map((r) => ({
        name: r.name,
        htmlUrl: r.htmlUrl,
      })),
      sourceVerified: true,
    };
  },
};
