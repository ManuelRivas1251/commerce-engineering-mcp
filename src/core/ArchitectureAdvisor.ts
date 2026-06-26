/**
 * ArchitectureAdvisor — deterministic D365 Commerce architecture planner.
 *
 * Analyses a free-text scenario and returns a structured architecture plan:
 * which areas are involved, which patterns to use, data flow, risks, and
 * how to scaffold the project. Does NOT call any LLM or external service.
 *
 * Pattern tables are grounded in official Microsoft documentation:
 * https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/
 */

import type { CommerceArea, CommerceArtifactType } from "../types/commerce.js";

// ─── Scenario keyword rules ────────────────────────────────────────────────

interface AreaRule {
  keywords: string[];
  area: CommerceArea;
  weight: number;
}

const AREA_RULES: AreaRule[] = [
  // POS / Store Commerce signals
  { keywords: ["pos", "store commerce", "cashier", "receipt", "button grid", "screen layout", "pin", "login", "logon", "unlock terminal", "manager override", "till", "drawer", "tender", "transaction screen", "cart line", "price override", "discount", "coupon", "loyalty", "gift card", "customer display", "peripheral", "barcode scanner", "scan", "trigger", "operation", "view", "dialog", "control", "manifest"], area: "POS", weight: 3 },
  // CRT signals
  { keywords: ["crt", "commerce runtime", "business logic", "request handler", "data service", "pricing engine", "tax", "loyalty points", "channel", "product", "variant", "inventory", "availability", "order", "sale", "return", "refund", "extensibility", "database", "entity", "configuration service"], area: "CRT", weight: 2 },
  // Retail Server / CSU signals
  { keywords: ["retail server", "csu", "commerce scale unit", "api", "odata", "controller", "entity", "client", "ecommerce", "online store", "call center", "headless", "rest", "endpoint", "mobile app", "external system"], area: "RetailServer", weight: 2 },
  // Hardware Station signals
  { keywords: ["hardware station", "printer", "fiscal", "eft", "payment", "device", "peripheral", "scanner", "scale", "cash drawer", "pin pad", "msr", "signature capture", "customer facing display", "cfd"], area: "HardwareStation", weight: 2 },
];

// ─── Artifact selection rules ──────────────────────────────────────────────

export interface ArtifactRecommendation {
  area: CommerceArea;
  artifactType: CommerceArtifactType;
  patternName: string;
  baseClass: string;
  suggestedName: string;
  description: string;
  docsUrl: string;
  requiredBy?: CommerceArea;   // This artifact is called by another area
  callsInto?: CommerceArea;    // This artifact calls another area
}

interface ArtifactRule {
  triggerKeywords: string[];
  area: CommerceArea;
  artifactType: CommerceArtifactType;
  patternName: string;
  baseClass: string;
  nameTemplate: (scenario: string) => string;
  description: (scenario: string) => string;
  docsUrl: string;
  callsInto?: CommerceArea;
  requiredBy?: CommerceArea;
}

