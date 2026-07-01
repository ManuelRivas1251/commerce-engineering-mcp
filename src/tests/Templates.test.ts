/**
 * Tests for code generation templates — verifies that rendered output
 * contains the correct base classes, namespaces, and structural patterns
 * matching the official Dynamics365Commerce.Solutions samples.
 */

import { describe, it, expect } from "vitest";
import { renderTrigger } from "../templates/pos/trigger.js";
import { renderOperation } from "../templates/pos/operation.js";
import { renderDialogRequest, renderDialogHandler } from "../templates/pos/dialog.js";
import { renderViewController, renderViewHtml } from "../templates/pos/view.js";
import { renderCartViewCustomControl } from "../templates/pos/control.js";
import { renderManifest } from "../templates/pos/manifest.js";
import { renderCRTRequest, renderCRTResponse, renderCRTHandler, renderCRTExtConfig } from "../templates/crt/requestHandler.js";
import { renderRSController, renderRSCsproj } from "../templates/retail-server/controller.js";
import { renderHSController } from "../templates/hardware-station/controller.js";

// ── POS Templates ──────────────────────────────────────────────────────────

describe("POS — Trigger template", () => {
  it("renders a Pre trigger extending the correct base class", () => {
    const code = renderTrigger({
      className: "PreLogOnTrigger",
      triggerType: "Pre",
      triggerTypeName: "LogOn",
      operationName: "LogOn",
      namespace: "Contoso",
      description: "Test pre-trigger",
    });
    expect(code).toContain("class PreLogOnTrigger extends Triggers.PreLogOnTrigger");
    expect(code).toContain("import * as Triggers from");
    expect(code).toContain("PosApi/Extend/Triggers");
    expect(code).toContain("CancelableTriggerResult");
    expect(code).toContain("public execute(");
    // Must NOT contain deprecated patterns
    expect(code).not.toContain("NgModule");
    expect(code).not.toContain("RetailProxy");
  });

  it("renders a Post trigger with Promise<void> return", () => {
    const code = renderTrigger({
      className: "PostSuspendTrigger",
      triggerType: "Post",
      triggerTypeName: "SuspendTransaction",
      operationName: "SuspendTransaction",
      namespace: "Contoso",
      description: "Test post-trigger",
    });
    expect(code).toContain("class PostSuspendTrigger extends Triggers.PostSuspendTransactionTrigger");
    expect(code).toContain("Promise<void>");
    expect(code).toContain("return Promise.resolve()");
  });

  it("includes official source URL in the header comment", () => {
    const code = renderTrigger({
      className: "MyTrigger",
      triggerType: "Pre",
      triggerTypeName: "LogOn",
      operationName: "LogOn",
      namespace: "Contoso",
      description: "desc",
    });
    expect(code).toContain("https://github.com/microsoft/Dynamics365Commerce.Solutions");
  });
});

describe("POS — Operation template", () => {
  it("renders CustomOperation extending ExtensionOperationRequestHandlerBase", () => {
    const code = renderOperation({
      className: "MyOperation",
      operationId: 4001,
      operationName: "MyOperation",
      description: "Test operation",
    });
    expect(code).toContain("extends ExtensionOperationRequestHandlerBase");
    expect(code).toContain("4001");
    expect(code).toContain("supportedRequestType()");
    expect(code).toContain("executeAsync(");
    expect(code).toContain("PosApi/Create/Operations");
  });

  it("operation ID is embedded in the constructor", () => {
    const code = renderOperation({ className: "Op", operationId: 5000, operationName: "Op", description: "" });
    expect(code).toContain("super(5000");
  });
});

describe("POS — Dialog templates", () => {
  it("request extends ShowDialogClientRequest", () => {
    const code = renderDialogRequest({ className: "PinDialog", description: "PIN input dialog" });
    expect(code).toContain("extends ShowDialogClientRequest<IPinDialogResult>");
    expect(code).toContain("IPinDialogResult");
    expect(code).toContain("canceled: boolean");
  });

  it("handler references the request class", () => {
    const code = renderDialogHandler({ className: "PinDialog", description: "PIN input dialog" });
    expect(code).toContain("PinDialogRequest");
    expect(code).toContain("IPinDialogResult");
  });
});

describe("POS — View template", () => {
  it("renders ViewController with onReady and dispose", () => {
    const code = renderViewController({ className: "ProductSearchView", description: "Product search" });
    expect(code).toContain("class ProductSearchView");
    expect(code).toContain("onReady(element: HTMLElement)");
    expect(code).toContain("dispose()");
    expect(code).toContain("ObjectExtensions.disposeAllProperties");
    expect(code).toContain("ICustomViewControllerContext");
  });

  it("renders HTML template with class-derived name", () => {
    const html = renderViewHtml({ className: "ProductSearchView", description: "test" });
    expect(html).toContain("productsearchview-view");
    expect(html).toContain("<!-- TODO:");
  });
});

