/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Based on: src/FiscalIntegration/EFRSample/CommerceRuntime/Services/LocalizeEfrResourceRequestHandler.cs (release/9.56)
 * Pattern: SingleAsyncRequestHandler<TRequest>
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility
 */
export interface CRTHandlerTemplateParams {
  namespace: string;
  handlerClassName: string;
  requestClassName: string;
  responseClassName: string;
  description: string;
}

export function renderCRTRequest(p: CRTHandlerTemplateParams): string {
  return `/**
 * ${p.description} — CRT Request
 *
 * Pattern  : Request / Response
 * Area     : Commerce Runtime (CRT)
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Docs     : https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility
 */

namespace ${p.namespace}
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;

    /// <summary>
    /// ${p.description}
    /// </summary>
    public sealed class ${p.requestClassName} : Request
    {
        /// <summary>
        /// Initializes a new instance of <see cref="${p.requestClassName}"/>.
        /// </summary>
        public ${p.requestClassName}()
        {
        }

        // TODO: Add request properties here.
    }
}
`;
}

export function renderCRTResponse(p: CRTHandlerTemplateParams): string {
  return `/**
 * ${p.description} — CRT Response
 *
 * Pattern  : Request / Response
 * Area     : Commerce Runtime (CRT)
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 */

namespace ${p.namespace}
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;

    /// <summary>
    /// ${p.description}
    /// </summary>
    public sealed class ${p.responseClassName} : Response
    {
        /// <summary>
        /// Initializes a new instance of <see cref="${p.responseClassName}"/>.
        /// </summary>
        public ${p.responseClassName}()
        {
        }

        // TODO: Add response properties here.
    }
}
`;
}

export function renderCRTHandler(p: CRTHandlerTemplateParams): string {
  return `/**
 * ${p.description} — CRT Request Handler
 *
 * Pattern  : SingleAsyncRequestHandler<TRequest>
 * Area     : Commerce Runtime (CRT)
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Docs     : https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility
 */

namespace ${p.namespace}
{
    using System.Threading.Tasks;
    using Microsoft.Dynamics.Commerce.Runtime;
    using Microsoft.Dynamics.Commerce.Runtime.Messages;

    /// <summary>
    /// ${p.description}
    /// </summary>
    public sealed class ${p.handlerClassName} : SingleAsyncRequestHandler<${p.requestClassName}>
    {
        /// <summary>
        /// Processes the <see cref="${p.requestClassName}"/> request.
        /// </summary>
        /// <param name="request">The request.</param>
        /// <returns>The <see cref="${p.responseClassName}"/>.</returns>
        protected override async Task<Response> Process(${p.requestClassName} request)
        {
            ThrowIf.Null(request, nameof(request));

            // TODO: Implement handler logic here.

            return await Task.FromResult(new ${p.responseClassName}());
        }
    }
}
`;
}

export function renderCRTExtConfig(namespace: string, handlerClassName: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!--
  Commerce Runtime Extension Configuration
  Source: https://github.com/microsoft/Dynamics365Commerce.Solutions
  Docs:   https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility
-->
<commerceRuntimeExtensions>
  <composition>
    <!--
      Register your request handler assembly here.
      Source: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility
    -->
    <add source="assembly" value="${namespace}" />
  </composition>
</commerceRuntimeExtensions>
`;
}