const ARTIFACT_RULES: ArtifactRule[] = [
  // POS — Pre triggers
  {
    triggerKeywords: ["before", "pre", "validate", "intercept", "prevent", "check", "logon", "login", "unlock", "override", "elevate"],
    area: "POS", artifactType: "Trigger", patternName: "PreTrigger",
    baseClass: "IPreTrigger",
    nameTemplate: (s) => `Pre${toPascalCase(extractVerb(s))}Trigger`,
    description: (s) => `Pre-trigger that intercepts the ${extractVerb(s)} operation before execution`,
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/trigger-example-blocking",
  },
  // POS — Post triggers
  {
    triggerKeywords: ["after", "post", "notify", "update", "complete", "finish", "receipt", "confirm"],
    area: "POS", artifactType: "Trigger", patternName: "PostTrigger",
    baseClass: "IPostTrigger",
    nameTemplate: (s) => `Post${toPascalCase(extractVerb(s))}Trigger`,
    description: (s) => `Post-trigger that runs after the ${extractVerb(s)} operation completes`,
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/trigger-example-non-blocking",
  },
  // POS — Custom Operation
  {
    triggerKeywords: ["button", "operation", "custom action", "menu", "launch", "execute", "open"],
    area: "POS", artifactType: "Operation", patternName: "CustomOperation",
    baseClass: "ExtensionOperationRequestHandlerBase",
    nameTemplate: (s) => `${toPascalCase(extractNoun(s))}Operation`,
    description: (s) => `Custom POS operation for ${extractNoun(s)}`,
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-operations",
    callsInto: "CRT",
  },
  // POS — Dialog
  {
    triggerKeywords: ["dialog", "popup", "input", "prompt", "ask", "confirm", "modal", "pin", "amount", "reason"],
    area: "POS", artifactType: "Dialog", patternName: "ShowDialog",
    baseClass: "ShowDialogClientRequest",
    nameTemplate: (s) => `${toPascalCase(extractNoun(s))}Dialog`,
    description: (s) => `Custom dialog to capture ${extractNoun(s)} input from the cashier`,
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/knockout-pos-extension",
  },
  // POS — View
  {
    triggerKeywords: ["view", "screen", "page", "panel", "form", "report", "search", "list", "display", "show"],
    area: "POS", artifactType: "View", patternName: "CustomView",
    baseClass: "CustomViewControllerBase",
    nameTemplate: (s) => `${toPascalCase(extractNoun(s))}View`,
    description: (s) => `Custom POS view for ${extractNoun(s)}`,
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-view-extension",
    callsInto: "RetailServer",
  },
  // CRT — Request/Response/Handler
  {
    triggerKeywords: ["business logic", "calculate", "compute", "validate", "process", "lookup", "get", "fetch", "save", "create", "update", "delete", "tax", "price", "discount", "loyalty", "inventory", "product", "customer", "order", "crt", "handler"],
    area: "CRT", artifactType: "Handler", patternName: "SingleAsyncRequestHandler",
    baseClass: "SingleAsyncRequestHandler",
    nameTemplate: (s) => `${toPascalCase(extractNoun(s))}RequestHandler`,
    description: (s) => `CRT request handler for ${extractNoun(s)} business logic`,
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility",
    requiredBy: "POS",
  },
  // Retail Server — Controller
  {
    triggerKeywords: ["api", "endpoint", "controller", "odata", "rest", "external", "ecommerce", "online", "call center", "csu", "retail server"],
    area: "RetailServer", artifactType: "RetailServerAPI", patternName: "CommerceController",
    baseClass: "IController",
    nameTemplate: (s) => `${toPascalCase(extractNoun(s))}Controller`,
    description: (s) => `Retail Server controller exposing ${extractNoun(s)} as an OData endpoint`,
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility",
    callsInto: "CRT",
  },
  // Hardware Station — Controller
  {
    triggerKeywords: ["printer", "fiscal", "device", "peripheral", "eft", "payment terminal", "cash drawer", "hardware station", "receipt printer", "scanner", "scale"],
    area: "HardwareStation", artifactType: "HardwareStationExtension", patternName: "HardwareStationController",
    baseClass: "IHardwareStationController",
    nameTemplate: (s) => `${toPascalCase(extractNoun(s))}Controller`,
    description: (s) => `Hardware Station controller for ${extractNoun(s)} device communication`,
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension",
    requiredBy: "POS",
  },
];

// ─── Architecture output types ─────────────────────────────────────────────

export interface ArchitectureLayer {
  area: CommerceArea;
  artifacts: ArtifactRecommendation[];
  pattern: string;
  purpose: string;
  docsUrl: string;
}

export interface DataFlowStep {
  from: string;
  to: string;
  mechanism: string;
  description: string;
}

