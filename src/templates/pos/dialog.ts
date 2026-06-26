/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Pattern: ShowDialog (ShowDialogClientRequest)
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/knockout-pos-extension
 */
export interface DialogTemplateParams {
  className: string;
  description: string;
}

export function renderDialogRequest(p: DialogTemplateParams): string {
  return `/**
 * ${p.description} — Client Request
 *
 * Pattern  : ShowDialogClientRequest
 * Area     : Store Commerce (POS)
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 */

import { ShowDialogClientRequest, ShowDialogClientResponse } from "PosApi/Consume/Dialogs";
import { IExtensionContext } from "PosApi/Framework/IExtensionContext";

export interface I${p.className}Result {
    canceled: boolean;
    // TODO: Add result properties here.
}

export default class ${p.className}Request extends ShowDialogClientRequest<I${p.className}Result> {
    constructor(correlationId: string, context: IExtensionContext) {
        super(correlationId, context);
    }
}
`;
}

export function renderDialogHandler(p: DialogTemplateParams): string {
  return `/**
 * ${p.description} — Dialog Handler
 *
 * Pattern  : ShowDialogClientRequest Handler
 * Area     : Store Commerce (POS)
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 */

import { ShowDialogClientResponse } from "PosApi/Consume/Dialogs";
import { ClientEntities } from "PosApi/Entities";
import ${p.className}Request, { I${p.className}Result } from "./${p.className}Request";

export default class ${p.className}Handler {
    public static show(
        request: ${p.className}Request
    ): Promise<ShowDialogClientResponse<I${p.className}Result>> {
        // TODO: Implement dialog display logic here.
        return Promise.resolve(
            new ShowDialogClientResponse({ canceled: true })
        );
    }
}
`;
}
