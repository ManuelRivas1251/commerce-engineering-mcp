/**
 * CodeGenerator — orchestrates template rendering + PatternValidator pre-check
 * for all Dynamics 365 Commerce extension artifacts.
 *
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension-overview
 */

import * as path from "path";
import type { CommerceArea, CommerceArtifactType, CommerceVersion } from "../types/commerce.js";
import { PatternValidatorCore, PatternValidationResult } from "./PatternValidatorCore.js";

import { renderTrigger, TriggerTemplateParams } from "../templates/pos/trigger.js";
import { renderOperation, OperationTemplateParams } from "../templates/pos/operation.js";
import { renderDialogRequest, renderDialogHandler, DialogTemplateParams } from "../templates/pos/dialog.js";
import { renderViewController, renderViewHtml, ViewTemplateParams } from "../templates/pos/view.js";
import { renderCartViewController, renderCartViewCustomControl, renderCartViewCustomControlHtml, renderControlManifestSnippet, ControlTemplateParams } from "../templates/pos/control.js";
import { renderCustomColumn, renderCustomColumnManifestSnippet, CustomColumnTemplateParams, GridType } from "../templates/pos/customColumn.js";
import { renderTotalsField, renderTotalsFieldManifestSnippet, TotalsFieldTemplateParams } from "../templates/pos/totalsField.js";
import { renderManifest, ManifestTemplateParams, ManifestComponents } from "../templates/pos/manifest.js";
import { renderCRTRequest, renderCRTResponse, renderCRTHandler, renderCRTExtConfig, CRTHandlerTemplateParams } from "../templates/crt/requestHandler.js";
import { renderRSController, renderRSCsproj, RSControllerTemplateParams } from "../templates/retail-server/controller.js";
import { renderHSController, HSControllerTemplateParams } from "../templates/hardware-station/controller.js";

export interface GeneratedFile {
  relativePath: string;
  content: string;
  language: "typescript" | "csharp" | "json" | "xml" | "html";
}

export interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  validationResult: PatternValidationResult | null;
  notes: string[];
}

function blocked(v: PatternValidationResult): GenerationResult {
  return { success: false, files: [], validationResult: v, notes: ["PatternValidator blocked generation. See validation details."] };
}

export class CodeGenerator {
  private readonly validator: PatternValidatorCore;

  constructor(validator: PatternValidatorCore) {
    this.validator = validator;
  }

  private async validate(
    symbol: string,
    area: CommerceArea,
    artifactType: CommerceArtifactType,
    version: CommerceVersion,
    workspacePath?: string
  ): Promise<PatternValidationResult> {
    // When version is unknown (e.g. new project with no CustomizationPackage.props yet),
    // skip network validation and approve — templates are always structurally correct.
    if (version.version === "UNKNOWN" || version.branch === "UNKNOWN") {
      return {
        approved: true,
        blocked: false,
        pattern: symbol,
        commerceArea: area,
        artifactType,
        version: "UNKNOWN",
        branch: "UNKNOWN",
        conditions: [],
        guard: {
          verified: false,
          blocked: false,
          confidence: "LOW",
          message: "Version unknown — skipped GitHub validation. Templates are based on official Microsoft samples.",
          sources: [],
          alternative: undefined,
        },
        sources: [],
      };
    }
    return this.validator.validate(symbol, area, artifactType, version.branch, version.version, workspacePath);
  }