export interface ArchitectureRisk {
  area: CommerceArea | "General";
  risk: string;
  mitigation: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface TestingRecommendation {
  area: CommerceArea;
  strategy: string;
  tools: string[];
  notes: string;
}

export interface ArchitecturePlan {
  objective: string;
  detectedAreas: CommerceArea[];
  layers: ArchitectureLayer[];
  dataFlow: DataFlowStep[];
  risks: ArchitectureRisk[];
  testing: TestingRecommendation[];
  deploymentNotes: string[];
  officialReferences: { title: string; url: string }[];
}

// ─── Helper functions ──────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str
    .split(/[\s\-_]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");
}

function extractVerb(scenario: string): string {
  const verbs = ["logon", "login", "scan", "sell", "pay", "print", "search", "add", "remove", "override", "unlock", "suspend", "resume", "return", "void", "tender"];
  const lower = scenario.toLowerCase();
  return verbs.find(v => lower.includes(v)) ?? "Transaction";
}

function extractNoun(scenario: string): string {
  const nouns = ["customer", "product", "transaction", "loyalty", "discount", "price", "coupon", "gift card", "receipt", "inventory", "order", "payment", "fiscal", "printer", "device", "employee", "shift", "report", "voucher"];
  const lower = scenario.toLowerCase();
  return nouns.find(n => lower.includes(n)) ?? "Extension";
}

// ─── Core advisor ──────────────────────────────────────────────────────────

export class ArchitectureAdvisor {

  analyse(scenario: string, requestedAreas?: CommerceArea[]): ArchitecturePlan {
    const lower = scenario.toLowerCase();

    // 1. Detect areas
    const detectedAreas = this.detectAreas(lower, requestedAreas);

    // 2. Select artifacts
    const allArtifacts = this.selectArtifacts(lower, detectedAreas);

    // 3. Group into layers
    const layers = this.buildLayers(detectedAreas, allArtifacts);

    // 4. Build data flow
    const dataFlow = this.buildDataFlow(detectedAreas);

    // 5. Identify risks
    const risks = this.identifyRisks(detectedAreas, lower);

    // 6. Testing recommendations
    const testing = this.buildTestingRecommendations(detectedAreas);

    // 7. Deployment notes
    const deploymentNotes = this.buildDeploymentNotes(detectedAreas);

    // 8. Official references
    const officialReferences = this.buildReferences(detectedAreas, allArtifacts);

    return {
      objective: `Implement: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}`,
      detectedAreas,
      layers,
      dataFlow,
      risks,
      testing,
      deploymentNotes,
      officialReferences,
    };
  }

  private detectAreas(lower: string, requested?: CommerceArea[]): CommerceArea[] {
    if (requested && requested.length > 0) {
      return [...new Set(requested)] as CommerceArea[];
    }

    const scores = new Map<CommerceArea, number>();
    for (const rule of AREA_RULES) {
      const hits = rule.keywords.filter(k => lower.includes(k)).length;
      if (hits > 0) {
        scores.set(rule.area, (scores.get(rule.area) ?? 0) + hits * rule.weight);
      }
    }

    const areaOrder: CommerceArea[] = ["POS", "CRT", "RetailServer", "HardwareStation"];
    const detected = areaOrder.filter(a => (scores.get(a) ?? 0) > 0);

    // Always include CRT when POS is present (CRT is the business logic layer)
    if (detected.includes("POS") && !detected.includes("CRT")) {
      detected.splice(detected.indexOf("POS") + 1, 0, "CRT");
    }

    return detected.length > 0 ? detected : ["POS", "CRT"];
  }

  private selectArtifacts(lower: string, areas: CommerceArea[]): ArtifactRecommendation[] {
    const selected: ArtifactRecommendation[] = [];
    const seenTypes = new Set<string>();

    for (const rule of ARTIFACT_RULES) {
      if (!areas.includes(rule.area)) continue;
      const hits = rule.triggerKeywords.filter(k => lower.includes(k)).length;
      if (hits === 0) continue;

      const key = `${rule.area}:${rule.artifactType}:${rule.patternName}`;
      if (seenTypes.has(key)) continue;
      seenTypes.add(key);

      selected.push({
        area: rule.area,
        artifactType: rule.artifactType,
        patternName: rule.patternName,
        baseClass: rule.baseClass,
        suggestedName: rule.nameTemplate(lower),
        description: rule.description(lower),
        docsUrl: rule.docsUrl,
        callsInto: rule.callsInto,
        requiredBy: rule.requiredBy,
      });
    }

    // Ensure at least one artifact per detected area
    for (const area of areas) {
      if (!selected.some(a => a.area === area)) {
        selected.push(this.defaultArtifact(area, lower));
      }
    }

    return selected;
  }

