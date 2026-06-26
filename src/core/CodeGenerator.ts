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
import { renderControl, ControlTemplateParams } from "../templates/pos/control.js";
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
    description: string;
    outputDir: string;
    version: CommerceVersion;
    workspacePath?: string;
  }): Promise<GenerationResult> {
    const validation = await this.validate("ICustomControlContext", "POS", "Control", params.version, params.workspacePath);
    if (!validation.approved) return blocked(validation);

    const p: ControlTemplateParams = { className: params.className, description: params.description };

    return {
      success: true,
      files: [
        {
          relativePath: path.join(params.outputDir, "Controls", `${params.className}.ts`).replace(/\\/g, "/"),
          content: renderControl(p),
          language: "typescript",
        },
      ],
      validationResult: validation,
      notes: [],
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