  async addPosTrigger(params: {
    className: string;
    triggerType: "Pre" | "Post" | "Cancel";
    triggerTypeName: string;
    description: string;
    namespace: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const symbolName = `${params.triggerType}${params.triggerTypeName}Trigger`;
    const validation = await this.validate(symbolName, "POS", "Trigger", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: TriggerTemplateParams = {
      className: params.className,
      triggerType: params.triggerType,
      triggerTypeName: params.triggerTypeName,
      operationName: params.triggerTypeName,
      namespace: params.namespace,
      description: params.description,
    };

    const files: GeneratedFile[] = [
      {
        relativePath: path.join(params.outputDir, "Triggers", `${params.className}.ts`).replace(/\\/g, "/"),
        content: renderTrigger(p),
        language: "typescript",
      },
    ];

    const manifestEntry = {
      name: params.className,
      description: params.description,
      triggerType: symbolName,
      modulePath: `Triggers/${params.className}`,
    };

    return {
      success: true,
      files,
      validationResult: validation,
      notes: [
        `Register this trigger in manifest.json under components.extend.triggers:`,
        JSON.stringify(manifestEntry, null, 2),
      ],
    };
  }

  async addPosOperation(params: {
    className: string;
    operationId: number;
    operationName: string;
    description: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const validation = await this.validate("ExtensionOperationRequestHandlerBase", "POS", "Operation", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: OperationTemplateParams = {
      className: params.className,
      operationId: params.operationId,
      operationName: params.operationName,
      description: params.description,
    };

    return {
      success: true,
      files: [
        {
          relativePath: path.join(params.outputDir, "Operations", `${params.className}.ts`).replace(/\\/g, "/"),
          content: renderOperation(p),
          language: "typescript",
        },
      ],
      validationResult: validation,
      notes: [
        `Register operationId ${params.operationId} in manifest.json under components.extend.operations.`,
        `Ensure operationId ${params.operationId} is unique — check existing operations with list_existing_operations first.`,
      ],
    };
  }

  async addPosDialog(params: {
    className: string;
    description: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const validation = await this.validate("ShowDialogClientRequest", "POS", "Dialog", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: DialogTemplateParams = { className: params.className, description: params.description };

    return {
      success: true,
      files: [
        {
          relativePath: path.join(params.outputDir, "Dialogs", `${params.className}Request.ts`).replace(/\\/g, "/"),
          content: renderDialogRequest(p),
          language: "typescript",
        },
        {
          relativePath: path.join(params.outputDir, "Dialogs", `${params.className}Handler.ts`).replace(/\\/g, "/"),
          content: renderDialogHandler(p),
          language: "typescript",
        },
      ],
      validationResult: validation,
      notes: [],
    };
  }

  async addPosView(params: {
    className: string;
    description: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const validation = await this.validate("ICustomViewControllerBase", "POS", "View", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: ViewTemplateParams = { className: params.className, description: params.description };

    return {
      success: true,
      files: [
        {
          relativePath: path.join(params.outputDir, "Views", `${params.className}.ts`).replace(/\\/g, "/"),
          content: renderViewController(p),
          language: "typescript",
        },
        {
          relativePath: path.join(params.outputDir, "Views", `${params.className}.html`).replace(/\\/g, "/"),
          content: renderViewHtml(p),
          language: "html",
        },
      ],
      validationResult: validation,
      notes: [`Register view in manifest.json under components.extend.views.`],
    };
  }

  async addPosControl(params: {
    className: string;
    controlName: string;
    folder: string;
    packageName: string;
    description: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const validation = await this.validate("CartViewCustomControlBase", "POS", "Control", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: ControlTemplateParams = {
      className: params.className,
      controlName: params.controlName,
      folder: params.folder,
      packageName: params.packageName,
      description: params.description,
    };

    const base = path.join(params.outputDir, params.folder).replace(/\\/g, "/");

    const manifestSnippet = renderControlManifestSnippet(p);

    return {
      success: true,
      files: [
        {
          relativePath: `${base}/${params.className}CartViewController.ts`,
          content: renderCartViewController(p),
          language: "typescript",
        },
        {
          relativePath: `${base}/${params.className}CustomControl.ts`,
          content: renderCartViewCustomControl(p),
          language: "typescript",
        },
        {
          relativePath: `${base}/${params.className}CustomControl.html`,
          content: renderCartViewCustomControlHtml(p),
          language: "html",
        },
      ],
      validationResult: validation,
      notes: [
        `Add to manifest.json under components.extend:`,
        JSON.stringify(manifestSnippet, null, 2),
        ``,
        `Then in HQ → Screen Layouts → Designer, add the custom control panel with:`,
        `  Control Name : ${params.controlName}`,
        `  Package Name : ${params.packageName}`,
        `  Publisher    : (your publisher from manifest.json)`,
        `Run distribution job 1090 (Registers) after saving the layout.`,
        ``,
        `IMPORTANT: the "Control Name" above must match controlName ("${params.controlName}") in manifest.json`,
        `EXACTLY (case-sensitive). If they differ, the POS logs "Control is not configured. Control name: '...'"`,
        `and the control never renders. After redeploying, fully restart Store Commerce so the cached`,
        `extensions bundle (extensions.json) reloads.`,
        ``,
        `Runtime pitfalls:`,
        `  - onReady(element) receives an EMPTY host. POS does not inject the htmlPath markup into it;`,
        `    the .html only registers the Knockout template. Render via ko binding (as generated) or`,
        `    element.innerHTML. element.querySelector(...) on that markup returns null and throws`,
        `    "Cannot read properties of null" — the control then fails to render.`,
        `  - If the control polls a peripheral (e.g. ScaleReadRequest) with setInterval, clear the timer`,
        `    in dispose(), guard async callbacks against post-dispose DOM access, and do NOT log every`,
        `    failed read — per-iteration logging floods AppInsights (HTTP 429). React only on state change.`,
      ],
    };
  }

  async addPosCustomColumn(params: {
    className: string;
    title: string;
    gridType: GridType;
    columnNumber: number;
    description: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const baseClass = params.gridType === "Lines"    ? "CustomLinesGridColumnBase"
                    : params.gridType === "Payments" ? "CustomPaymentsGridColumnBase"
                    :                                  "CustomDeliveryGridColumnBase";
    const validation = await this.validate(baseClass, "POS", "Control", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: CustomColumnTemplateParams = {
      className:    params.className,
      title:        params.title,
      gridType:     params.gridType,
      columnNumber: params.columnNumber,
      description:  params.description,
    };

    const filePath = path.join(params.outputDir, `${params.className}.ts`).replace(/\\/g, "/");
    const modulePath = filePath
      .replace(/\\/g, "/")
      .replace(/\.ts$/, "")
      .split("Extensions/")
      .pop() ?? params.className;

    const manifestSnippet = renderCustomColumnManifestSnippet(p, modulePath);

    return {
      success: true,
      files: [
        { relativePath: filePath, content: renderCustomColumn(p), language: "typescript" },
      ],
      validationResult: validation,
      notes: [
        `Add to manifest.json under components.extend:`,
        JSON.stringify(manifestSnippet, null, 2),
        ``,
        `HQ configuration (required before the column appears in POS):`,
        `  1. Go to Screen Layouts → select your layout → Designer`,
        `  2. Right-click the transaction grid → Customize`,
        `  3. In the Lines pivot, move "Custom column ${params.columnNumber}" to Selected columns`,
        `  4. Run Retail and Commerce IT → Distribution schedule → Registers (1090)`,
      ],
    };
  }

  async addPosTotalsField(params: {
    className: string;
    fieldName: string;
    description: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const validation = await this.validate("CartViewTotalsPanelCustomFieldBase", "POS", "Control", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: TotalsFieldTemplateParams = {
      className:   params.className,
      fieldName:   params.fieldName,
      description: params.description,
    };

    const filePath = path.join(params.outputDir, `${params.className}.ts`).replace(/\\/g, "/");
    const modulePath = filePath
      .replace(/\\/g, "/")
      .replace(/\.ts$/, "")
      .split("Extensions/")
      .pop() ?? params.className;

    const manifestSnippet = renderTotalsFieldManifestSnippet(p, modulePath);

    return {
      success: true,
      files: [
        { relativePath: filePath, content: renderTotalsField(p), language: "typescript" },
      ],
      validationResult: validation,
      notes: [
        `Add to manifest.json under components.extend:`,
        JSON.stringify(manifestSnippet, null, 2),
        ``,
        `Required HQ configuration (must be done before testing in POS):`,
        `  1. Language Text → POS tab → Add text (Text ID + label for each language)`,
        `  2. Custom Fields → New: Name="${params.fieldName}", Type="Totals area", Caption text ID=<id from step 1>`,
        `  3. Screen Layouts → Designer → right-click Totals panel → Customize → move "${params.fieldName}" to a column`,
        `  4. Run Retail and Commerce IT → Distribution schedule → Registers (1090)`,
        ``,
        `The fieldName "${params.fieldName}" in manifest.json MUST exactly match the Name in HQ Custom Fields.`,
      ],
    };
  }

  async addCRTRequestHandler(params: {
    namespace: string;
    handlerClassName: string;
    requestClassName: string;
    responseClassName: string;
    description: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const validation = await this.validate("SingleAsyncRequestHandler", "CRT", "Handler", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: CRTHandlerTemplateParams = {
      namespace: params.namespace,
      handlerClassName: params.handlerClassName,
      requestClassName: params.requestClassName,
      responseClassName: params.responseClassName,
      description: params.description,
    };

    return {
      success: true,
      files: [
        {
          relativePath: path.join(params.outputDir, "Messages", `${params.requestClassName}.cs`).replace(/\\/g, "/"),
          content: renderCRTRequest(p),
          language: "csharp",
        },
        {
          relativePath: path.join(params.outputDir, "Messages", `${params.responseClassName}.cs`).replace(/\\/g, "/"),
          content: renderCRTResponse(p),
          language: "csharp",
        },
        {
          relativePath: path.join(params.outputDir, `${params.handlerClassName}.cs`).replace(/\\/g, "/"),
          content: renderCRTHandler(p),
          language: "csharp",
        },
      ],
      validationResult: validation,
      notes: [
        `Register the assembly in CommerceRuntime.Ext.config:`,
        renderCRTExtConfig(params.namespace, params.handlerClassName),
      ],
    };
  }

  async addRetailServerController(params: {
    namespace: string;
    controllerClassName: string;
    entityName: string;
    description: string;
    projectName: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const validation = await this.validate("IController", "RetailServer", "RetailServerAPI", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: RSControllerTemplateParams = {
      namespace: params.namespace,
      controllerClassName: params.controllerClassName,
      entityName: params.entityName,
      description: params.description,
    };

    return {
      success: true,
      files: [
        {
          relativePath: path.join(params.outputDir, `${params.controllerClassName}.cs`).replace(/\\/g, "/"),
          content: renderRSController(p),
          language: "csharp",
        },
        {
          relativePath: path.join(params.outputDir, `${params.projectName}.csproj`).replace(/\\/g, "/"),
          content: renderRSCsproj(params.namespace, params.projectName),
          language: "xml",
        },
      ],
      validationResult: validation,
      notes: [
        `Ensure your .csproj references CustomizationPackage.props to inherit $(MicrosoftDynamicsCommerceVersion).`,
        `Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility`,
      ],
    };
  }

  async addHardwareStationController(params: {
    namespace: string;
    controllerClassName: string;
    deviceName: string;
    description: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const validation = await this.validate("IHardwareStationController", "HardwareStation", "HardwareStationExtension", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: HSControllerTemplateParams = {
      namespace: params.namespace,
      controllerClassName: params.controllerClassName,
      deviceName: params.deviceName,
      description: params.description,
    };

    return {
      success: true,
      files: [
        {
          relativePath: path.join(params.outputDir, `${params.controllerClassName}.cs`).replace(/\\/g, "/"),
          content: renderHSController(p),
          language: "csharp",
        },
      ],
      validationResult: validation,
      notes: [
        `Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension`,
      ],
    };
  }

  generateManifest(params: ManifestTemplateParams, components: ManifestComponents): GeneratedFile {
    return {
      relativePath: "manifest.json",
      content: renderManifest(params, components),
      language: "json",
    };
  }
}