  private defaultArtifact(area: CommerceArea, scenario: string): ArtifactRecommendation {
    const defaults: Record<CommerceArea, ArtifactRecommendation> = {
      POS: {
        area: "POS", artifactType: "Operation", patternName: "CustomOperation",
        baseClass: "ExtensionOperationRequestHandlerBase",
        suggestedName: `${toPascalCase(extractNoun(scenario))}Operation`,
        description: `Custom POS operation for ${extractNoun(scenario)}`,
        docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-operations",
        callsInto: "CRT",
      },
      CRT: {
        area: "CRT", artifactType: "Handler", patternName: "SingleAsyncRequestHandler",
        baseClass: "SingleAsyncRequestHandler",
        suggestedName: `${toPascalCase(extractNoun(scenario))}RequestHandler`,
        description: `CRT request handler for ${extractNoun(scenario)}`,
        docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility",
      },
      RetailServer: {
        area: "RetailServer", artifactType: "RetailServerAPI", patternName: "CommerceController",
        baseClass: "IController",
        suggestedName: `${toPascalCase(extractNoun(scenario))}Controller`,
        description: `Retail Server controller for ${extractNoun(scenario)}`,
        docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility",
        callsInto: "CRT",
      },
      HardwareStation: {
        area: "HardwareStation", artifactType: "HardwareStationExtension", patternName: "HardwareStationController",
        baseClass: "IHardwareStationController",
        suggestedName: `${toPascalCase(extractNoun(scenario))}Controller`,
        description: `Hardware Station controller for ${extractNoun(scenario)}`,
        docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension",
      },
    };
    return defaults[area];
  }

  private buildLayers(areas: CommerceArea[], artifacts: ArtifactRecommendation[]): ArchitectureLayer[] {
    const LAYER_META: Record<CommerceArea, { pattern: string; purpose: string; docsUrl: string }> = {
      POS: {
        pattern: "Store Commerce Extension Package",
        purpose: "Cashier-facing UI: triggers, operations, views, dialogs, controls. Runs in the Store Commerce app (Chromium-based, TypeScript).",
        docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension-overview",
      },
      CRT: {
        pattern: "Commerce Runtime Extension",
        purpose: "Business logic layer: request/response handlers, data access, pricing, inventory. Runs server-side in the CSU process.",
        docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility",
      },
      RetailServer: {
        pattern: "Retail Server / CSU API Extension",
        purpose: "OData API layer: exposes CRT functionality to e-Commerce, Call Center, and external systems via REST/OData.",
        docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility",
      },
      HardwareStation: {
        pattern: "Hardware Station Extension",
        purpose: "Device communication layer: talks to printers, fiscal devices, EFT terminals, scanners. Runs as a local service.",
        docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension",
      },
    };

    return areas.map(area => ({
      area,
      artifacts: artifacts.filter(a => a.area === area),
      ...LAYER_META[area],
    }));
  }

