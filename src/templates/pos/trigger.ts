/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Based on: src/ExtendedLogon/Pos/Triggers/PreLogOnTrigger.ts (release/9.56)
 */
export interface TriggerTemplateParams {
  className: string;
  triggerType: "Pre" | "Post" | "Cancel";
  operationName: string;
  triggerTypeName: string;      // e.g. "PreLogOn", "PostSuspendTransaction"
  namespace: string;
  description: string;
}

export function renderTrigger(p: TriggerTemplateParams): string {
  const importPath = p.triggerType === "Pre" || p.triggerType === "Cancel"
    ? "PosApi/Extend/Triggers/ApplicationTriggers"
    : "PosApi/Extend/Triggers/TransactionTriggers";

  const baseClass = `${p.triggerType}${p.triggerTypeName}Trigger`;
  const optionsType = `I${p.triggerType}${p.triggerTypeName}TriggerOptions`;
  const resultType = p.triggerType === "Pre"
    ? `CancelableTriggerResult<${optionsType}>`
    : "void";
  const returnType = p.triggerType === "Pre"
    ? `Promise<${resultType}>`
    : "Promise<void>";

  return `/**
 * ${p.description}
 *
 * Pattern  : ${p.triggerType}Trigger
 * Area     : Store Commerce (POS)
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 */

import * as Triggers from "${importPath}";
import { CancelableTriggerResult } from "PosApi/Extend/Triggers/Triggers";

/**
 * ${p.description}
 */
export default class ${p.className} extends Triggers.${baseClass} {
    /**
     * Executes the trigger functionality.
     * @param {Triggers.${optionsType}} options The options provided to the trigger.
     * @returns {${returnType}}
     */
    public execute(options: Triggers.${optionsType}): ${returnType} {
        // TODO: Implement trigger logic here.
        // options contains the context data for this trigger invocation.
${p.triggerType === "Pre"
  ? `        return Promise.resolve(new CancelableTriggerResult(false, options));`
  : `        return Promise.resolve();`}
    }
}
`;
}
