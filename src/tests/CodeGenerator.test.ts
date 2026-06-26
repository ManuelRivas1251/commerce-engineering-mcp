/**
 * Tests for CodeGenerator — verifies the orchestration layer that combines
 * PatternValidatorCore + templates.
 *
 * PatternValidatorCore makes network calls (GitHub + MS Learn), so we test
 * CodeGenerator with a stub validator that always approves to focus on the
 * template rendering and file structure.
 */

import { describe, it, expect, vi } from "vitest";
import { CodeGenerator } from "../core/CodeGenerator.js";
import type { PatternValidatorCore, PatternValidationResult } from "../core/PatternValidatorCore.js";
import type { CommerceVersion } from "../types/commerce.js";

// ── Stub validator that always approves ───────────────────────────────────

function makeApprovedResult(): PatternValidationResult {
  return {
    approved: true,
    blocked: false,
    pattern: "test",
    commerceArea: "POS",
    artifactType: "Trigger",
    version: "10.0.46",
    branch: "release/9.56",
    conditions: [],
    guard: {
      verified: true,
      blocked: false,
      confidence: "HIGH",
      message: "verified",
      sources: [],
      alternative: undefined,
    },
    sources: [],
  };
}

function makeBlockedResult(reason: string): PatternValidationResult {
  return {
    ...makeApprovedResult(),
    approved: false,
    blocked: true,
    blockReason: reason,
    alternative: "UseCorrectPattern",
  };
}

function makeStubValidator(approve: boolean): PatternValidatorCore {
  return {
    validate: vi.fn().mockResolvedValue(
      approve ? makeApprovedResult() : makeBlockedResult("pattern not found")
    ),
  } as unknown as PatternValidatorCore;
}

const VERSION: CommerceVersion = {
  version: "10.0.46",
  branch: "release/9.56",
  sdkPackageVersion: "9.56.0",
  confidence: "HIGH",
  detectedFrom: "CustomizationPackage.props",
};

// ── addPosTrigger ──────────────────────────────────────────────────────────