  private buildDataFlow(areas: CommerceArea[]): DataFlowStep[] {
    const steps: DataFlowStep[] = [];

    if (areas.includes("POS")) {
      steps.push({
        from: "Cashier (Store Commerce UI)",
        to: "POS Extension (TypeScript)",
        mechanism: "User interaction / button grid / trigger",
        description: "Cashier triggers an operation or the system fires a pre/post trigger",
      });
    }
    if (areas.includes("POS") && areas.includes("CRT")) {
      steps.push({
        from: "POS Extension",
        to: "Commerce Runtime (CRT)",
        mechanism: "ClientRequest → ServerRequest via RTS proxy",
        description: "POS sends a ClientRequest that is proxied to the CRT request handler on the server",
      });
    }
    if (areas.includes("CRT")) {
      steps.push({
        from: "CRT Request Handler",
        to: "Dynamics 365 Commerce HQ / Database",
        mechanism: "DataService request / AX calls",
        description: "Handler processes business logic, queries the Commerce database or calls HQ via CDX",
      });
    }
    if (areas.includes("RetailServer") && areas.includes("CRT")) {
      steps.push({
        from: "External Client (e-Commerce / Call Center)",
        to: "Retail Server Controller (OData)",
        mechanism: "HTTP OData REST call",
        description: "External system calls the OData endpoint exposed by the Retail Server controller",
      });
      steps.push({
        from: "Retail Server Controller",
        to: "CRT Request Handler",
        mechanism: "GetAsync / PostAsync via RequestContext",
        description: "Controller dispatches a CRT request to process the business operation",
      });
    }
    if (areas.includes("HardwareStation") && areas.includes("POS")) {
      steps.push({
        from: "POS Extension",
        to: "Hardware Station Controller",
        mechanism: "HardwareStationDeviceActionRequest",
        description: "POS sends a device action request to the Hardware Station via the peripheral manager",
      });
    }
    if (areas.includes("HardwareStation")) {
      steps.push({
        from: "Hardware Station Controller",
        to: "Physical Device",
        mechanism: "Device SDK / Serial / USB / Network",
        description: "Controller communicates with the physical device driver",
      });
    }

    return steps;
  }

  private identifyRisks(areas: CommerceArea[], lower: string): ArchitectureRisk[] {
    const risks: ArchitectureRisk[] = [];

    if (areas.includes("POS")) {
      risks.push({
        area: "POS", severity: "HIGH",
        risk: "Offline mode: Store Commerce can go offline. POS extensions must handle the offline scenario.",
        mitigation: "Test with RTS disconnected. Avoid calling Retail Server directly from POS — always go through CRT which handles offline caching.",
      });
      risks.push({
        area: "POS", severity: "MEDIUM",
        risk: "Operation ID collision: custom operation IDs must be >= 4000 and unique across all extensions.",
        mitigation: "Register custom operation IDs in a central registry. Use list_existing_operations to check for conflicts before generating.",
      });
    }
    if (areas.includes("CRT")) {
      risks.push({
        area: "CRT", severity: "HIGH",
        risk: "Breaking existing functionality: CRT handlers can be overridden — override must call ExecuteNextAsync() when appropriate.",
        mitigation: "When overriding built-in CRT requests, always decide consciously whether to call next. Use INamedRequestHandler.SupportedRequestTypes to be explicit.",
      });
      risks.push({
        area: "CRT", severity: "MEDIUM",
        risk: "CDX sync dependency: if you read data from HQ, it must be synced via CDX jobs to the channel database.",
        mitigation: "Define CDX subjobs for any new tables. Test with CDX sync enabled in the dev environment.",
      });
    }
    if (areas.includes("RetailServer")) {
      risks.push({
        area: "RetailServer", severity: "MEDIUM",
        risk: "Authentication: all Retail Server endpoints require Commerce authentication. Do not expose sensitive operations without proper CommerceRoles authorization.",
        mitigation: "Always decorate action methods with [Authorization(CommerceRoles.Employee)] or more restrictive roles.",
      });
    }
    if (areas.includes("HardwareStation")) {
      risks.push({
        area: "HardwareStation", severity: "HIGH",
        risk: "Device availability: Hardware Station is a local service and may be unavailable or time out.",
        mitigation: "Implement timeout handling and fallback in the POS extension. Use try/catch around HardwareStationDeviceActionRequest calls.",
      });
      if (lower.includes("fiscal")) {
        risks.push({
          area: "HardwareStation", severity: "HIGH",
          risk: "Fiscal compliance: fiscal integration must follow country-specific requirements exactly.",
          mitigation: "Study the official fiscal sample for your country in https://github.com/microsoft/Dynamics365Commerce.Solutions/tree/release/9.56/src/FiscalIntegration",
        });
      }
    }
    risks.push({
      area: "General", severity: "LOW",
      risk: "Version alignment: all extensions must reference the same $(MicrosoftDynamicsCommerceVersion) via CustomizationPackage.props.",
      mitigation: "Never hardcode package versions. Use the import in all .csproj files.",
    });

    return risks;
  }

