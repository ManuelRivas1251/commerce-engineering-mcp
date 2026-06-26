/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Pattern: CommerceController (Retail Server / CSU Extension)
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility
 */
export interface RSControllerTemplateParams {
  namespace: string;
  controllerClassName: string;
  entityName: string;
  description: string;
}

export function renderRSController(p: RSControllerTemplateParams): string {
  return `/**
 * ${p.description}
 *
 * Pattern  : CommerceController
 * Area     : Retail Server / Commerce Scale Unit
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Docs     : https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility
 */

namespace ${p.namespace}
{
    using System.Threading.Tasks;
    using Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts;
    using Microsoft.Dynamics.Commerce.Runtime;

    /// <summary>
    /// ${p.description}
    /// </summary>
    [RoutePrefix("${p.entityName}")]
    [BindEntity(typeof(${p.entityName}))]
    public class ${p.controllerClassName} : IController
    {
        /// <summary>
        /// Gets an entity by its identifier.
        /// </summary>
        /// <param name="key">The entity key.</param>
        /// <param name="queryResultSettings">The query result settings.</param>
        /// <param name="context">The request context.</param>
        /// <returns>The entity.</returns>
        [HttpGet]
        [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
        public async Task<${p.entityName}> Get(string key, QueryResultSettings queryResultSettings, IContext context)
        {
            ThrowIf.NullOrWhiteSpace(key, nameof(key));
            ThrowIf.Null(context, nameof(context));

            // TODO: Implement entity retrieval logic here via CRT request.
            throw new System.NotImplementedException();
        }

        // TODO: Add additional action methods (Post, Put, Delete) as needed.
    }
}
`;
}

export function renderRSCsproj(namespace: string, projectName: string): string {
  return `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <!--
      Retail Server Extension Project
      Source: https://github.com/microsoft/Dynamics365Commerce.Solutions
      Docs:   https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-extensibility
    -->
    <TargetFramework>net8.0</TargetFramework>
    <AssemblyName>${namespace}</AssemblyName>
    <RootNamespace>${namespace}</RootNamespace>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.Dynamics.Commerce.Hosting.Contracts" Version="$(MicrosoftDynamicsCommerceVersion)" />
    <PackageReference Include="Microsoft.Dynamics.Commerce.Runtime.Framework" Version="$(MicrosoftDynamicsCommerceVersion)" />
  </ItemGroup>
</Project>
`;
}