describe("POS — Control template", () => {
  it("renders CartViewCustomControlBase with lifecycle methods", () => {
    const params = { className: "NumpadControl", controlName: "numpadControl", folder: "Cart", packageName: "ContosoExt", description: "Numpad" };
    const code = renderCartViewCustomControl(params);
    expect(code).toContain("class NumpadControlCustomControl extends CartViewCustomControlBase");
    expect(code).toContain("onReady(element: HTMLElement)");
    expect(code).toContain("init(state: ICartViewCustomControlState)");
    expect(code).toContain("ko.observable");
    expect(code).toContain("cartLineSelectedHandler");
  });
});

describe("POS — Manifest template", () => {
  it("generates valid JSON with schema field", () => {
    const json = renderManifest(
      { packageName: "ContosoExt", publisher: "Contoso", version: "1.0.0.0", description: "test", minimumPosVersion: "9.56.0.0" },
      {}
    );
    const parsed = JSON.parse(json);
    expect(parsed.$schema).toContain("manifestSchema.json");
    expect(parsed.name).toBe("ContosoExt");
    expect(parsed.publisher).toBe("Contoso");
    expect(parsed.minimumPosVersion).toBe("9.56.0.0");
  });

  it("includes trigger entries when provided", () => {
    const json = renderManifest(
      { packageName: "Ext", publisher: "C", version: "1.0.0.0", description: "", minimumPosVersion: "9.56.0.0" },
      {
        triggers: [{
          name: "PreLogOnTrigger",
          description: "Test",
          triggerType: "PreLogOn",
          modulePath: "Triggers/PreLogOnTrigger",
        }],
      }
    );
    const parsed = JSON.parse(json);
    expect(parsed.components.extend.triggers).toHaveLength(1);
    expect(parsed.components.extend.triggers[0].triggerType).toBe("PreLogOn");
  });
});

// ── CRT Templates ──────────────────────────────────────────────────────────

describe("CRT — Request/Response/Handler templates", () => {
  const params = {
    namespace: "Contoso.Commerce.Runtime.Loyalty",
    handlerClassName: "GetLoyaltyPointsRequestHandler",
    requestClassName: "GetLoyaltyPointsRequest",
    responseClassName: "GetLoyaltyPointsResponse",
    description: "Gets loyalty points",
  };

  it("request extends Request", () => {
    const code = renderCRTRequest(params);
    expect(code).toContain("class GetLoyaltyPointsRequest : Request");
    expect(code).toContain("namespace Contoso.Commerce.Runtime.Loyalty");
    expect(code).toContain("using Microsoft.Dynamics.Commerce.Runtime.Messages");
  });

  it("response extends Response", () => {
    const code = renderCRTResponse(params);
    expect(code).toContain("class GetLoyaltyPointsResponse : Response");
  });

  it("handler extends SingleAsyncRequestHandler<TRequest>", () => {
    const code = renderCRTHandler(params);
    expect(code).toContain("class GetLoyaltyPointsRequestHandler : SingleAsyncRequestHandler<GetLoyaltyPointsRequest>");
    expect(code).toContain("protected override async Task<Response> Process(GetLoyaltyPointsRequest request)");
    expect(code).toContain("ThrowIf.Null(request");
    expect(code).toContain("using Microsoft.Dynamics.Commerce.Runtime");
  });

  it("CRT ext config registers assembly", () => {
    const xml = renderCRTExtConfig("Contoso.Commerce.Runtime.Loyalty", "GetLoyaltyPointsRequestHandler");
    expect(xml).toContain('value="Contoso.Commerce.Runtime.Loyalty"');
    expect(xml).toContain("commerceRuntimeExtensions");
  });
});

// ── Retail Server Templates ────────────────────────────────────────────────

describe("Retail Server — Controller template", () => {
  const params = {
    namespace: "Contoso.RetailServer.LoyaltyPoints",
    controllerClassName: "LoyaltyPointsController",
    entityName: "LoyaltyPoints",
    description: "Loyalty points controller",
  };

  it("controller implements IController", () => {
    const code = renderRSController(params);
    expect(code).toContain("class LoyaltyPointsController : IController");
    expect(code).toContain('[RoutePrefix("LoyaltyPoints")]');
    expect(code).toContain('[BindEntity(typeof(LoyaltyPoints))]');
    expect(code).toContain("CommerceRoles");
    expect(code).toContain("using Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts");
  });

  it("csproj references Commerce packages", () => {
    const xml = renderRSCsproj("Contoso.RetailServer.LoyaltyPoints", "Contoso.RetailServer.LoyaltyPoints");
    expect(xml).toContain("Microsoft.Dynamics.Commerce.Hosting.Contracts");
    expect(xml).toContain("$(MicrosoftDynamicsCommerceVersion)");
    expect(xml).toContain("net8.0");
  });
});

// ── Hardware Station Templates ─────────────────────────────────────────────

describe("Hardware Station — Controller template", () => {
  it("controller implements IHardwareStationController", () => {
    const code = renderHSController({
      namespace: "Contoso.HardwareStation.FiscalPrinter",
      controllerClassName: "FiscalPrinterController",
      deviceName: "FiscalPrinter",
      description: "Fiscal printer controller",
    });
    expect(code).toContain("class FiscalPrinterController : IHardwareStationController");
    expect(code).toContain('[RoutePrefix("FiscalPrinter")]');
    expect(code).toContain("using Microsoft.Dynamics.Commerce.HardwareStation");
  });
});