  private buildTestingRecommendations(areas: CommerceArea[]): TestingRecommendation[] {
    const recommendations: TestingRecommendation[] = [];

    if (areas.includes("POS")) {
      recommendations.push({
        area: "POS",
        strategy: "Manual testing in Store Commerce dev environment + TypeScript unit tests for pure logic",
        tools: ["Store Commerce (local CSU mode)", "Chromium DevTools", "Jest (optional, for pure TS logic)"],
        notes: "Test all trigger scenarios: normal flow, cancellation, error. Verify manifest.json registration is correct.",
      });
    }
    if (areas.includes("CRT")) {
      recommendations.push({
        area: "CRT",
        strategy: "Integration tests using the CRT test framework against the channel database",
        tools: ["xUnit / MSTest", "CRT TestHost (Microsoft.Dynamics.Commerce.Runtime.Testing)", "Local SQL channel database"],
        notes: "Test all code paths including exception handling. Verify request handler is registered in CommerceRuntime.Ext.config.",
      });
    }
    if (areas.includes("RetailServer")) {
      recommendations.push({
        area: "RetailServer",
        strategy: "Integration tests via HTTP against a local CSU instance",
        tools: ["xUnit", "HttpClient / Postman", "Retail Server Test Host"],
        notes: "Test authentication, authorization, and OData response shape. Verify entity bindings.",
      });
    }
    if (areas.includes("HardwareStation")) {
      recommendations.push({
        area: "HardwareStation",
        strategy: "Unit tests with mocked device + manual hardware testing",
        tools: ["xUnit / MSTest", "Device simulator (if available)", "Physical device in dev environment"],
        notes: "Test timeout scenarios and error handling. Simulate device unavailability.",
      });
    }

    return recommendations;
  }

  private buildDeploymentNotes(areas: CommerceArea[]): string[] {
    const notes: string[] = [];

    if (areas.includes("POS")) {
      notes.push("POS: Package the extension as a Store Commerce extension package (SCPKG). Deploy via Retail Deployment script or Lifecycle Services.");
      notes.push("POS: Register the extension package in the Store Commerce installer or via environment configuration.");
    }
    if (areas.includes("CRT") || areas.includes("RetailServer")) {
      notes.push("CRT / CSU: Package as a Retail Server extension (ZIP). Deploy to the CSU host via Lifecycle Services or local installer.");
      notes.push("CRT: Register the assembly in CommerceRuntime.Ext.config on the CSU. Do not modify the base CommerceRuntime.config.");
    }
    if (areas.includes("HardwareStation")) {
      notes.push("Hardware Station: Package as a Hardware Station extension (ZIP). Deploy to each register machine that requires the device.");
      notes.push("Hardware Station: Register the extension in HardwareStation.Extension.config. Restart the Hardware Station service after deployment.");
    }
    notes.push("All: Use CustomizationPackage.props to share the MicrosoftDynamicsCommerceVersion across all projects in the solution.");
    notes.push("Reference: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/retail-sdk-packaging");

    return notes;
  }

  private buildReferences(areas: CommerceArea[], artifacts: ArtifactRecommendation[]): { title: string; url: string }[] {
    const refs: { title: string; url: string }[] = [
      { title: "Dynamics365Commerce.Solutions — Official GitHub Samples", url: "https://github.com/microsoft/Dynamics365Commerce.Solutions" },
      { title: "Store Commerce extensibility overview", url: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension-overview" },
    ];

    const seenUrls = new Set(refs.map(r => r.url));

    for (const a of artifacts) {
      if (!seenUrls.has(a.docsUrl)) {
        refs.push({ title: `Docs: ${a.patternName} (${a.area})`, url: a.docsUrl });
        seenUrls.add(a.docsUrl);
      }
    }

    if (areas.includes("CRT")) {
      const url = "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility";
      if (!seenUrls.has(url)) refs.push({ title: "CRT extensibility", url });
    }
    if (areas.includes("RetailServer")) {
      const url = "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility";
      if (!seenUrls.has(url)) refs.push({ title: "Retail Server extensibility", url });
    }

    return refs;
  }
}
