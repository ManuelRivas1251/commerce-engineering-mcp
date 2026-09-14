/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Pattern: Custom POS Transaction Page Control (CartView)
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-transaction
 */

export interface ControlTemplateParams {
  /** PascalCase class name, e.g. "LineDetails" → generates LineDetailsCustomControl */
  className: string;
  /** Subfolder under Extensions, e.g. "Cart" */
  folder: string;
  /** camelCase controlName used in manifest + HQ designer, e.g. "lineDetails" */
  controlName: string;
  /** Package name from manifest, used as HTML template ID prefix */
  packageName: string;
  description: string;
}

// ── CartViewController ────────────────────────────────────────────────────────
export function renderCartViewController(p: ControlTemplateParams): string {
  return `import { ProxyEntities } from "PosApi/Entities";
import { IExtensionCartViewControllerContext } from "PosApi/Extend/Views/CartView";
import * as CartView from "PosApi/Extend/Views/CartView";

/**
 * ${p.description}
 * Handles cart and tender line selection events for the CartView.
 *
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-transaction
 */
export default class ${p.className}CartViewController extends CartView.CartExtensionViewControllerBase {
    private _selectedCartLines: ProxyEntities.CartLine[];
    private _selectedTenderLines: ProxyEntities.TenderLine[];

    constructor(context: IExtensionCartViewControllerContext) {
        super(context);

        this.cartLineSelectedHandler = (data: CartView.CartLineSelectedData): void => {
            this._selectedCartLines = data.cartLines;
        };

        this.cartLineSelectionClearedHandler = (): void => {
            this._selectedCartLines = undefined;
        };

        this.tenderLineSelectedHandler = (data: CartView.TenderLineSelectedData): void => {
            this._selectedTenderLines = data.tenderLines;
        };

        this.tenderLineSelectionClearedHandler = (): void => {
            this._selectedTenderLines = undefined;
        };
    }
}
`;
}

// ── CustomControl TypeScript ───────────────────────────────────────────────────
export function renderCartViewCustomControl(p: ControlTemplateParams): string {
  const templateId = `${p.packageName}_${p.className}`.replace(/[^a-zA-Z0-9_]/g, "_");
  return `import {
    CartViewCustomControlBase,
    ICartViewCustomControlState,
    ICartViewCustomControlContext,
    CartLineSelectedData
} from "PosApi/Extend/Views/CartView";
import { ObjectExtensions, StringExtensions, ArrayExtensions } from "PosApi/TypeExtensions";
import { ProxyEntities } from "PosApi/Entities";

/**
 * ${p.description}
 * Renders custom content inside the CartView transaction panel.
 *
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-transaction
 */
export default class ${p.className}CustomControl extends CartViewCustomControlBase {
    private static readonly TEMPLATE_ID: string = "${templateId}";

    public readonly cartLineItemId: Computed<string>;
    public readonly cartLineDescription: Computed<string>;
    public readonly isCartLineSelected: Computed<boolean>;

    private readonly _cartLine: Observable<ProxyEntities.CartLine>;
    private _state: ICartViewCustomControlState;

    constructor(id: string, context: ICartViewCustomControlContext) {
        super(id, context);

        this._cartLine = ko.observable(null);

        this.cartLineItemId = ko.computed((): string => {
            const cartLine: ProxyEntities.CartLine = this._cartLine();
            return ObjectExtensions.isNullOrUndefined(cartLine) ? StringExtensions.EMPTY : cartLine.ItemId;
        });

        this.cartLineDescription = ko.computed((): string => {
            const cartLine: ProxyEntities.CartLine = this._cartLine();
            return ObjectExtensions.isNullOrUndefined(cartLine) ? StringExtensions.EMPTY : cartLine.Description;
        });

        this.isCartLineSelected = ko.computed((): boolean => !ObjectExtensions.isNullOrUndefined(this._cartLine()));

        this.cartLineSelectedHandler = (data: CartLineSelectedData): void => {
            if (ArrayExtensions.hasElements(data.cartLines)) {
                this._cartLine(data.cartLines[0]);
            }
        };

        this.cartLineSelectionClearedHandler = (): void => {
            this._cartLine(null);
        };
    }

    /**
     * Binds the Knockout template to the given DOM element.
     *
     * IMPORTANT: 'element' is an EMPTY host container. POS does NOT inject the markup from the
     * control's htmlPath into it — the .html only registers the Knockout template below via its
     * <script type="text/html"> block. Never call element.querySelector(...) expecting the .html
     * markup to already be there (it returns null and any later render throws
     * "Cannot read properties of null"). Render by binding a template (as here) or by setting
     * element.innerHTML yourself.
     */
    public onReady(element: HTMLElement): void {
        ko.applyBindingsToNode(element, {
            template: {
                name: ${p.className}CustomControl.TEMPLATE_ID,
                data: this
            }
        });
    }

    /**
     * Disposes the control and releases its resources.
     *
     * If you add timers (setInterval/setTimeout — e.g. to poll a peripheral such as the scale),
     * event subscriptions, or message-channel handlers, clear them here and guard any async
     * callbacks so they do not touch the DOM after disposal. For controls that poll a peripheral,
     * do NOT log on every iteration: logging each failed read floods AppInsights (HTTP 429) — react
     * only when the displayed state changes.
     */
    public dispose(): void {
        super.dispose();
    }

    /**
     * Receives the initial page state (cart lines, tender lines, etc.).
     */
    public init(state: ICartViewCustomControlState): void {
        this._state = state;
    }
}
`;
}

// ── CustomControl HTML template ───────────────────────────────────────────────
export function renderCartViewCustomControlHtml(p: ControlTemplateParams): string {
  const templateId = `${p.packageName}_${p.className}`.replace(/[^a-zA-Z0-9_]/g, "_");
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta charset="utf-8" />
        <title></title>
    </head>
    <body>
        <!--
            The script id must match the TEMPLATE_ID constant in ${p.className}CustomControl.ts.
            POS loads this template via Knockout and renders it inside the CartView panel.
        -->
        <script id="${templateId}" type="text/html">
            <!-- ko ifnot: isCartLineSelected -->
            <p class="h4">No cart line selected</p>
            <!-- /ko -->
            <!-- ko if: isCartLineSelected -->
            <p class="h4">Item: <span data-bind="text: cartLineItemId"></span></p>
            <p class="h4">Description: <span data-bind="text: cartLineDescription"></span></p>
            <!-- /ko -->
        </script>
    </body>
</html>
`;
}

// ── Manifest snippet (for notes) ──────────────────────────────────────────────
export function renderControlManifestSnippet(p: ControlTemplateParams): object {
  return {
    views: {
      CartView: {
        viewController: {
          modulePath: `${p.folder}/${p.className}CartViewController`
        },
        controlsConfig: {
          customControls: [
            {
              // controlName MUST match the "Control name" set in the HQ Screen Layout Designer.
              controlName: p.controlName,
              htmlPath: `${p.folder}/${p.className}CustomControl.html`,
              modulePath: `${p.folder}/${p.className}CustomControl`,
              // name and description are required by the POS manifest schema.
              name: `${p.className}CustomControl`,
              description: p.description
            }
          ]
        }
      }
    }
  };
}