describe("CodeGenerator.addPosTrigger", () => {
  it("returns success=true and one .ts file when validator approves", async () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const result = await gen.addPosTrigger({
      className: "PreLogOnTrigger",
      triggerType: "Pre",
      triggerTypeName: "LogOn",
      description: "Test trigger",
      namespace: "Contoso",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(1);
    expect(result.files[0].relativePath).toContain("Triggers/PreLogOnTrigger.ts");
    expect(result.files[0].language).toBe("typescript");
    expect(result.files[0].content).toContain("class PreLogOnTrigger");
  });

  it("returns success=false when validator blocks", async () => {
    const gen = new CodeGenerator(makeStubValidator(false));
    const result = await gen.addPosTrigger({
      className: "NgModuleTrigger",
      triggerType: "Pre",
      triggerTypeName: "LogOn",
      description: "Bad pattern",
      namespace: "Contoso",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.success).toBe(false);
    expect(result.files).toHaveLength(0);
    expect(result.validationResult?.blocked).toBe(true);
  });

  it("includes manifest entry note in output", async () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const result = await gen.addPosTrigger({
      className: "PreSuspendTrigger",
      triggerType: "Pre",
      triggerTypeName: "SuspendTransaction",
      description: "Test",
      namespace: "Contoso",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.notes.some(n => n.includes("manifest.json"))).toBe(true);
  });
});

// ── addPosOperation ────────────────────────────────────────────────────────

describe("CodeGenerator.addPosOperation", () => {
  it("generates .ts file with correct class name and operation ID", async () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const result = await gen.addPosOperation({
      className: "CustomPriceOperation",
      operationId: 4001,
      operationName: "CustomPriceOperation",
      description: "Price override operation",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.success).toBe(true);
    expect(result.files[0].content).toContain("class CustomPriceOperation");
    expect(result.files[0].content).toContain("4001");
    expect(result.files[0].relativePath).toContain("Operations/CustomPriceOperation.ts");
  });
});

// ── addPosDialog ───────────────────────────────────────────────────────────

describe("CodeGenerator.addPosDialog", () => {
  it("generates Request and Handler files", async () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const result = await gen.addPosDialog({
      className: "PinInputDialog",
      description: "PIN dialog",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(2);
    const paths = result.files.map(f => f.relativePath);
    expect(paths.some(p => p.includes("PinInputDialogRequest.ts"))).toBe(true);
    expect(paths.some(p => p.includes("PinInputDialogHandler.ts"))).toBe(true);
  });
});

// ── addPosView ─────────────────────────────────────────────────────────────

describe("CodeGenerator.addPosView", () => {
  it("generates .ts and .html files", async () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const result = await gen.addPosView({
      className: "ProductSearchView",
      description: "Search view",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(2);
    const langs = result.files.map(f => f.language);
    expect(langs).toContain("typescript");
    expect(langs).toContain("html");
  });
});

// ── addCRTRequestHandler ───────────────────────────────────────────────────

describe("CodeGenerator.addCRTRequestHandler", () => {
  it("generates Request, Response, and Handler .cs files", async () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const result = await gen.addCRTRequestHandler({
      namespace: "Contoso.Commerce.Runtime.Loyalty",
      handlerClassName: "GetLoyaltyPointsRequestHandler",
      requestClassName: "GetLoyaltyPointsRequest",
      responseClassName: "GetLoyaltyPointsResponse",
      description: "Get loyalty",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(3);
    const paths = result.files.map(f => f.relativePath);
    expect(paths.some(p => p.includes("GetLoyaltyPointsRequest.cs"))).toBe(true);
    expect(paths.some(p => p.includes("GetLoyaltyPointsResponse.cs"))).toBe(true);
    expect(paths.some(p => p.includes("GetLoyaltyPointsRequestHandler.cs"))).toBe(true);
    result.files.forEach(f => expect(f.language).toBe("csharp"));
  });

  it("notes contain CommerceRuntime.Ext.config snippet", async () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const result = await gen.addCRTRequestHandler({
      namespace: "Contoso.RT",
      handlerClassName: "MyHandler",
      requestClassName: "MyRequest",
      responseClassName: "MyResponse",
      description: "test",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.notes.some(n => n.includes("CommerceRuntime.Ext.config"))).toBe(true);
  });
});

// ── addRetailServerController ──────────────────────────────────────────────

describe("CodeGenerator.addRetailServerController", () => {
  it("generates .cs and .csproj files", async () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const result = await gen.addRetailServerController({
      namespace: "Contoso.RetailServer.Loyalty",
      controllerClassName: "LoyaltyController",
      entityName: "LoyaltyPoints",
      description: "Loyalty controller",
      projectName: "Contoso.RetailServer.Loyalty",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.success).toBe(true);
    expect(result.files.some(f => f.language === "csharp")).toBe(true);
    expect(result.files.some(f => f.language === "xml")).toBe(true);
  });
});

// ── addHardwareStationController ───────────────────────────────────────────

describe("CodeGenerator.addHardwareStationController", () => {
  it("generates one .cs file", async () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const result = await gen.addHardwareStationController({
      namespace: "Contoso.HS.Printer",
      controllerClassName: "FiscalPrinterController",
      deviceName: "FiscalPrinter",
      description: "Fiscal printer",
      outputDir: "C:/output",
      version: VERSION,
    });
    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(1);
    expect(result.files[0].language).toBe("csharp");
    expect(result.files[0].content).toContain("IHardwareStationController");
  });
});

// ── generateManifest ───────────────────────────────────────────────────────

describe("CodeGenerator.generateManifest", () => {
  it("generates manifest.json file", () => {
    const gen = new CodeGenerator(makeStubValidator(true));
    const file = gen.generateManifest(
      { packageName: "ContosoExt", publisher: "Contoso", version: "1.0.0.0", description: "test", minimumPosVersion: "9.56.0.0" },
      {}
    );
    expect(file.relativePath).toBe("manifest.json");
    expect(file.language).toBe("json");
    const parsed = JSON.parse(file.content);
    expect(parsed.name).toBe("ContosoExt");
  });
});
