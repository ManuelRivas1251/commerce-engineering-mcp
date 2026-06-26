/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Pattern: POS Custom Operation (IOperationHandler)
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-operations
 */
export interface OperationTemplateParams {
  className: string;
  operationId: number;
  operationName: string;
  description: string;
}

export function renderOperation(p: OperationTemplateParams): string {
  return `/**
 * ${p.description}
 *
 * Pattern  : Custom POS Operation
 * Area     : Store Commerce (POS)
 * OperationId: ${p.operationId}
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Docs     : https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-operations
 */

import { IOperationHandler, IOperationOptions } from "PosApi/Extend/Operations/IOperationHandler";
import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations/IExtensionOperationRequestHandler";
import { ClientEntities } from "PosApi/Entities";

export class ${p.className}Request extends ExtensionOperationRequestType<ClientEntities.ICancelableDataResult<boolean>> {
    constructor(correlationId: string) {
        super(${p.operationId}, correlationId);
    }
}

/**
 * ${p.description}
 */
export default class ${p.className} extends ExtensionOperationRequestHandlerBase<ClientEntities.ICancelableDataResult<boolean>, ${p.className}Request> {
    public supportedRequestType(): typeof ${p.className}Request {
        return ${p.className}Request;
    }

    /**
     * Executes the operation.
     * @param {${p.className}Request} request The operation request.
     * @returns {Promise<ClientEntities.ICancelableDataResult<boolean>>}
     */
    public executeAsync(request: ${p.className}Request): Promise<ClientEntities.ICancelableDataResult<boolean>> {
        // TODO: Implement operation logic here.
        return Promise.resolve({ canceled: false, data: true });
    }
}
`;
}
