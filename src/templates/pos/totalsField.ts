/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Pattern: Custom field in the CartView Totals panel
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/custom-field-pos-totals
 */

export interface TotalsFieldTemplateParams {
  /** PascalCase class name, e.g. "SampleCustomField" */
  className: string;
  /**
   * Field name that MUST match the name registered in HQ
   * (Retail → Channel setup → POS setup → Custom fields).
   */
  fieldName: string;
  description: string;
}

export function renderTotalsField(p: TotalsFieldTemplateParams): string {
  return `import { CartViewTotalsPanelCustomFieldBase } from "PosApi/Extend/Views/CartView";
import { ProxyEntities } from "PosApi/Entities";

/**
 * ${p.description}
 *
 * Pattern : Custom field in the Totals panel (CartView)
 * HQ name : "${p.fieldName}"  ← must match the custom field name in HQ
 * Docs    : https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/custom-field-pos-totals
 */
export default class ${p.className} extends CartViewTotalsPanelCustomFieldBase {
    /**
     * Returns the string value displayed in the Totals panel for this field.
     * @param cart The current cart entity.
     */
    public computeValue(cart: ProxyEntities.Cart): string {
        // TODO: replace with your custom logic.
        // Example: show 10% of the cart total.
        if (isNaN(cart.TotalAmount) || cart.TotalAmount <= 0) {
            return "$0.00";
        }
        return "$" + (cart.TotalAmount * 0.1).toFixed(2).toString();
    }
}
`;
}

// Manifest snippet for notes
export function renderTotalsFieldManifestSnippet(p: TotalsFieldTemplateParams, modulePath: string): object {
  return {
    views: {
      CartView: {
        totalsPanel: {
          customFields: [
            { fieldName: p.fieldName, modulePath }
          ]
        }
      }
    }
  };
}
