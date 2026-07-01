/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Pattern: Custom column in CartView Lines / Payments / Delivery grid
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-transaction-column
 *       https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cart-view-handlers
 */

export type GridType = "Lines" | "Payments" | "Delivery";

export interface CustomColumnTemplateParams {
  /** PascalCase class name, e.g. "LineNumberColumn" */
  className: string;
  /** Display title shown in the column header */
  title: string;
  /** Which grid this column belongs to */
  gridType: GridType;
  /** Which custom column slot (1-10) */
  columnNumber: number;
  description: string;
}

// Map grid type → base class and import
const BASE_CLASS: Record<GridType, string> = {
  Lines:    "CustomLinesGridColumnBase",
  Payments: "CustomPaymentsGridColumnBase",
  Delivery: "CustomDeliveryGridColumnBase",
};

const CONTEXT_CLASS: Record<GridType, string> = {
  Lines:    "ICustomLinesGridColumnContext",
  Payments: "ICustomPaymentsGridColumnContext",
  Delivery: "ICustomDeliveryGridColumnContext",
};

const COMPUTE_PARAM: Record<GridType, string> = {
  Lines:    "cartLine: ProxyEntities.CartLine",
  Payments: "cartLine: ProxyEntities.CartLine",
  Delivery: "cartLine: ProxyEntities.CartLine",
};

export function renderCustomColumn(p: CustomColumnTemplateParams): string {
  const baseClass    = BASE_CLASS[p.gridType];
  const contextClass = CONTEXT_CLASS[p.gridType];
  const computeParam = COMPUTE_PARAM[p.gridType];

  return `import {
    ${baseClass},
    ${contextClass}
} from "PosApi/Extend/Views/CartView";
import { CustomGridColumnAlignment } from "PosApi/Extend/Views/CustomGridColumns";
import { ProxyEntities } from "PosApi/Entities";

/**
 * ${p.description}
 *
 * Grid    : CartView → ${p.gridType} grid (custom column ${p.columnNumber})
 * Docs    : https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-transaction-column
 */
export default class ${p.className} extends ${baseClass} {
    constructor(context: ${contextClass}) {
        super(context);
    }

    /** Column header text shown in the transaction grid. */
    public title(): string {
        return "${p.title}";
    }

    /**
     * Returns the cell value for a given cart line.
     * Modify this method to display the data you need.
     */
    public computeValue(${computeParam}): string {
        // TODO: replace with your custom logic
        return cartLine.LineNumber ? cartLine.LineNumber.toString() : "";
    }

    /** Column text alignment. */
    public alignment(): CustomGridColumnAlignment {
        return CustomGridColumnAlignment.Right;
    }
}
`;
}

// Manifest snippet for notes
export function renderCustomColumnManifestSnippet(p: CustomColumnTemplateParams, modulePath: string): object {
  const gridKey = p.gridType === "Lines"    ? "linesGrid"
                : p.gridType === "Payments" ? "paymentsGrid"
                :                             "deliveryGrid";

  const columnKey = `customColumn${p.columnNumber}`;

  return {
    views: {
      CartView: {
        [gridKey]: {
          [columnKey]: { modulePath }
        }
      }
    }
  };
}
