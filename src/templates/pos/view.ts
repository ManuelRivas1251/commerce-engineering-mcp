/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Pattern: Custom POS View (CustomViewControllerBase)
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-view-extension
 */
export interface ViewTemplateParams {
  className: string;
  description: string;
}

export function renderViewController(p: ViewTemplateParams): string {
  return `/**
 * ${p.description} — View Controller
 *
 * Pattern  : CustomViewControllerBase
 * Area     : Store Commerce (POS)
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Docs     : https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-view-extension
 */

import { ICustomViewControllerContext, ICustomViewControllerBaseState } from "PosApi/Create/Views/ICustomViewControllerBase";
import { ObjectExtensions } from "PosApi/TypeExtensions";

export interface I${p.className}State extends ICustomViewControllerBaseState {
    // TODO: Add view state properties here.
}

export default class ${p.className} {
    public readonly context: ICustomViewControllerContext;
    private _state: I${p.className}State;

    constructor(context: ICustomViewControllerContext) {
        this.context = context;
        this._state = {
            isProcessing: false,
        };
    }

    /**
     * Called when the view is loaded.
     */
    public onReady(element: HTMLElement): void {
        // TODO: Initialize view components here.
    }

    /**
     * Called when the view is disposed.
     */
    public dispose(): void {
        ObjectExtensions.disposeAllProperties(this);
    }
}
`;
}

export function renderViewHtml(p: ViewTemplateParams): string {
  return `<!-- ${p.description} — View Template -->
<div class="${p.className.toLowerCase()}-view">
    <!-- TODO: Add view HTML here. -->
</div>
`;
}
