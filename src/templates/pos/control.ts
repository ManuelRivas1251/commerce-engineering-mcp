/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Pattern: Custom POS Control
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-control
 */
export interface ControlTemplateParams {
  className: string;
  description: string;
}

export function renderControl(p: ControlTemplateParams): string {
  return `/**
 * ${p.description}
 *
 * Pattern  : Custom POS Control
 * Area     : Store Commerce (POS)
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Docs     : https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-control
 */

import { ICustomControlContext } from "PosApi/Create/Views/ICustomViewControllerBase";
import { ObjectExtensions } from "PosApi/TypeExtensions";

export default class ${p.className} {
    private readonly _context: ICustomControlContext;
    private _element: HTMLElement | null = null;

    constructor(id: string, context: ICustomControlContext) {
        this._context = context;
    }

    /**
     * Called when the control is rendered into the given element.
     */
    public onReady(element: HTMLElement): void {
        this._element = element;
        // TODO: Initialize control here.
    }

    /**
     * Called when the control is disposed.
     */
    public dispose(): void {
        ObjectExtensions.disposeAllProperties(this);
    }
}
`;
}
