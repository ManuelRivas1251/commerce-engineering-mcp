/**
 * DocsCatalog — static embedded knowledge base of official Microsoft Learn documentation.
 *
 * Pages are stored as structured entries with searchable text, tags, and code blocks.
 * This allows the MCP to answer questions about Commerce SDK fundamentals without a
 * network call and with zero risk of hallucination (content comes verbatim from MS Learn).
 */

export type DocCategory =
  | "sdk-overview"
  | "migration"
  | "health-check"
  | "obsolete-apis"
  | "packages"
  | "repositories"
  | "branching"
  | "dev-environment"
  | "build-pipeline"
  | "payments"
  | "localization"
  | "headless-commerce"
  | "api-reference"
  | "extensibility"
  | "samples"
  | "deployment"
  | "pos-extensions";

export interface DocEntry {
  id: string;
  title: string;
  sourceUrl: string;
  category: DocCategory;
  tags: string[];
  summary: string;
  content: string;
  codeBlocks: string[];
  retrievedAt: string;
}

const RETRIEVED_AT = "2026-06-29T00:00:00.000Z";

// ─── Page 1: SDK GitHub Overview ─────────────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/sdk-github

const SDK_GITHUB_ENTRIES: DocEntry[] = [
  {
    id: "sdk-extension-components",
    title: "Extension Components in Dynamics 365 Commerce",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/sdk-github",
    category: "sdk-overview",
    tags: ["sdk", "components", "pos", "crt", "retail-server", "hardware-station", "payment-connector", "typescript-proxy"],
    summary:
      "Overview of the six extension points in the Commerce SDK: Store Commerce (POS), CRT, Headless Commerce APIs, TypeScript proxy, Hardware Station, and Payment Connector.",
    content: `
## Extension Components in Dynamics 365 Commerce

The Commerce SDK includes the code, code samples, templates, and tools that you need to extend or customize Dynamics 365 Commerce functionality.

### Store Commerce (POS)
- **Scenario**: Extend the Store Commerce app for UX changes, client logic, workflows, and simple validations.
- **SDK Reference**: https://github.com/microsoft/Dynamics365Commerce.InStore
- **Technology**: TypeScript, HTML, and CSS
- **Docs**: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-run-samples

### Commerce Runtime (CRT)
- **Scenario**: Extend CRT to add or change business logic, such as logic for calculating tax, prices, or discounts.
- **SDK Reference**: https://github.com/microsoft/Dynamics365Commerce.ScaleUnit
- **Technology**: C#
- **Docs**: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility

### Headless Commerce APIs (Retail Server)
- **Scenario**: Create a Headless Commerce API extension to expose new Commerce APIs to the client.
- **SDK Reference**: https://github.com/microsoft/Dynamics365Commerce.ScaleUnit
- **Technology**: OData and C#
- **Docs**: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-icontroller-extension

### TypeScript Proxy
- **Scenario**: Use a TypeScript proxy when you need to consume new Headless Commerce API extensions in POS or E-Commerce clients.
- **SDK Reference**: CommerceProxyGenerator in https://github.com/microsoft/Dynamics365Commerce.ScaleUnit
- **Technology**: OData and C#

### Hardware Station
- **Scenario**: Add or change logic related to peripherals.
- **SDK Reference**: src/HardwareStationSample in https://github.com/microsoft/Dynamics365Commerce.InStore
- **Technology**: C#
- **Docs**: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension

### Payment Connector
- **Scenario**: Integrate the POS with a new payment connector.
- **SDK Reference**: src/HardwareStationSample/PaymentDevices in https://github.com/microsoft/Dynamics365Commerce.InStore
- **Technology**: C#
- **Docs**: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/end-to-end-payment-extension

### Naming Best Practice
The C# source code in the Commerce SDK uses the **Contoso** namespace. Extension libraries must NOT begin with **Microsoft.Dynamics** name.
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "sdk-repositories",
    title: "Commerce SDK GitHub Repositories",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/sdk-github",
    category: "repositories",
    tags: ["sdk", "github", "repository", "scaleunit", "instore", "solutions", "branch", "version"],
    summary:
      "The three official GitHub repositories for Commerce SDK: Dynamics365Commerce.ScaleUnit (CRT, Retail Server, Channel DB), Dynamics365Commerce.InStore (POS, Hardware Station), and Dynamics365Commerce.Solutions (E2E scenarios).",
    content: `
## Commerce SDK GitHub Repositories

### Dynamics365Commerce.ScaleUnit
- **URL**: https://github.com/microsoft/Dynamics365Commerce.ScaleUnit
- **Purpose**: Sample code for customizing CRT, Retail Server, and channel database.
- **Folders**:
  - ChannelDatabase (./src/ScaleUnitSample/ChannelDatabase) — Commerce Runtime database extensions
  - CommerceRuntime (./src/ScaleUnitSample/CommerceRuntime) — CRT services, entities, messages, request handlers
  - ScaleUnit (./src/ScaleUnitSample/ScaleUnit) — CSU package generation
  - ScaleUnit.Installer (./src/ScaleUnitSample/Installer) — CSU installer generation
  - POS (./src/ScaleUnitSample/POS) — POS extension samples
  - E-CommerceProxyGenerator — Extension proxies for E-Commerce

### Dynamics365Commerce.InStore
- **URL**: https://github.com/microsoft/Dynamics365Commerce.InStore
- **Purpose**: Sample code for POS, Hardware Station, CRT, headless Commerce APIs, and channel database.
- **Folders**:
  - HardwareStationSample — Hardware station, Payment extensions, and extension installers
  - POSSample (Pos.sln) — POS, CRT, headless Commerce APIs, and Hardware station extension samples

### Dynamics365Commerce.Solutions
- **URL**: https://github.com/microsoft/Dynamics365Commerce.Solutions
- **Purpose**: E2E business scenario customization demos (POS + e-Commerce + headless commerce engine).

### Repository Metadata Files
Each extension repository contains:
- **nuget.config** — NuGet package source configuration
- **repo.props** — Repository properties
- **CustomizationPackage.props** — Customization package properties (contains Commerce version)
- **Build pipeline scripts** (YAML)

### Version to Branch Mapping
| Release Branch | SDK Version | D365 App Release |
|---|---|---|
| release/9.50 | 9.50.* | 10.0.40 |
| release/9.51 | 9.51.* | 10.0.41 |
| release/9.52 | 9.52.* | 10.0.42 |
| release/9.53 | 9.53.* | 10.0.43 |
| release/9.54 | 9.54.* | 10.0.44 |
| release/9.55 | 9.55.* | 10.0.45 |
| release/9.56 | 9.56.* | 10.0.46 |
| release/9.38 | 9.38.* | 10.0.28 |
| release/9.37 | 9.37.* | 10.0.27 |
| release/9.36 | 9.36.* | 10.0.26 |
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "sdk-nuget-packages",
    title: "Commerce SDK NuGet Reference Packages",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/sdk-github",
    category: "packages",
    tags: ["nuget", "packages", "feed", "sdk", "crt", "retail-server", "pos", "hardware-station", "installer"],
    summary:
      "Complete list of Commerce SDK NuGet packages available in the public feed, including the feed URL and version pinning strategies.",
    content: `
## Commerce SDK NuGet Reference Packages

### Public Feed URL
\`\`\`
https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/nuget/v3/index.json
\`\`\`

Add to nuget.config:
\`\`\`xml
<packageSources>
  <add key="dynamics365-commerce" value="https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/nuget/v3/index.json" />
  <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
</packageSources>
\`\`\`

### Key Packages

| Package | Purpose |
|---|---|
| Microsoft.Dynamics.Commerce.Sdk.Runtime | **Meta package** for all CRT and Retail Server extensions (contracts, messages, requests/responses, entities) |
| Microsoft.Dynamics.Commerce.Sdk.ScaleUnit | Generate the CSU package for deployment |
| Microsoft.Dynamics.Commerce.Sdk.Installers.ScaleUnit | Generate the ScaleUnit package for deployment |
| Microsoft.Dynamics.Commerce.Sdk.ChannelDatabase | Generate DB packages with CSU |
| Microsoft.Dynamics.Commerce.Sdk.HardwareAndPeripherals | All Hardware Station and peripherals libraries |
| Microsoft.Dynamics.Commerce.Sdk.Installers | All installer libraries |
| Microsoft.Dynamics.Commerce.Sdk.Installers.HardwareStation | Generate Hardware Station package for deployment |
| Microsoft.Dynamics.Commerce.Sdk.Pos | All POS libraries |
| Microsoft.Dynamics.Commerce.Sdk.Installers.ModernPos | Generate POS extension installer for deployment |
| Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts | Controller libraries (for Retail Server IController) |
| Microsoft.Dynamics.Commerce.Runtime.Framework | Framework libraries |
| Microsoft.Dynamics.Commerce.Runtime.Entities | Entity definitions |
| Microsoft.Dynamics.Commerce.Runtime.Messages | Runtime message libraries |
| Microsoft.Dynamics.Commerce.Proxy.ScaleUnit | Proxy classes for consuming headless Commerce APIs in online mode |
| Microsoft.Dynamics.Commerce.PaymentSDK.Extensions.Portable | Payment extension libraries |
| Microsoft.Dynamics.Commerce.Tools.ExtensionsProxyGenerator.AspNetCore | Extensions proxy generator utilities |

### Package Version Pinning

Without wildcard (exact version):
\`\`\`xml
<PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Runtime" Version="9.56.1.0" />
\`\`\`

With wildcard (latest patch):
\`\`\`xml
<PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Runtime" Version="9.56.*" />
\`\`\`

**Warning**: Do NOT consume a higher SDK version than your go-live application version — this causes runtime and deployment failures.

### Package Version to App Release Mapping
| Package Version Pattern | App Release |
|---|---|
| 9.36.x.x | 10.0.26 |
| 9.37.x.x | 10.0.27 |
| 9.38.x.x | 10.0.28 |
| 9.50.x.x | 10.0.40 |
| 9.51.x.x | 10.0.41 |
| 9.52.x.x | 10.0.42 |
| 9.53.x.x | 10.0.43 |
| 9.54.x.x | 10.0.44 |
| 9.55.x.x | 10.0.45 |
| 9.56.x.x | 10.0.46 |
`.trim(),
    codeBlocks: [
      `<packageSources>
  <add key="dynamics365-commerce" value="https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/nuget/v3/index.json" />
  <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
</packageSources>`,
      `<PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Runtime" Version="9.56.*" />`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "sdk-branching-strategy",
    title: "Commerce SDK Git Branching Strategy",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/sdk-github",
    category: "branching",
    tags: ["git", "branching", "feature-branch", "release-branch", "hotfix", "azure-devops"],
    summary:
      "Recommended Git branching strategy for Commerce SDK extensions: feature branches, release branches, and hotfix branches.",
    content: `
## Commerce SDK Git Branching Strategy

### Key Principles
1. Use feature branches for all new features and bug fixes.
2. Merge feature branches into the main branch via pull requests.
3. Keep a high-quality, up-to-date main branch.

### Create a Development Feature Branch
\`\`\`dos
git checkout -b private/{username}/{feature/description}
git add .
git commit -m "commit message"
git push origin {private branch name}
\`\`\`

### Create a Release Branch
\`\`\`dos
git checkout -b release/x.x.x
\`\`\`

Merge release changes back to main:
\`\`\`dos
git checkout main
git merge release/x.x.x
\`\`\`

### Hotfix Branch
1. Create a hotfix branch from main.
2. Release the fix.
3. Merge back to main.

### Azure Pipeline Setup
For build automation and package generation, see:
https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/build-pipeline
`.trim(),
    codeBlocks: [
      `git checkout -b private/{username}/{feature/description}
git add .
git commit -m "commit message"
git push origin {private branch name}`,
      `git checkout -b release/x.x.x`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 2: Migrate to Commerce SDK ─────────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/migrate-commerce-sdk

const MIGRATE_SDK_ENTRIES: DocEntry[] = [
  {
    id: "migrate-overview-benefits",
    title: "Migrate to Commerce SDK — Overview and Benefits",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/migrate-commerce-sdk",
    category: "migration",
    tags: ["migration", "retail-sdk", "commerce-sdk", "sealed-installers", "benefits", "deprecated"],
    summary:
      "The Retail SDK was deprecated in October 2023. The Commerce SDK provides independent extension packaging, sealed installers, improved build times, and no code-merge upgrades.",
    content: `
## Migration to Commerce SDK — Overview

**IMPORTANT**: Support for the Retail SDK ended in October 2023. All extensions must migrate to the Commerce SDK.

### Key Differences
- **Independent extensions**: Extensions can be independently developed and deployed — no code merge required.
- **Sealed installers**: Separate the extension from the base installer. Base and extension can be independently installed and serviced.
- **No LCS dependency**: Packages are published to GitHub and a public NuGet feed. No more multi-hour downloads from LCS.
- **Modern toolchain**: Visual Studio Code, Git for source control, Azure DevOps for CI/CD.

### Benefits of the Commerce SDK
- **Simplified updates**: Update core application and extensions independently, no code merge.
- **Improved performance**: .NET Standard 2.0 + ASP.NET Core 3.1 for CSU = better API performance.
- **Fast downloads**: SDK packages downloadable in minutes (vs. hours via LCS).
- **Headless installers**: No UI, ideal for mass deployment.
- **Automated packaging**: CRT and Hardware Station extension configuration files are auto-generated.
- **Improved build times** and developer experience.

### Comparison: Commerce SDK vs Retail SDK
| Aspect | Commerce SDK (New) | Retail SDK (Legacy) |
|---|---|---|
| Samples | GitHub | \\Sample extension folder in Retail SDK |
| Getting the SDK | GitHub + public NuGet feed | LCS development VM |
| Reference libraries | Public NuGet feed | /Pkgs folder in Retail SDK |
| Deployment packages | Separate CSU + self-service packages; config auto-generated | One combined package; manual config updates required |
| Installers | Separate sealed installers for core and extensions | Combined installer (e.g., one Modern POS for core + extensions) |
| Build pipeline | Own Azure DevOps pipeline using sample YAML from GitHub | dirs.proj-based pipeline in Retail SDK |
| Updates | Update package version in NuGet | LCS update process |
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "migrate-crt-extensions",
    title: "Migrate CRT Extensions to Commerce SDK",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/migrate-commerce-sdk",
    category: "migration",
    tags: ["crt", "migration", "nuget", "net-standard", "commerce-sdk", "package-reference"],
    summary:
      "Migrate CRT extensions by targeting .NET Standard 2.0 and consuming packages from the public NuGet feed instead of the Retail SDK /Pkgs folder.",
    content: `
## Migrate CRT Extensions

### Steps
1. Change project target to **.NET Standard 2.0**.
2. Replace Retail SDK \`\\Pkgs\` folder references with NuGet packages from the public feed.
3. Do NOT use service or workflow classes from Retail SDK (not available in Commerce SDK).

### Project File Change
\`\`\`xml
<PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Runtime" Version="$(CommerceSdkPackagesVersion)" />
\`\`\`

### Package Mapping: Legacy → Commerce SDK
| Legacy Retail SDK Package | Commerce SDK Package |
|---|---|
| Microsoft.Dynamics.Commerce.Runtime.Services | Microsoft.Dynamics.Commerce.Sdk.Runtime |
| Microsoft.Dynamics.Commerce.Runtime.TransactionService | Microsoft.Dynamics.Commerce.Sdk.Runtime |
| Microsoft.Dynamics.Commerce.Runtime.Workflow | Microsoft.Dynamics.Commerce.Sdk.Runtime |
| Microsoft.Dynamics.Commerce.Runtime.Services.Messages | Microsoft.Dynamics.Commerce.Sdk.Runtime |
| Microsoft.Dynamics.Commerce.Runtime.Data | Microsoft.Dynamics.Commerce.Sdk.Runtime |
| Microsoft.Dynamics.Commerce.Runtime.Services.PricingEngine | Microsoft.Dynamics.Commerce.Runtime.Services.PricingEngine.Contracts |

### Helper Class Migration: Legacy → Commerce SDK Request/Response
| Legacy SDK Helper | Commerce SDK Equivalent |
|---|---|
| TransactionServiceClient.InvokeExtensionMethod | InvokeExtensionMethodRealtimeRequest + InvokeExtensionMethodRealtimeResponse |
| LoadSalesTransactionForReturn | GetSalesOrderDetailsByTransactionIdServiceRequest |
| GetProductsInCartLines | GetProductsInCartLinesServiceRequest |
| LoadSalesTransaction | GetCartRequest with CartSearchCriteria |
| SaveSalesTransaction | SaveSalesTransactionDataRequest |
| CartWorkflowHelper.PerformSaveCartOperations | SaveCartRequest |
| CartWorkflowHelper.ConvertToCart | ConvertSalesTransactionToCartServiceRequest |
| RuntimeReceiptLocalizer.GetLocalizedString | GetLocalizedTextsDataRequest |
| DataCacheAccessor | Use .NET memory cache (DataCacheAccessor is internal) |
| PricingEngine (direct call) | Use CalculatePricesServiceRequest or CalculateDiscountsServiceRequest |
| PricingDatabaseAccessor | Obsolete since 10.0.1 — use relevant CRT data requests |
`.trim(),
    codeBlocks: [
      `<PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Runtime" Version="$(CommerceSdkPackagesVersion)" />`,
      `// Legacy: TransactionServiceClient
TransactionServiceClient transactionService = new TransactionServiceClient(request.RequestContext);
transactionService.InvokeExtensionMethod("getSalesOrderDetails");

// Commerce SDK:
InvokeExtensionMethodRealtimeRequest extensionRequest = new InvokeExtensionMethodRealtimeRequest("getSalesOrderDetails");
InvokeExtensionMethodRealtimeResponse response = await request.RequestContext
    .ExecuteAsync<InvokeExtensionMethodRealtimeResponse>(extensionRequest).ConfigureAwait(false);`,
      `// Legacy: LoadSalesTransaction
// Commerce SDK:
var getCartRequest = new GetCartRequest(
    new CartSearchCriteria(cartId, cartVersion),
    QueryResultSettings.SingleRecord,
    includeHistoricalTenderLines: false,
    ignoreProductDiscontinuedNotification: false);
var getCartResponse = await context.ExecuteAsync<GetCartResponse>(getCartRequest).ConfigureAwait(false);`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "migrate-retail-server",
    title: "Migrate Retail Server / Headless Commerce API Extensions",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/migrate-commerce-sdk",
    category: "migration",
    tags: ["retail-server", "headless-commerce", "icontroller", "icommerce-controller", "migration", "odata", "edm-model"],
    summary:
      "Migrate Retail Server extensions from CommerceController base class to the IController interface. The EDM model factory is no longer needed — it is auto-generated.",
    content: `
## Migrate Retail Server / Headless Commerce API Extensions

### What Changed
- **Old**: Extend from \`CommerceController\` class, manually create EdmModel factory and extender.
- **New**: Implement \`IController\` interface. EDM process is fully automated.

### Why This Change
- Removes the complex EdmModel factory setup.
- Extension library can be used offline directly (no separate proxy library generation).
- Proxy generation is simplified.

### Migration Steps
1. Change package references from Retail SDK \`\\Pkgs\` to the public NuGet feed.
2. Change class inheritance from \`CommerceController\` to implement \`IController\`.
3. Remove all EdmModel factory and extender code.
4. Use the RoutePrefix attribute on the controller class.

See full guide: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-icontroller-extension
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "migrate-pos-extensions",
    title: "Migrate POS Extensions to Commerce SDK",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/migrate-commerce-sdk",
    category: "migration",
    tags: ["pos", "store-commerce", "migration", "knockout", "sealed-installer", "extension-package"],
    summary:
      "POS extensions migration removes knockout.js from public contracts, introduces a simplified custom view API, and requires sealed installers. Extensions no longer include Microsoft POS app code.",
    content: `
## Migrate POS Extensions

### Key Changes

| Change | Description | Purpose |
|---|---|---|
| Removal of POS app code from SDK | Extensions now include only extension code (not Microsoft POS core code) | Simplifies updates, enables independent POS main package updates, supports multiple extension packages |
| Knockout.js removed from public contracts | POS controls exposed via PosApi/Consume/Controls APIs. Pos.UI.Sdk library is obsolete. | Enables POS control iteration without breaking extensions after upgrade |
| Simplified custom view API | New API to create custom views | Better developer experience |

### Knockout.js in Extensions
Extensions can still use knockout.js internally. See:
https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/knockout-pos-extension

### Sealed Installers Required
POS extensions now require sealed installers. Legacy combined Modern POS installers are no longer supported.
Download sealed installers from LCS > Shared Asset Library > Retail Self-service package.

### Full Migration Guide
https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/migrate-pos-extension

### Hardware Station Migration
- **Old**: Extend from \`HardwareStationController\` class, use Retail SDK \`\\Pkgs\`.
- **New**: Implement \`IController\` interface, consume packages from public NuGet feed.
See: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 3: CSU Extensions Health Check ─────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/csu-extensions-check

const CSU_HEALTH_CHECK_ENTRIES: DocEntry[] = [
  {
    id: "csu-health-check-overview",
    title: "Commerce Scale Unit (CSU) Extensions Health Check",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/csu-extensions-check",
    category: "health-check",
    tags: ["csu", "health-check", "extensions", "assembly", "validation", "icontroller", "target-framework"],
    summary:
      "The CSU extensions health check validates that extensions meet current requirements. Access via: https://<CommerceScaleUnitURL>/healthcheck?testname=extensions",
    content: `
## Commerce Scale Unit (CSU) Extensions Health Check

### URL Format
\`\`\`
https://<CommerceScaleUnitURL>/healthcheck?testname=extensions
\`\`\`

Developers who build CSU extensions should use the health check to validate compliance.

### Health Check Categories

#### 1. Assembly Tests
Validate assemblies and their full dependency tree (recursively). Does NOT validate System and Microsoft.Dynamics assemblies.

**Target Framework Tests**:
- **Target framework (extensions)**: Validates top-level extension assemblies.
- **Target framework (dependencies)**: Validates direct and indirect dependent assemblies.
- **Target framework (others)**: Validates all unused assemblies in extension folders.
- Result Text: target framework name, "Not specified" (no TargetFrameworkAttribute), "Assembly not found", "Failed to load assembly"
- Status: Succeeded (supported framework) | Failed (unsupported or unresolvable)

**Unsupported Dependencies Test**:
- Test Name: **Unsupported dependencies (Commerce)**
- Checks if extensions reference Commerce assemblies NOT part of the Commerce SDK.
- Status: Failed if any non-SDK Commerce assembly is referenced.

#### 2. Extension Export Tests
Validate types exported by extension assemblies.

**Extension Types Tests** (four tests, always shown):
- **Controllers (IController)**: Extensions implementing IController — ALWAYS passes.
- **Obsolete extensions (ICommerceController)**: FAILS if any extension implements ICommerceController.
- **Obsolete extensions (IRequestHandler)**: FAILS if any extension implements IRequestHandler.
- **Obsolete extensions (IRequestTrigger)**: FAILS if any extension implements IRequestTrigger.

**Route Prefix Test**:
- Test Name: **Controllers (Invalid route prefix)**
- FAILS if any controller uses a reserved route prefix via the RoutePrefix attribute.
- Extensions using reserved route prefixes can cause Retail Server to work incorrectly.

**Entity Binding Test**:
- Test Name: **Controllers (Invalid entity binding)**
- FAILS if any extension binds to a Commerce entity through the BindEntity attribute.
- Extensions bound to Commerce entities can cause Retail Server to work incorrectly.

### Show Assembly Names in Results (Optional)
\`\`\`xml
<appSettings>
  <add key="HealthCheck.Extensions.ShowAssemblyFiles" value="true" />
</appSettings>
\`\`\`
`.trim(),
    codeBlocks: [
      `https://<CommerceScaleUnitURL>/healthcheck?testname=extensions`,
      `<appSettings>
  <add key="HealthCheck.Extensions.ShowAssemblyFiles" value="true" />
</appSettings>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 4: Obsolete APIs, Classes, and Methods ──────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/obsolete-apis-classes-methods

const OBSOLETE_APIS_ENTRIES: DocEntry[] = [
  {
    id: "obsolete-apis-overview",
    title: "Obsolete and Removed APIs, Classes, and Methods — Overview",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/obsolete-apis-classes-methods",
    category: "obsolete-apis",
    tags: ["obsolete", "deprecated", "removed", "backward-compatibility", "breaking-changes"],
    summary:
      "How to handle obsolete APIs in Dynamics 365 Commerce. The Obsolete attribute marks APIs for future removal. Compiler warnings indicate which extensions need updating.",
    content: `
## Obsolete and Removed APIs, Classes, and Methods

Dynamics 365 Commerce marks APIs, classes, and methods as **Obsolete** (deprecated) before removing them.
When you compile existing code, you will receive compiler warnings for usage of obsolete APIs.

### Obsolete Attribute
Applied to signal that the API, class, or method will be removed in a future version:
\`\`\`csharp
[Obsolete("Use Application Insights instead. This event will be removed in version 10.0.33.")]
public class GenericWarningEvent { ... }
\`\`\`

### Handling Obsolete Types
1. Review the compiler warning to find a suitable alternative.
2. If possible, change your code to no longer use the obsolete API.
3. Review the documentation for guidance on the deprecation.

### Policy
Dynamics 365 Commerce strives to support backward compatibility. Removing an API without marking it obsolete first is avoided to give developers time to prepare.
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "obsolete-hws-events",
    title: "Obsolete Hardware Station (HWS) Logging APIs",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/obsolete-apis-classes-methods",
    category: "obsolete-apis",
    tags: ["hardware-station", "obsolete", "removed", "logging", "application-insights", "generic-warning-event", "etw"],
    summary:
      "GenericWarningEvent, GenericInformationEvent, GenericDebugEvent, and all ExtendedXxxEvent classes in Hardware Station were deprecated in 10.0.14 and REMOVED in 10.0.33. Replace with Application Insights.",
    content: `
## Obsolete and Removed Hardware Station Logging APIs

All the following ETW event classes were **deprecated in version 10.0.14** and **removed from source code in version 10.0.33**.

**Action Required**: Replace all usages with your own Application Insights instance.
**Reference**: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-application-insights

| Obsolete Class | Deprecated Version | Removed Version | Replacement |
|---|---|---|---|
| GenericWarningEvent | 10.0.14 | 10.0.33 | Application Insights |
| GenericInformationEvent | 10.0.14 | 10.0.33 | Application Insights |
| GenericDebugEvent | 10.0.14 | 10.0.33 | Application Insights |
| ExtendedCriticalEvent | 10.0.14 | 10.0.33 | Application Insights |
| ExtendedErrorEvent | 10.0.14 | 10.0.33 | Application Insights |
| ExtendedWarningEvent | 10.0.14 | 10.0.33 | Application Insights |
| ExtendedInformationalEvent | 10.0.14 | 10.0.33 | Application Insights |
| ExtendedVerboseEvent | 10.0.14 | 10.0.33 | Application Insights |

### Why the Change
Extensions must use Application Insights to log events. The old ETW-based events are no longer supported.

### Migration
1. Remove all references to the above classes.
2. Set up your own Application Insights instance.
3. Use the Application Insights SDK to log events with the equivalent severity level.
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 5: Set up Local Development Environment ────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/setup-local-dev-env

const LOCAL_DEV_ENV_ENTRIES: DocEntry[] = [
  {
    id: "local-dev-env-overview",
    title: "Local Development Environment — Overview and Types",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/setup-local-dev-env",
    category: "dev-environment",
    tags: ["local-dev", "csu", "self-hosted", "iis", "development-environment", "scale-unit", "setup"],
    summary:
      "Two local dev environment types: Self-hosted CSU (lightweight, no IIS, mocked RTS, demo data) and IIS-hosted CSU (full production topology, real RTS, Async Client, requires Entra ID apps).",
    content: `
## Local Development Environment — Types

**IMPORTANT**: This environment is for extension development only — not for production.

**Note (10.0.38+)**: Pre-deployed channel-side Commerce components are no longer updated due to the retirement of the Retail SDK. Last version of pre-deployed components is 10.0.37. For CSU development on a VM, use the Commerce SDK with sealed installers.

### Supported Environment Types

#### 1. Self-Hosted CSU (Lightweight — Recommended for getting started)
- CSU runs as a local executable (not in IIS).
- No IIS, no Async Client, no real RTS calls — all RTS is mocked.
- Channel DB is pre-populated with demo data automatically.
- Minimal prerequisites: no certificates, no Entra ID apps required.
- CSU URL: \`http://localhost:12345\`
- Use case: CRT/Retail Server extension development, fast iteration.

**Pros**: Quick setup, no Commerce HQ required, no TLS config.
**Cons**: Doesn't match production topology; real-time operations must be mocked.

#### 2. IIS-Hosted CSU (Full — Matches production topology)
- CSU hosted in IIS as an ASP.NET Core app.
- Real RTS interaction with Commerce HQ (not mocked).
- Async Client syncs channel DB from HQ — no demo data.
- Requires SSL certificates, Microsoft Entra ID apps, and HQ connectivity.
- CPOS (Cloud POS) is available.

**Pros**: Full production-equivalent topology; real RTS and Async Client.
**Cons**: Additional setup for certificates and Entra ID registrations.

### Hardware Requirements
- Minimum: 16 GB RAM, 2 CPU cores.
- Recommended (if running F&O + Retail Server + e-Commerce): 24 GB RAM, 4 CPU cores.
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "local-dev-env-prerequisites",
    title: "Local Development Environment — Prerequisites",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/setup-local-dev-env",
    category: "dev-environment",
    tags: ["local-dev", "prerequisites", "dotnet", "nodejs", "sql-server", "msbuild", "vscode", "nuget", "setup"],
    summary:
      "Step-by-step prerequisites for setting up a local Commerce dev environment: .NET 8, ASP.NET Core Hosting Bundle, SQL Server, NuGet, MSBuild, Node.js, VS Code, and the Scale Unit GitHub repo.",
    content: `
## Prerequisites for Local Development Environment

Complete in this order:

1. **Install .NET Core SDK 8.0** (Windows x64)
   - https://dotnet.microsoft.com/download/dotnet/8.0

2. **Install ASP.NET Core Runtime 8.0.x Hosting Bundle** (Windows)
   - https://dotnet.microsoft.com/download/dotnet/8.0
   - Select **Hosting Bundle** (NOT x64 or x86).

3. **Install SQL Server** (any edition) with Full Text Search enabled.
   - Minimum supported version: **13.0.5026.0 (SQL Server 2016 SP2)**
   - Enable **Mixed authentication** (SQL + Windows/Integrated).
   - If using a named instance instead of the default, edit **Install.ps1** (line 71+) in \`Dynamics365Commerce.ScaleUnit/src/ScaleUnitSample/Scripts\`:
     \`\`\`powershell
     $installerArgs += $("--sqlservername", "PutYourSqlServerSeenInSSMSHere")
     \`\`\`

4. **Install NuGet.exe**
   - https://www.nuget.org/downloads
   - Copy to a folder and add to PATH.

5. **Install MSBuild** (if not already installed)
   - https://visualstudio.microsoft.com/downloads/ → **Tools for Visual Studio** → **Build Tools for Visual Studio**
   - Minimum version: **MSBuild 15**. Verify: \`msbuild /version\`
   - Ensure PATH points to the correct MSBuild folder.

6. **Install Microsoft.NET.Sdk** via Visual Studio tools → **Individual components** → **.NET SDK**.

7. **Install Node.js** (64-bit)
   - https://nodejs.org/en/download/
   - Ensure PATH is updated. Select "Automatically install the necessary tools" if prompted.

8. **Install Visual Studio Code** (64-bit, Windows)
   - https://code.visualstudio.com/download

9. **Install C# for VS Code (OmniSharp)**
   - Extension Marketplace in VS Code.

10. **Clone/download Dynamics365Commerce.ScaleUnit** GitHub repo:
    - https://github.com/microsoft/Dynamics365Commerce.ScaleUnit

11. **Download the Sealed CSU installer from LCS**:
    - Go to LCS → Shared Asset Library → **Retail Self-service package** → find file ending in **Commerce Scale Unit (SEALED)**.
    - Download and place in: \`Dynamics365Commerce.ScaleUnit/src/ScaleUnitSample/Download/\`

### Additional Prerequisites for IIS-hosted CSU
- IIS with required features enabled (installer checks and reports missing features).
- TLS 1.2 enabled (do NOT use TLS 1.0 or 1.1).
- SSL certificate in LocalMachine/Personal store with: \`digitalSignature\`, \`keyEncipherment\`, \`dataEncipherment\` key usages.
- Three certificate parameters in **.vscode/tasks.json**:
  - \`baseProduct_SslCertFullPath\` — store:///My/LocalMachine?FindByThumbprint=\`<thumbprint>\`
  - \`baseProduct_RetailServerCertFullPath\` — Retail Server identity cert
  - \`baseProduct_AsyncClientCertFullPath\` — Async Client Entra ID auth cert
- Microsoft Entra app registrations for Retail Server, CPOS, and Async Client.
`.trim(),
    codeBlocks: [
      `$installerArgs += $("--sqlservername", "PutYourSqlServerSeenInSSMSHere")`,
      `msbuild /version`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "local-dev-env-debug",
    title: "Debugging CSU Extensions — Self-Hosted and IIS Modes",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/setup-local-dev-env",
    category: "dev-environment",
    tags: ["debug", "f5", "vscode", "self-hosted", "iis", "extension", "breakpoint", "tasks"],
    summary:
      "How to debug CSU extensions in VS Code: press F5 in Self-Hosted mode (auto-deploys, attaches debugger at localhost:12345) or IIS mode (deploy + attach to w3wp/RssuCore process).",
    content: `
## Debugging CSU Extensions in Visual Studio Code

### Self-Hosted CSU Debugging

1. Open VS Code as **administrator**.
2. Open the \`src\\ScaleUnitSample\` folder from the Dynamics365Commerce.ScaleUnit repo.
3. In **.vscode/tasks.json**, set \`baseProduct_UseSelfHost\` = \`true\`.
4. On the Terminal menu → **Run Task** → **build-extension**.
5. Set a breakpoint in your extension method.
6. Press **F5** to start debugging.

**What F5 does automatically:**
- Compiles the extension (produces CSU Extension installer).
- Deploys the Base Sealed Scale Unit installer (if not already deployed).
- Downloads and applies demo data package from the SDK feed.
- Deploys the extension installer.
- Opens browser to CSU health check endpoint.
- Attaches debugger to the CSU host process.
- CSU is ready at **\`http://localhost:12345\`**.

Use the **Debug Console** to watch real-time CSU diagnostics.

### IIS-Hosted CSU Debugging

1. In VS Code → **Run and Debug** (Ctrl+Shift+D) → select **Debug with IIS**.
2. Press **F5**.
3. Base installer runs prerequisite checks (SQL Server, IIS, TLS, .NET Core Hosting Bundle).
4. After deployment, VS Code opens browser with health check and prompts to attach a debugger.
5. To attach: type \`w3wp\` in the process list and select the row with **RssuCore** (the IIS app pool for CSU).

### VS Code Tasks Available (Terminal → Run Task)
| Task | Purpose |
|---|---|
| build-extension | Build the extension |
| clean-extension | Clean build output |
| install | Verify prerequisites, deploy Base Scale Unit + extension installer |
| uninstall | Uninstall extension and Base Scale Unit |
| uninstall-base-product | Uninstall Base Scale Unit (fails if extension is installed) |
| uninstall-extension | Uninstall extension only |
| check-msbuild | Show MSBuild version |
| check-ps-bitness | Check PowerShell bitness (must be 64-bit) |

### Troubleshooting
- **"Running script is disabled"**: Run \`powershell Set-ExecutionPolicy RemoteSigned\` as admin, then restart VS Code.
- **Runtime logs** (IIS mode): Windows Event Viewer → Windows Logs → Application, filter by:
  - Microsoft Dynamics - Async Client Service
  - Microsoft Dynamics - Retail Server
- **Self-hosted logs**: appear directly in VS Code terminal.

### Deployment Output Paths
- **Cloud Scale Unit extension package**: \`ScaleUnit\\bin\\Debug\\netstandard2.0\`
- **Scale Unit extension installer** (on-premises): \`Installer\\bin\\Debug\\net461\`
`.trim(),
    codeBlocks: [
      `http://localhost:12345`,
      `powershell Set-ExecutionPolicy RemoteSigned`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 6: Install CSU on Dev Environment (VHD/Cloud) ──────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/install-csu-dev-env

const INSTALL_CSU_DEV_ENTRIES: DocEntry[] = [
  {
    id: "install-csu-dev-env",
    title: "Install Sealed CSU on VHD / Cloud Dev Environment",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/install-csu-dev-env",
    category: "dev-environment",
    tags: ["csu", "iis", "install", "sealed", "vhd", "lcs", "ssl-certificate", "entra-id", "thumbprint", "dev-environment"],
    summary:
      "Step-by-step installation of an IIS-based Sealed Commerce Scale Unit on a VHD or LCS cloud dev environment: SSL cert creation, Entra ID app registration, HQ updates, IIS setup, and certificate rotation.",
    content: `
## Install Sealed CSU on a VHD / Cloud Development Environment

This covers IIS-based CSU installation on LCS virtual machines or local VHDs.

### Prerequisites (one-time)
1. Create Microsoft Entra ID apps for: **Retail Server**, **Store Commerce for web (CPOS)**, and **Async Client**.
2. Register the Retail Server and Async Client apps in Commerce headquarters.
3. Follow: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-store-scale-unit-configuration-installation#prerequisites

### Step 1 — Create Self-Signed SSL Certificate

Run in PowerShell (administrator):
\`\`\`powershell
$cert = New-SelfSignedCertificate \`
  -Subject "CN=$env:computerName" \`
  -DnsName $env:computerName,$([System.Net.Dns]::GetHostByName($env:computerName).HostName) \`
  -KeyAlgorithm RSA -KeyLength 2048 \`
  -CertStoreLocation "Cert:\\LocalMachine\\My" \`
  -NotBefore (Get-Date) -NotAfter (Get-Date).AddYears(2) \`
  -KeyUsage KeyEncipherment,DataEncipherment,CertSign,CRLSign,DigitalSignature \`
  -KeyUsageProperty All \`
  -FriendlyName "$env:computerName" \`
  -KeyExportPolicy Exportable
Export-Certificate -Cert $cert -FilePath "$env:temp\\https.cer"
Import-Certificate -CertStoreLocation cert:\\LocalMachine\\Root -FilePath "$env:temp\\https.cer"
\`\`\`

Required key usages: \`keyEncipherment\`, \`dataEncipherment\`, \`KeyExchange\` capability.
Copy the certificate **thumbprint** for use in the CSU installer.

### Step 2 — Export Certificate to .CER Format
1. Open MMC → Add/Remove Snap-in → **Certificates** → **Computer Account** → **Local Computer**.
2. Expand **Certificates > Personal > Certificates**, right-click your cert → **All Tasks > Export**.
3. Select **No, do not export the private key** → **DER encoded binary X.509 (.CER)**.
4. Save to \`C:\\temp\\DevBoxSelfSigned.cer\`.

### Step 3 — Add Certificate to Entra ID App
1. Go to [Microsoft Entra admin center](https://aad.portal.azure.com) → edit the CSU Azure App.
2. **Client Credentials** → **Add a certificate or secret** → **Certificates** tab.
3. **Upload Certificate** → select \`C:\\temp\\DevBoxSelfSigned.cer\`.
4. Add description "Devbox Self-signed Certificate".

**IMPORTANT**: SSL certificates expire. Create a renewal plan at least **one month before expiry**.

### Step 4 — Update Commerce Headquarters
1. Go to **System administration > Setup > Microsoft Entra ID Applications**.
2. Select **New**.
3. Enter the **Client ID** of the Retail Server Entra app.
4. Enter a descriptive name.
5. Set **User ID** = \`RetailServiceAccount\`.
6. Save.

### Step 5 — Verify IIS Components
In **Server Manager > Local Server > Manage > Add roles and features**:
- Confirm **IIS > Management Tools > IIS 6 Management Compatibility (IIS 6 Metabase Compatibility)** is checked.

### Step 6 — Install .NET Core Hosting Bundle
Download and install: https://dotnet.microsoft.com/en-us/download/dotnet/8.0
Select the **Hosting Bundle** for Windows.

### Update an Expired SSL Certificate
No full reinstall needed. Run:
\`\`\`cmd
CommerceStoreScaleUnitSetup.exe updateCertificates \`
  --SslCertFullPath "store:///My/LocalMachine?FindByThumbprint=<NewSslThumbprint>" \`
  --AsyncClientCertFullPath "store:///My/LocalMachine?FindByThumbprint=<NewAsyncClientThumbprint>" \`
  --RetailServerCertFullPath "store:///My/LocalMachine?FindByThumbprint=<NewRsThumbprint>"
\`\`\`

### Database Restore from UAT
After restoring HQ database from another environment:
1. Repeat the HQ registration steps (same Channel Database ID and Channel Profile as before).
2. Check download sessions — if jobs are applying, CSU works.
3. If download jobs aren't applying: check Windows Event logs, download a new configuration file from HQ, and rerun the CSU installer.
`.trim(),
    codeBlocks: [
      `$cert = New-SelfSignedCertificate \`
  -Subject "CN=$env:computerName" \`
  -DnsName $env:computerName,$([System.Net.Dns]::GetHostByName($env:computerName).HostName) \`
  -KeyAlgorithm RSA -KeyLength 2048 \`
  -CertStoreLocation "Cert:\\LocalMachine\\My" \`
  -NotBefore (Get-Date) -NotAfter (Get-Date).AddYears(2) \`
  -KeyUsage KeyEncipherment,DataEncipherment,CertSign,CRLSign,DigitalSignature \`
  -KeyUsageProperty All \`
  -FriendlyName "$env:computerName" \`
  -KeyExportPolicy Exportable
Export-Certificate -Cert $cert -FilePath "$env:temp\\https.cer"
Import-Certificate -CertStoreLocation cert:\\LocalMachine\\Root -FilePath "$env:temp\\https.cer"`,
      `CommerceStoreScaleUnitSetup.exe updateCertificates --SslCertFullPath "store:///My/LocalMachine?FindByThumbprint=YourNewSslCertificateThumbprint" --AsyncClientCertFullPath "store:///My/LocalMachine?FindByThumbprint=YourNewAsyncClientAadAppCertThumbprint" --RetailServerCertFullPath "store:///My/LocalMachine?FindByThumbprint=YourNewRsAadAppCertThumbprint"`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 7: Build Pipeline ───────────────────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/build-pipeline

const BUILD_PIPELINE_ENTRIES: DocEntry[] = [
  {
    id: "build-pipeline-csu",
    title: "Build Pipeline — Cloud Scale Unit Extension Package",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/build-pipeline",
    category: "build-pipeline",
    tags: ["build-pipeline", "azure-devops", "yaml", "csu", "cloud-scale-unit", "extension-package", "lcs", "ci-cd"],
    summary:
      "Set up an Azure DevOps build pipeline using the YAML file from Dynamics365Commerce.ScaleUnit to generate CloudScaleUnitExtensionPackage.zip, and a release pipeline to upload to LCS.",
    content: `
## Build Pipeline — Cloud Scale Unit (CSU) Extension Package

Applies to **Commerce SDK 10.0.19+** with the independent extension model (packages from public NuGet feed).
Does NOT work with the legacy Retail SDK from LCS developer VMs.

### Build Pipeline Setup (Azure DevOps)

1. Sign in to Azure DevOps.
2. Select **Pipeline → New pipeline**.
3. Select your source repository.
4. Select **Existing Azure Pipelines YAML file**.
5. Use the YAML file from the Dynamics365Commerce.ScaleUnit repo:
   \`\`\`
   https://github.com/microsoft/Dynamics365Commerce.ScaleUnit/blob/release/9.29/Pipeline/YAML_Files/build-pipeline.yml
   \`\`\`
   Also include all scripts from: \`Pipeline/PowerShellScripts/\` in your repo.
6. Select **Continue**.

The pipeline:
- Builds the whole solution (finds solution file in repo).
- Uploads **CloudScaleUnitExtensionPackage.zip** to the **Published Artifacts** drop location.

**Important**: Your extension and packaging projects must be linked to a solution file.

7. Save and queue the build.
8. After completion, download **ScaleUnitPackage\_(Build.BuildNumber).zip** from Published Artifacts.

### Release Pipeline (Upload to LCS)

Best practice: use a separate release pipeline.

1. Azure DevOps → **Releases → New pipeline → Empty job**.
2. Add artifact → select your build pipeline.
3. Rename stage 1 to "Upload Assets to LCS".
4. Add task: **Dynamics Lifecycle Services (LCS) Asset Upload**.
5. Task configuration:
   - **Type of asset**: CloudScaleUnitExtensionPackage
   - **File to Upload**: \`$(System.DefaultWorkingDirectory)/\\_ScaleUnit-CI/drop/ScaleUnitPackage\\_$(Release.Artifacts.\\_ScaleUnit-CI.BuildNumber).zip\`
   - **LCS Asset Name**: \`ScaleUnitPackage\\_$(Release.Artifacts.\\_ScaleUnit-CI.BuildNumber)\`
6. Save and create release.

For automated deployment: configure a continuous deployment trigger on your branch.
`.trim(),
    codeBlocks: [
      `https://github.com/microsoft/Dynamics365Commerce.ScaleUnit/blob/release/9.29/Pipeline/YAML_Files/build-pipeline.yml`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "build-pipeline-self-service",
    title: "Build Pipeline — Commerce Self-Service Packages (POS & Hardware Station)",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/build-pipeline",
    category: "build-pipeline",
    tags: ["build-pipeline", "azure-devops", "yaml", "pos", "hardware-station", "self-service", "installer", "signing", "key-vault", "lcs"],
    summary:
      "Set up an Azure DevOps build pipeline using Dynamics365Commerce.InStore YAML to generate HardwareStation.Installer.exe and ModernPos.Installer.exe, with optional signing via Azure Key Vault.",
    content: `
## Build Pipeline — Commerce Self-Service Packages (POS & Hardware Station)

Generates: **HardwareStation.Installer.exe** and **ModernPos.Installer.exe** (Store POS, Hardware Station, CSU Self-Hosted).

### Build Pipeline Setup

1. Sign in to Azure DevOps.
2. Select **Pipeline → New pipeline**.
3. Select your source repo.
4. Select **Existing Azure Pipelines YAML file**.
5. Use the YAML file from Dynamics365Commerce.InStore:
   \`\`\`
   https://github.com/microsoft/Dynamics365Commerce.InStore/blob/release/9.29/Pipeline/YAML_Files/build-pipeline.yml
   \`\`\`
   Include all scripts from: \`Pipeline/PowerShellScripts/\` in your repo.
6. Select **Continue**.

### Installer Signing (Azure Key Vault)

The YAML includes a signing step using a certificate from Azure Key Vault.
Create these pipeline variables (mark as **Secret**):

| Variable | Purpose |
|---|---|
| ApplicationId | Entra app ID for Key Vault access |
| AzureKeyVaultURI | Key Vault URI |
| CertificateName | Certificate name in Key Vault |
| SecretValue | Secret value for Key Vault auth |
| Timestamp | Timestamp server URL (e.g., \`http://timestamp.digicert.com\`) |

**To skip signing**: remove the **PowerShell@2** signing task from the YAML file.

7. Save and queue the build.
8. Download **HardwareStation.Installer.exe** and **ModernPos.Installer.exe** from Published Artifacts.

### Release Pipeline (Upload to LCS)

1. Azure DevOps → **Releases → New pipeline → Empty job**.
2. Add artifact → select your build pipeline.
3. Add task: **Dynamics Lifecycle Services (LCS) Asset Upload**.
4. Task configuration:
   - **Type of asset**: Retail Self-Service Package
   - **File to Upload**: \`$(System.DefaultWorkingDirectory)/\\_CommerceSDK-Signing-EXE/drop/Installer\\_$(Release.Artifacts.\\_CommerceSDK-Signing-EXE.BuildNumber).exe\`
   - **LCS Asset Name**: \`Installer\\_$(Release.Artifacts.\\_CommerceSDK-Signing-EXE.BuildNumber)\`
5. Save and create release.
`.trim(),
    codeBlocks: [
      `https://github.com/microsoft/Dynamics365Commerce.InStore/blob/release/9.29/Pipeline/YAML_Files/build-pipeline.yml`,
      `http://timestamp.digicert.com`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 8: Deploy Payment Connectors ───────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/deploy-payment-connector

const DEPLOY_PAYMENT_CONNECTOR_ENTRIES: DocEntry[] = [
  {
    id: "payment-connector-deploy",
    title: "Deploy Payment Connectors — Packaging and Deployment",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/deploy-payment-connector",
    category: "payments",
    tags: ["payment", "connector", "deploy", "ipaymentprocessor", "ipaymentdevice", "hardware-station", "lcs", "retaildeployablepackage", "payment-web-files"],
    summary:
      "How to package and deploy a payment connector: three folder types (IPaymentProcessor, Payment Web Files, IPaymentDevice), LCS upload, and manual developer deployment file locations per component.",
    content: `
## Deploy Payment Connectors

A payment connector package from a payment ISV includes some or all of these folders (found in \\RetailSDK\\PaymentExternals):

| Folder | Purpose |
|---|---|
| **IPaymentProcessor Assemblies** | Assembly implementing IPaymentProcessor + dependencies. Used by CSU. |
| **Payment Web Files** | HTML/JS/CSS callback files for payment acceptance page (card-not-present, e-commerce). |
| **IPaymentDevice Assemblies** | Assembly implementing IPaymentDevice + payment request handlers. Used by Hardware Station and Store Commerce for payment terminal devices (e.g., VeriFone MX925). Only needed if using a payment terminal device. |

### Packaging (Retail SDK)
1. Copy payment assemblies to \`\\RetailSDK\\PaymentExternals\`.
2. Run \`msbuild\` from the root of the Retail SDK folder.
3. Find output at: \`\\RetailSDK\\Packages\\RetailDeployablePackage\`.

**RetailDeployablePackage** (combined package) includes:
- Commerce Scale Unit (CSU)
- Self-service installer for: Hardware Station, Store Commerce app, CSU Self-Hosted

**Note (10.0.10+)**: RetailDeployablePackage deploys only to CSU. For AOS (Application Object Server) deployment of the payment connector in 10.0.10+, use the separate payment connector package for Application Explorer. See: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/payment-connector-package

### Upload to LCS
1. Open LCS project → **More tools → Asset library**.
2. Select **Software package** → **+**.
3. Enter name/description, select **Combined commerce package** as type.
4. Upload the \`RetailDeployablePackage.zip\`.
5. Deploy to sandbox via LCS portal; create a service request for production.

### Manual Deployment (Developer Environment Only)
Copy files to these locations on the server:

| Component | IPaymentProcessor Assemblies | Payment Web Files | IPaymentDevice Assemblies |
|---|---|---|---|
| Commerce Scale Unit | \`<RS.WebRoot>/bin/\` | N/A | N/A |
| Store Commerce for web (CPOS) | N/A | \`<CPOS.WebRoot>/Connectors/\` | N/A |
| Remote Hardware Station (IIS) | \`<HWS.WebRoot>/bin/\` | N/A | \`<HWS.WebRoot>/bin/\` |
| Store Commerce app Local HW Station (IPC) | \`<MPOS.AppRoot>/ClientBroker/\` | N/A | \`<MPOS.AppRoot>/ClientBroker/\` |
| E-commerce | N/A | \`<ECOM.WebRoot>/Connectors/\` | N/A |

Where:
- \`<RS.WebRoot>\` = Commerce Scale Unit web application root
- \`<HWS.WebRoot>\` = Remote Hardware Station web application root
- \`<MPOS.AppRoot>\` = Store Commerce app install folder (e.g., C:\\Program Files\\Microsoft Dynamics 365\\Store Commerce)
- \`<ECOM.WebRoot>\` = E-commerce website web root

**Note**: Payment Web Files folder usually contains a subfolder — copy the whole subfolder to the target location.

### E-Commerce Payment Connector
E-commerce sites are not deployed via LCS. Work with your partner for hosting. If the connector requires Payment Web Files, deploy them to \`<ECOM.WebRoot>/Connectors/\`.
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 9: Payment Connector Data Fields ────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/payment-connector-data-fields

const PAYMENT_DATA_FIELDS_ENTRIES: DocEntry[] = [
  {
    id: "payment-data-fields-card-present",
    title: "Payment Connector Data Fields — Card-Present Requests",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/payment-connector-data-fields",
    category: "payments",
    tags: ["payment", "data-fields", "card-present", "authorize", "capture", "void", "refund", "gift-card", "payment-terminal", "request"],
    summary:
      "All data fields sent to the payment connector in card-present (POS terminal) scenarios: BeginTransaction, UpdateLineItems, Authorize, Capture, Void, Refund, GiftCard requests, and Payment SDK shared data.",
    content: `
## Payment Connector Data Fields — Card-Present Scenarios

Card-present: physical card at a POS terminal. The connector may not use all fields received.

### BeginTransactionPaymentTerminalDeviceRequest
| Field | Description |
|---|---|
| merchantInformation | Merchant info from POS hardware profile |
| invoiceNumber | Unique invoice number generated by POS to track the sales transaction |

### UpdateLineItemsPaymentTerminalDeviceRequest
| Field | Description |
|---|---|
| totalAmount | Total amount on the current sales transaction |
| taxAmount | Tax amount on the current sales transaction |
| discountAmount | Discount amount on the current sales transaction |
| subTotalAmount | Subtotal amount on the current sales transaction |
| items | List of product details (names, quantities, units of measure) |

### AuthorizePaymentTerminalDeviceRequest
| Field | Description |
|---|---|
| amount | Amount to authorize |
| currency | Currency for the authorization |
| voiceAuthorization | Voice approval code (if voice authorization is required) |

### CapturePaymentTerminalDeviceRequest
| Field | Description |
|---|---|
| amount | Amount to capture |
| currency | Currency for the capture |
| paymentPropertiesXml | Content of PaymentSdkData from the Authorize/Refund response — carries stateful properties between requests |

### VoidPaymentTerminalDeviceRequest
| Field | Description |
|---|---|
| amount | Amount of the payment to void |
| currency | Currency for the void |
| paymentPropertiesXml | PaymentSdkData from the Authorize/Refund response |

### RefundPaymentTerminalDeviceRequest
| Field | Description |
|---|---|
| amount | Amount to refund |
| currency | Currency for the refund |

### Gift Card Requests
| Request | Key Fields |
|---|---|
| ActivateGiftCardPaymentTerminalRequest | amount, currency (initial load amount) |
| AddBalanceToGiftCardPaymentTerminalRequest | amount, currency (amount to add to balance) |
| GetGiftCardBalancePaymentTerminalRequest | currency (currency to retrieve balance in) |
| GetPrivateTenderPaymentTerminalDeviceRequest | amount (shown on terminal when retrieving card number) |

### Payment SDK Shared Data (AuthorizePaymentCardPaymentResponse)
| Field | Description |
|---|---|
| ApprovedAmount | Amount approved for the transaction |
| AvailableBalance | Available balance on the card |
| ApprovalCode | Approval code for the transaction |
| ProviderTransactionId | Transaction identifier from the payment provider |
| AuthorizationResult | Result of the authorization call |
| ExternalReceipt | External receipt data from the payment provider |
| TerminalId | Unique identifier of the terminal that handled the payment |
| TipAmount | Tip amount selected by customer on terminal (requires isTippingEnabled = true) |
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "payment-data-fields-card-not-present",
    title: "Payment Connector Data Fields — Card-Not-Present and L2/L3 Data",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/payment-connector-data-fields",
    category: "payments",
    tags: ["payment", "data-fields", "card-not-present", "ecommerce", "call-center", "l2-data", "l3-data", "authorization", "refund", "getpaymentacceptpoint"],
    summary:
      "Data fields for card-not-present payment scenarios (e-commerce, call center): Authorization, Capture, Void, Refund, GetPaymentAcceptPoint methods, plus Level 2 (L2) and Level 3 (L3) purchase data fields.",
    content: `
## Payment Connector Data Fields — Card-Not-Present Scenarios

Card-not-present: no physical card (e-commerce, call center). Specific fields used vary by connector.

### Authorization Fields
| Namespace | Field | Description |
|---|---|---|
| MerchantAccount | MerchantId | Merchant info from POS hardware profile |
| PaymentCard | Last4Digits | Last four digits of the card |
| PaymentCard | UniqueCardId | Unique randomized card identifier |
| PaymentCard | ExpirationYear | Card expiration year |
| PaymentCard | ExpirationMonth | Card expiration month |
| PaymentCard | StreetAddress / City / State / PostalCode | Billing address fields |
| TransactionData | IndustryType | Channel type: Retail, Direct Marketing, E-Commerce |
| TransactionData | AllowPartialAuthorization | Whether partial authorization is supported |
| TransactionData | Amount | Total transaction amount |
| TransactionData | CurrencyCode | Transaction currency code |
| TransactionData | TerminalId | Terminal identifier |
| PurchaseLevelData | L2Data | Level 2 data (if configured) |
| PurchaseLevelData | L3Data | Level 3 data (if configured) |

### GetPaymentAcceptPoint Fields (additional)
| Namespace | Field | Description |
|---|---|---|
| PaymentCard | Name | Cardholder name |
| PaymentCard | CountryRegion | Country/region of billing address |
| PaymentCard | ShowSameAsShippingAddress | Whether billing = shipping address |

### Void / Refund Fields
Same as Authorization but also include: PaymentCard Last4Digits, UniqueCardId, ExpirationYear/Month, billing address fields.

### L2 Data (Level 2 — must be explicitly configured)
Key fields: OrderDateTime, OrderNumber, InvoiceNumber, SummaryCommodityCode, MerchantTaxId, ShipTo/ShipFrom address fields, DiscountAmount, DutyAmount, FreightAmount, HandlingCharge, TotalTaxAmount, TotalTaxRate, TaxDetails[], MiscellaneousCharges[].

### L3 Data (Level 3 — must be explicitly configured)
Key fields: SequenceNumber, CommodityCode, ProductCode, ProductName, ProductSKU, UnitOfMeasure, UnitPrice, Discount, Quantity, NetTotal, TaxAmount, TaxRate, TotalAmount, FreightAmount, HandlingAmount, CarrierTrackingNumber, PickupAddress/City/State/Country, PickupDateTime, UNSPSCCode, TaxDetails[], MiscellaneousCharges[].
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 10: Tipping Support in Payments SDK ─────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/tipping

const TIPPING_ENTRIES: DocEntry[] = [
  {
    id: "payment-tipping",
    title: "Tipping Support in the Payments SDK",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/tipping",
    category: "payments",
    tags: ["payment", "tipping", "gratuity", "tip-amount", "isTippingEnabled", "authorize", "header-charge", "adyen", "extension", "PaymentTerminalAuthorizePaymentRequestHandler"],
    summary:
      "The Payments SDK adds isTippingEnabled to AuthorizePaymentTerminalDeviceRequest and returns TipAmount in the authorization response. Implementing full tipping (header-level charge, reporting) requires a POS CRT extension on PaymentTerminalAuthorizePaymentRequestHandler.",
    content: `
## Tipping Support in the Payments SDK

Tips (gratuities) are common in quick service and hospitality. This feature adds a **TipAmount** field to the payments SDK so that tip amounts selected on the payment terminal are returned to POS as part of the authorization response.

**Note**: This feature does NOT include tip reporting at shift end, tip pooling, or payroll reporting — those require POS extensions.

### How It Works

1. A new **isTippingEnabled** variable is added to **AuthorizePaymentTerminalDeviceRequest**.
2. When set to \`True\`, it signals the payment connector that the authorization is tip-eligible.
3. If the customer selects a tip on the terminal, the connector returns:
   - **TipAmount** field in **AuthorizePaymentCardPaymentResponse**
   - **ApprovedAmount** = base amount + tip amount

### Prerequisites
| Requirement | Description |
|---|---|
| Device tip support | Terminal must allow customers to select a tip amount |
| isTippingEnabled support | Payment connector must handle the \`isTippingEnabled\` variable |
| TipAmount field | Connector must return \`TipAmount\` in the authorization response |
| POS extension | Add tip as a header-level charge via CRT extension |

### Adyen Connector Tipping
- Set \`isTippingEnabled = True\` in the connector customization.
- Configure tipping in the Adyen customer area → **Point of Sale** tab → **Payment features** tab.
- Tipping can be enabled per terminal or fleet-wide (**Terminal settings**).
- After enabling, update the device settings for the change to take effect.

### Suggested Implementation (Extension)
Create a CRT extension for **PaymentTerminalAuthorizePaymentRequestHandler**:
- If \`TipAmount\` is present in the authorization response → add a **header-level charge** to the transaction.
- Implement tip reporting, shift close reporting, and payroll integration as separate extensions.

### What This Feature Does NOT Provide
- Tip reporting at end of shifts
- Tip pooling
- Tip reporting for payroll

Full tipping support reference: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/end-to-end-payment-extension
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 11: Incremental Payment Capture ─────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/incremental-capture

const INCREMENTAL_CAPTURE_ENTRIES: DocEntry[] = [
  {
    id: "payment-incremental-capture",
    title: "Incremental Payment Capture",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/incremental-capture",
    category: "payments",
    tags: ["payment", "incremental-capture", "authorization", "multiple-captures", "SupportsMultipleCaptures", "IPaymentReferenceProvider", "PaymentTrackingId", "adyen", "invoicing", "partial-shipment"],
    summary:
      "Incremental capture allows multiple payment captures against a single authorization across multiple order invoices. Enabled via 'Extensibility to support incremental credit card capture' feature flag. Partner connectors implement IPaymentReferenceProvider and set SupportsMultipleCaptures=True.",
    content: `
## Incremental Payment Capture

Incremental capture allows multiple invoices for the same order to capture payment against a **single original authorization**, instead of creating a new authorization for each partial invoice.

### Why Use It
**Problem (legacy flow)**: Each partial shipment → new authorization → overlapping authorizations on customer card → risk of exceeding credit limits or fraud flags.
**Solution**: One authorization + multiple incremental captures against it.

**Adyen** supports this out of the box (Commerce SDK 10.0.13+ for HQ invoicing; 10.0.18+ for all channels).

### Prerequisite Features (enable in this order)
| Feature | Description |
|---|---|
| Unified payment posting journal defaults for Commerce | Changes how payment journals are created for call center/POS/e-commerce orders |
| Omni-channel payments | Enables BOPIS and omni-channel payment scenarios |
| Duplicate payment protection on invoicing | Prevents duplicate payments during invoicing |
| Enable refunds over multiple captures | Enables multiple linked refunds against an order |
| Enable manual void of expired credit card payment lines | Allows manual deletion of expired payment lines |
| Omni-channel Commerce order payments | Rationalizes payments across channels (enable last) |

### Enable Incremental Capture

**Step 1 — Enable the feature flag**:
1. Go to **System administration > Workspaces > Feature management**.
2. Search for **"Extensibility to support incremental credit card capture"**.
3. Select **Enable now**.

**Step 2 — Set credit card authorization parameter**:
1. Go to **Accounts receivable > Setup > Accounts receivable parameters**.
2. Select **Credit card** in the left navigation.
3. Under **Setup**, set **Credit card authorization** = **Yes**.

**Step 3 — Adyen connector configuration**:
- Set **Enable Request Protection** = **True** in the Adyen connector merchant properties for every channel.
- Contact Adyen to ensure **allowMultiplePartialCapture** = **Yes** on the merchant account.
- For payment methods that don't support incremental capture (e.g., Interac), add them to **Non incremental capture payment methods** field (semicolon-separated Adyen PaymentMethodVariant strings).

### Partner Payment Connector Implementation

#### IPaymentReferenceProvider Interface
Added in payments SDK (Commerce 10.0.18). Implement to include a **PaymentTrackingID** in each request/response to:
- Track payment requests.
- Prevent duplicate requests from being resent.

\`\`\`csharp
public PaymentTransactionReferenceData GetPaymentReferenceData(string command, decimal amount)
{
    PaymentTransactionReferenceData data = new PaymentTransactionReferenceData();
    data.Amount = amount;
    data.Command = command;
    data.IdFromConnector = Guid.NewGuid().ToString();
    data.InitiatedDate = DateTime.UtcNow;
    return data;
}
\`\`\`

#### SupportsMultipleCaptures Property
Set to \`True\` in authorization responses if the processor supports multiple captures:
\`\`\`csharp
public static string SupportsMultipleCaptures
{
    get { return "SupportsMultipleCaptures"; }
}
\`\`\`

If \`False\` or not set → authorization NOT eligible for incremental capture → new authorization obtained for remaining balance.

**Note**: \`SupportsMultipleCaptures\` is per-authorization, not global. An environment can have both incremental and non-incremental connectors.

### User Experience
No change to the user experience. Key difference: after a partial invoice, if the original authorization is still valid, no new authorization is created. In HQ or payment portal: one authorization → multiple captures (vs. legacy 1:1 authorization-to-capture ratio).

### Important Limits
- Authorizations expired per Accounts Receivable parameters are NOT eligible for incremental capture.
- Some payment methods (e.g., Interac) do not support incremental capture — configure them in the "Non incremental capture payment methods" field.
`.trim(),
    codeBlocks: [
      `public PaymentTransactionReferenceData GetPaymentReferenceData(string command, decimal amount)
{
    PaymentTransactionReferenceData data = new PaymentTransactionReferenceData();
    data.Amount = amount;
    data.Command = command;
    data.IdFromConnector = Guid.NewGuid().ToString();
    data.InitiatedDate = DateTime.UtcNow;
    return data;
}`,
      `authorizeRequest.PaymentTrackingId = PaymentUtilities.GetPropertyStringValue(
    hashtable,
    GenericNamespace.TransactionData,
    TransactionDataProperties.PaymentTrackingId);`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 12: Extension Resource Localization ─────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extension-resource-localization

const LOCALIZATION_ENTRIES: DocEntry[] = [
  {
    id: "localization-pos-labels",
    title: "Localize POS Labels, Messages, and Error Strings",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extension-resource-localization",
    category: "localization",
    tags: [
      "localization", "language-text", "pos", "labels", "error-messages", "receipt-strings",
      "crt", "csu", "text-id", "distribution-schedule", "1090", "resx",
      "RuntimeExceptionMessages", "RuntimeReceiptMessages", "CommerceException",
    ],
    summary:
      "How to override POS UI labels, POS messages (error/warning/info), receipt strings, and CRT error messages via the Language text page (HQ). Custom error text IDs must start with Microsoft_Dynamics_Commerce_. Pushed via Distribution Schedule job 1090.",
    content: `
## Localize Commerce Extension Resources and Label Files

Covers: POS UI labels, POS messages (error/warning/info), receipt labels, CRT/CSU error messages.

**For new POS extension labels**: use the localization framework in the POS extension itself (not this HQ approach).

---

## 1. Override POS UI Labels and Messages

### Steps
1. Go to **Retail and Commerce > Channel setup > POS setup > POS profiles > Language text**.
2. On the **POS** tab → **POS language text** grid → **Add**.
3. Enter: Language ID, Text ID, Text.
4. **Save**.
5. Go to **Retail and Commerce > Retail and Commerce IT > Distribution schedule**.
6. Run the **Registers (1090)** job → **Run now**.
7. Wait up to **1 hour** for the localized string cache to refresh, then sign out/in to Store Commerce.
   - Force refresh: restart Retail Server.

### Example — Change "Operator ID" to "Employee ID" (en-us)
| Language ID | Text ID | Text |
|---|---|---|
| en-us | 502 | Employee ID |

### How to Find a POS Text ID
1. Open **Store Commerce for web**.
2. Press **F12** → Console tab.
3. Run: \`Commerce.Helpers.DeveloperModeHelper.setDeveloperMode(true);\`
4. Go to POS **Settings** → **Developer mode** section → set **Developer Mode** = Yes, **Show Strings IDs** = Yes.
5. Sign out and sign back in — all labels and messages now show their text IDs as a prefix.

---

## 2. Override Error Messages or Receipt Strings

### Steps
Same flow as POS labels:
1. **Language text** page → **Add** → Language ID, Text ID, Text.
2. **Save** → run Distribution schedule **1090**.

### Example — Change sign-in error message (en-us)
| Language ID | Text ID | Text |
|---|---|---|
| en-us | Microsoft_Dynamics_Commerce_Runtime_InvalidAuthenticationCredentials | Please enter valid user name or password |

### How to Find a Text ID for Error/Receipt Strings
1. Open: \`...\\RetailSDK\\Documents\\Resources\`
2. In Visual Studio, open:
   - **Error messages**: \`RuntimeExceptionMessages.resx\`
   - **Receipt strings**: \`RuntimeReceiptMessages.resx\`
3. Search the **Value** column for the text you want to change.
4. Copy the **Name** — this is the Text ID to enter in the Language text grid.

---

## 3. Add Custom Error Messages or Receipt Strings

You can add entirely new text IDs on the **Language text** page to support localization without hard-coding strings.

### Rule: Text ID must start with \`Microsoft_Dynamics_Commerce_\`

### Example — New message in US English and UK English
| Language ID | Text ID | Text |
|---|---|---|
| en-us | Microsoft_Dynamics_Commerce_CustomId1 | My new message in US English |
| en-uk | Microsoft_Dynamics_Commerce_CustomId1 | My new message in UK English |

### Using Custom Messages in CRT Extension Code
\`\`\`csharp
throw new CommerceException(
    "Microsoft_Dynamics_Commerce_CustomId1",
    ExceptionSeverity.Warning,
    null,
    "Custom error")
{
    LocalizedMessage = "My new message in US English.",
    LocalizedMessageParameters = new object[] { }
};
\`\`\`

---

## Summary

| Scenario | Text ID Source | Distribution Job |
|---|---|---|
| POS UI label override | Developer Mode → Show String IDs in Store Commerce | 1090 (Registers) |
| POS error/warning message override | RuntimeExceptionMessages.resx (Name column) | 1090 (Registers) |
| Receipt string override | RuntimeReceiptMessages.resx (Name column) | 1090 (Registers) |
| New custom CRT error message | Must start with \`Microsoft_Dynamics_Commerce_\` | 1090 (Registers) |
`.trim(),
    codeBlocks: [
      `Commerce.Helpers.DeveloperModeHelper.setDeveloperMode(true);`,
      `throw new CommerceException(
    "Microsoft_Dynamics_Commerce_CustomId1",
    ExceptionSeverity.Warning,
    null,
    "Custom error")
{
    LocalizedMessage = "My new message in US English.",
    LocalizedMessageParameters = new object[] { }
};`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 13: CSU Core ────────────────────────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/csu-core

const CSU_CORE_ENTRIES: DocEntry[] = [
  {
    id: "headless-csu-core-overview",
    title: "Commerce Scale Unit (CSU) Core — Overview and Migration",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/csu-core",
    category: "headless-commerce",
    tags: [
      "csu-core", "headless-commerce", "asp.net-core", "dotnet-core", "net6",
      "performance", "migrate-csu-core", "lcs", "disable-csu-core",
      "net-standard-2", "extension-compatibility", "10.0.22", "10.0.38",
      "retail-server", "healthcheck", "extensions",
    ],
    summary:
      "CSU Core is the next-generation ASP.NET Core / .NET 6 platform for hosting the headless commerce engine. Available by default from 10.0.22; mandatory from 10.0.38. Extensions must target .NET Standard 2.0. Migration via LCS 'Disable CSU Core' = No.",
    content: `
## Commerce Scale Unit (CSU) Core — Overview

CSU Core is the next-generation, high-performance platform for Dynamics 365 Commerce to host the headless commerce engine. It replaces the legacy .NET Framework CSU with ASP.NET Core and .NET Core (v6+).

### Benefits
- Better API performance than legacy CSU
- Runs on .NET Core / .NET 6
- Backward compatible with extensions built using Commerce SDK, .NET Standard 2.0, and Visual Studio 2022
- Cross-platform, high-performance framework

---

## CSU Core Release Plan

| Version | Change |
|---|---|
| 10.0.22 | New deployments CAN use CSU Core |
| 10.0.22+ | All new deployments use CSU Core BY DEFAULT |
| 10.0.38+ | **Disable CSU Core** option is **No** by default; cannot be set to Yes |

On-premises and self-hosted CSU installers also use the ASP.NET Core / .NET Core platform.

> **Warning:** Outbound IP addresses for cloud-hosted CSUs are NOT stable and should never be relied on. IP addresses can change at any time.

---

## Migrate Existing Microsoft-Hosted CSU to CSU Core

**Prerequisite:** Extensions must be compatible with Commerce SDK OR .NET Standard 2.0 / .NET 6.

### Migration Steps (via LCS)
1. Sign in to [LCS](https://lcs.dynamics.com)
2. Go to the page where you manage CSUs → select **Update**
3. In the **Update** dialog → set **Disable CSU Core** = **No**
4. Select **Update**

### Post-Migration Notes
- Commerce SDK objects are already configured to use .NET 6 by default — no changes needed
- The switch to CSU Core does NOT require running the **Commerce Initialize** function or the **9999** job
- If on 10.0.37 or earlier with Retail SDK extensions → set **Disable CSU Core** = Yes temporarily, then migrate extensions before upgrading to 10.0.38+

---

## Extension Compatibility

### Target Framework Requirements
| Extension Component | Target Framework | Commerce SDK Version |
|---|---|---|
| Headless commerce APIs (Retail Server) | .NET Standard 2.0 | 10.0.23 or later |
| Commerce Runtime (CRT) | .NET Standard 2.0 | 10.0.23 or later |

### Validate Extension Compatibility
Append \`healthcheck?testname=extensions\` to your Retail Server URL:
\`\`\`
https://<MyRetailServerURL>/healthcheck?testname=extensions
\`\`\`
The result shows a table with compatible and incompatible extensions.

### Migrate Retail SDK Extensions to CSU Core
- Extensions built with the legacy .NET Framework and Retail SDK packages will NOT run in CSU Core
- Must rebuild targeting .NET Standard 2.0
- Recommended path: [Migrate Retail SDK extensions to Commerce SDK](https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/migrate-commerce-sdk)
- Commerce SDK supports CSU Core out of the box
`.trim(),
    codeBlocks: [
      `https://<MyRetailServerURL>/healthcheck?testname=extensions`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 14: Headless Commerce Integration ───────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/headless-commerce-integration

const HEADLESS_INTEGRATION_ENTRIES: DocEntry[] = [
  {
    id: "headless-commerce-integration",
    title: "Get Started with Headless Commerce Integration — Samples and Architecture",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/headless-commerce-integration",
    category: "headless-commerce",
    tags: [
      "headless-commerce", "composable-commerce", "retail-server-api", "csu",
      "storefront", "custom-storefront", "github-samples", "azure-function",
      "commerce-proxy", "logic-app", "console-app",
      "customers", "inventory", "orders", "payments", "prices", "products",
      "HeadlessCommerceCommonAPICollection", "SampleCommerceProductPublisher",
      "SampleCustomerCreateSearch", "HeadlessSampleConsoleApp",
    ],
    summary:
      "Official GitHub samples and architecture guidance for integrating custom storefronts with the Dynamics 365 Commerce headless engine (CSU/Retail Server APIs). Covers customers, inventory, orders, payments, prices, and products. Repo: microsoft/Dynamics-365-FastTrack-Implementation-Assets.",
    content: `
## Headless Commerce Integration — Getting Started

Microsoft provides official sample implementations for headless and composable commerce scenarios to accelerate custom storefront development against the Dynamics 365 Commerce headless engine (Retail Server / CSU APIs).

### Official Sample Repository
[Dynamics-365-FastTrack-Implementation-Assets — HeadlessCommerceSamples](https://github.com/microsoft/Dynamics-365-FastTrack-Implementation-Assets/tree/master/ERP/Commerce/HeadlessCommerceSamples)

---

## Architecture and Guidance (Docs Folder)

The repo's **Docs** folder contains:

| Topic | Contents |
|---|---|
| **Architecture** | Overview of headless integration patterns and concepts |
| **Customers** | Customer master data and account integration |
| **Inventory** | Real-time product inventory queries |
| **Orders** | Order creation and processing via the Headless Commerce Engine (CSU) |
| **Payments** | Payment integration strategies for headless scenarios |
| **Prices** | Product pricing, discounts, and price lookups |
| **Products** | Accessing and managing product master data |

---

## Code Samples (Assets Folder)

| Sample | Description |
|---|---|
| **HeadlessCommerceCommonAPICollection** | Curated set of common API calls for testing and exploration |
| **SampleCommerceProductPublisher** | Azure Function + publisher that uses the Commerce Proxy to retrieve product data via headless APIs |
| **SampleCustomerCreateSearch** | Logic App samples for creating and searching customers |
| **HeadlessSampleConsoleApp** | Console app that shows how to ingest orders into CSU |

These samples are quick-start templates and reference implementations for partners, ISVs, and customers building custom headless commerce experiences.

---

## Additional Reference

- **Full API documentation:** [Commerce Scale Unit (CSU) and Core Service APIs](https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-customer-consumer-api)
  - Includes guidance for packaging, deploying, and operating headless commerce solutions
- All APIs are exposed via the **Retail Server** (CSU) OData endpoint
`.trim(),
    codeBlocks: [
      `https://github.com/microsoft/Dynamics-365-FastTrack-Implementation-Assets/tree/master/ERP/Commerce/HeadlessCommerceSamples`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 15-19: API Reference ────────────────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-customer-consumer-api
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/consume-retail-server-api
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/typescript-proxy-retail-pos
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-overview
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/crt-services

const API_REFERENCE_ENTRIES: DocEntry[] = [
  {
    id: "api-csu-roles-auth",
    title: "CSU APIs — Roles, Authentication, and Metadata",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-customer-consumer-api",
    category: "api-reference",
    tags: [
      "csu", "retail-server", "odata", "api", "roles", "authentication",
      "CommerceRole", "Employee", "Customer", "Application", "Anonymous", "BusinessPartnerEmployee",
      "metadata", "https", "app-registration", "entra-id", "azure-ad",
      "retail-proxy", "typescript-proxy", "csharp-proxy", "external-application",
      "operating-unit-number", "ManagerFactory", "RetailServerContext",
    ],
    summary:
      "CSU exposes OData HTTP APIs consumed via proxy (TypeScript or C#) or raw OData client. Five roles: Employee (POS), Customer (e-commerce authenticated), Anonymous (e-commerce unauthenticated), Application (service-to-service), BusinessPartnerEmployee (B2B). Metadata available at https://<RS-URL>/Commerce/$metadata.",
    content: `
## CSU Customer and Consumer APIs — Overview

Commerce Scale Unit (CSU) exposes OData Web API over HTTPS. Any connected device can access CSU business data and operations. The embedded CRT provides a unified omni-channel platform. APIs are stateless and support linear scale-out.

### Browse Metadata
\`\`\`
https://RS-URL/Commerce/$metadata
\`\`\`
Returns a list of all Retail Server APIs with input/output parameters.

---

## Commerce Roles

Every request to CSU (via Commerce proxy) uses one of these roles:

| Role | Usage |
|---|---|
| \`CommerceRole.Employee\` | POS device activation (device token) + authenticated employee |
| \`CommerceRole.Customer\` | Authenticated e-commerce customer (signed-in) |
| \`CommerceRole.Anonymous\` | Unauthenticated e-commerce customer. Note: anonymous access is NOT enabled by default — contact Support to enable |
| \`CommerceRole.Application\` | Service-to-service via Microsoft Entra (Azure AD) app registration |
| \`CommerceRole.BusinessPartnerEmployee\` | B2B2B contractor working for a seller channel |

A role filter is applied to every API CSU exposes.

---

## Authentication for External Applications

External app integration → **Application** authentication (Entra service-to-service).
E-commerce → **Customer** authentication.

### Step 1: Register App in Azure App Registrations (for Retail Server)
1. Azure Portal → Microsoft Entra ID → App registrations → New registration
2. Accounts: "Single tenant" only
3. After registering: **Expose an API** → Add a scope → copy the **Application ID URI** (starts with \`api://...\`) — this is the **Server Resource ID**

### Step 2: Register Client App
1. New app registration (different name)
2. API permissions → APIs my organization uses → select the Retail Server app → add permissions

### Step 3: Add Client Secret
1. Client app → Certificates & secrets → New client secret → record the value

### Step 4: Register in Commerce Headquarters
1. **Retail and Commerce > HQ setup > Parameters > Commerce shared parameters**
2. **Identity providers** FastTab → select provider type = Microsoft Entra ID
3. **Relying parties** FastTab → **Add** → enter client ID, Type = Confidential, UserType = Application
4. **Server resource IDs** FastTab → **Add** → enter the Application ID URI
5. Save → run CDX job **1110**

### Console App Configuration (app.config)
\`\`\`xml
<appSettings>
  <add key="aadClientId" value="client id from client app registration" />
  <add key="aadClientSecret" value="client secret" />
  <add key="aadAuthority" value="https://sts.windows.net/<tenant-id>/" />
  <add key="retailServerUrl" value="https://RetailServerURL/Commerce" />
  <add key="resource" value="api://aaaabbbb-0000-cccc-1111-dddd2222eeee" />
  <add key="operatingUnitNumber" value="OUN value" />
</appSettings>
\`\`\`

### NuGet Packages Required
- \`Microsoft.Identity.Client\`
- \`Microsoft.Dynamics.Commerce.RetailProxy\` (from RetailSDK\\pkgs)

### C# Code: Create ManagerFactory and Call APIs
\`\`\`csharp
private static async Task<ManagerFactory> CreateManagerFactory()
{
    var authContext = new AuthenticationContext(authority.ToString(), false);
    var authResult = await authContext.AcquireTokenAsync(resource, new ClientCredential(clientId, clientSecret));
    var token = new ClientCredentialsToken(authResult.AccessToken);
    var context = RetailServerContext.Create(retailServerUrl, operatingUnitNumber, token);
    return ManagerFactory.Create(context);
}

// Usage: get order history
private static async Task<PagedResult<SalesOrder>> GetOrderHistory(string customerId)
{
    var factory = await CreateManagerFactory();
    var mgr = factory.GetManager<ICustomerManager>();
    return await mgr.GetOrderHistory(customerId, new QueryResultSettings { Paging = new PagingInfo { Top = 10, Skip = 10 } });
}
\`\`\`
`.trim(),
    codeBlocks: [
      `https://RS-URL/Commerce/$metadata`,
      `<appSettings>
  <add key="aadClientId" value="client id from client app registration" />
  <add key="aadClientSecret" value="client secret" />
  <add key="aadAuthority" value="https://sts.windows.net/<tenant-id>/" />
  <add key="retailServerUrl" value="https://RetailServerURL/Commerce" />
  <add key="resource" value="api://aaaabbbb-0000-cccc-1111-dddd2222eeee" />
  <add key="operatingUnitNumber" value="OUN value" />
</appSettings>`,
      `var context = RetailServerContext.Create(retailServerUrl, operatingUnitNumber, token);
return ManagerFactory.Create(context);`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "api-csu-controllers",
    title: "CSU API Controllers — Customer, Cart, SalesOrder, Products, and More",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-customer-consumer-api",
    category: "api-reference",
    tags: [
      "csu", "retail-server", "odata", "controllers",
      "CustomerController", "CartController", "SalesOrderController", "ProductsController",
      "OrgUnitsController", "PricingController", "GiftCardController",
      "Checkout", "AddCartLines", "GetOrderHistory", "Search", "GetById",
      "PageResult", "QueryResultSettings", "SalesOrder", "Cart", "Customer", "SimpleProduct",
      "GetActivePrices", "GetProductAvailabilities", "GetByIds",
    ],
    summary:
      "Reference of key CSU OData controllers and their APIs: Customer (GetOrderHistory, Search, SaveCustomer), Cart (Checkout, AddCartLines, UpdateCartLines, AddTenderLine), SalesOrder (Search, GetSalesOrderDetailsByTransactionId), Products (Search, GetById, GetByIds, GetActivePrices, GetProductAvailabilities), OrgUnits, Pricing, GiftCard, and many more.",
    content: `
## CSU OData Controllers — Key APIs

### Customer Controller
| API | Roles | Description |
|---|---|---|
| CreateEntity | Employee, Anonymous, Application | Creates a customer |
| UpdateEntity | Employee, Customer, Application | Updates customer |
| GetOrderHistory | Employee, Customer, Application | Returns sales orders for customer |
| GetPurchaseHistory | Employee, Customer, Application | Gets purchase history |
| Search | Employee, Application | Searches for customers by criteria |
| SearchByFields | Employee, Customer, Application | Searches by name, phone, etc. |
| GetCustomerBalance | Employee | Gets customer account balance |
| GetByAccountNumbers | Employee, Customer, Application | Gets customers by account number list |
| GetOrderShipmentsHistory | Employee, Customer, Application | Gets order shipment history |

### Cart Controller
| API | Roles | Description |
|---|---|---|
| Checkout | Employee, Customer, Anonymous, Application | Checks out the cart → returns SalesOrder |
| AddCartLines | Employee, Customer, Anonymous, Application | Adds lines to cart |
| UpdateCartLines | Employee, Customer, Anonymous, Application | Updates cart lines |
| RemoveCartLines | Customer, Anonymous, Application | Deletes cart lines |
| VoidCartLines | Employee | Voids cart lines |
| AddTenderLine | Employee | Adds tender line to cart |
| VoidTenderLine | Employee | Voids a tender line |
| SuspendWithJournal | Employee | Suspends cart with journal entry |
| Resume | Employee | Resumes a suspended cart |
| RecallOrder | Employee | Recalls a customer order to cart |
| RecalculateOrder | Employee | Recalculates customer order |
| AddDiscountCode | Employee, Customer, Anonymous, Application | Adds discount code to cart |
| AddCoupons | Employee, Customer, Anonymous, Application | Adds coupon codes |
| GetDeliveryOptions | Employee, Customer, Anonymous, Application | Gets delivery options |
| UpdateDeliverySpecification | Customer, Anonymous, Application | Updates delivery spec for cart header |
| GetCardPaymentAcceptPoint | Employee, Customer, Anonymous, Application | Gets card payment web page |
| RetrieveCardPaymentAcceptResult | Employee, Customer, Anonymous, Application | Retrieves payment authorization result |
| OverrideCharge | Employee, Application | Overrides a charge amount |
| AddCharge | Employee, Application | Adds a charge to cart |
| GetPromotions | Customer, Anonymous, Application | Gets promotions for cart |

### SalesOrder Controller
| API | Roles | Description |
|---|---|---|
| Search | Employee, Customer | Searches orders by criteria |
| SearchOrders | Employee, Customer | Searches orders by OrderSearchCriteria |
| GetSalesOrderDetailsByTransactionId | Employee, Customer | Gets order by transaction ID |
| GetSalesOrderDetailsBySalesId | Employee, Customer | Gets order by sales ID |
| GetReceipts | Employee | Gets receipts for printing |
| GetByReceiptId | Employee | Gets sales orders by receipt ID |
| CreateEntity | Employee, Application | Uploads a booked sales order with tender lines |
| GetInvoicesBySalesId | Employee | Gets invoices by sales ID |
| GetInvoiceDetails | Employee, Customer, Application | Gets invoice lines, charges, taxes |
| SendReceipt | Employee | Sends receipt to email address |
| CheckInForOrderPickup | Anonymous, Customer | Check-in for order pickup |

### Products Controller
| API | Roles | Description |
|---|---|---|
| Search | Employee, Customer, Anonymous, Application | Searches products by OData query |
| GetById | Employee, Customer, Anonymous, Application | Gets SimpleProduct by record ID |
| GetByIds | Employee, Customer, Anonymous, Application | Gets products by list of IDs |
| SearchByCategory | Employee, Customer, Anonymous, Application | Searches by category |
| SearchByText | Employee, Customer, Anonymous, Application | Searches by text |
| GetActivePrices | Employee, Customer, Anonymous, Application | Gets prices for product list |
| GetPrice | Employee, Customer, Anonymous, Application | Gets price for one product |
| GetProductAvailabilities | Employee, Customer, Anonymous, Application | Gets available inventory |
| GetEstimatedAvailability | Employee, Customer, Anonymous, Application | Gets estimated availability |
| GetDimensionValues | Employee, Customer, Anonymous, Application | Gets product dimension values |
| GetVariantsByDimensionValues | Employee, Customer, Anonymous, Application | Gets product variants |
| GetAttributeValues | Employee, Customer, Anonymous, Application | Gets product attributes |
| GetMediaLocations | Employee, Customer, Anonymous, Application | Gets product media URLs |
| Changes | Employee, Storefront | Gets changed products (CDX sync) |
| ReadChangedProducts | Application | Reads changed products (application role) |

### OrgUnits Controller
| API | Roles | Description |
|---|---|---|
| Get | Application, Employee, Customer, Anonymous | Gets all org units |
| GetOrgUnitLocationsByArea | Application, Employee, Customer, Anonymous | Finds stores in area |
| SearchOrgUnitLocations | Application, Employee, Customer, Anonymous | Searches stores by criteria |
| GetAvailableInventory | Application, Employee, Customer, Anonymous | Gets inventory across all stores |

### Pricing Controller
| API | Roles | Description |
|---|---|---|
| CalculateSalesDocument | Employee, Customer, Anonymous, Application | Calculates prices/discounts for cart |

### Other Controllers
- **GiftCard**: GetGiftCardInquiry (Employee, Customer, Anonymous, Application)
- **TenderTypes**: GetTenderTypes (all roles)
- **ReasonCodes**: GetReasonCodes, GetReasonCodesById (Employee)
- **Recommendations**: Get, GetElements (all roles)
- **Search**: GetSearchSuggestions, GetSearchConfiguration (all roles)
- **SalesOrdersFulfillment**: ShipFulfillmentLines, GetFulfillmentLines (Employee)
- **TransferOrder**: Get, Commit, GetTransferOrderLines (Employee)
- **PurchaseOrder**: Get, Commit (Employee)
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "api-typescript-csharp-proxy",
    title: "TypeScript and C# Proxy Generation for POS and Offline",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/typescript-proxy-retail-pos",
    category: "api-reference",
    tags: [
      "typescript-proxy", "csharp-proxy", "commerce-proxy", "pos", "offline",
      "CommerceProxyGenerator", "DataServiceEntities.g.ts", "DataServiceRequests.g.ts",
      "Interfaces.g.cs", "RetailProxy", "IEdmModelExtension", "EdmModel",
      "RetailProxy.MPOSOffline.ext.config", "Hosting.Contracts",
      "typescriptextensions", "typescriptmoduleextensions",
      "retail-server-extension", "crt", "10.0.12",
    ],
    summary:
      "When adding a new Retail Server API, you must generate the Commerce proxy. TypeScript proxy: POS uses it to call RS APIs (required for online). C# proxy: used when POS is offline (communicates with CRT directly). From Commerce 10.0.12+, use CreateRetailServerExtension API — CommerceProxyGenerator.exe only needed for 10.0.11 and lower.",
    content: `
## TypeScript and C# Proxies for Retail POS

All POS clients use the proxy API to interact with Retail Server. The Commerce proxy abstracts the interface between Retail Server and CRT.

### When to Generate a Proxy
When you:
- Create a new Retail Server API (new entity or request/response)
- Want POS to access that custom API via typed TypeScript/C#

### Two Proxy Types

| Proxy | Used by | When needed |
|---|---|---|
| **TypeScript proxy** | POS (online, browser-based) | Required — POS cannot call RS without it |
| **C# proxy** | POS offline mode + Commerce clients | Required for offline POS; also needed for Dynamics Commerce platform |

---

## TypeScript Proxy (10.0.12+)

From Commerce 10.0.12 onwards, the proxy is generated automatically when you use:
→ [Create a new Retail Server extension API](https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-icontroller-extension)

No manual CommerceProxyGenerator.exe needed.

---

## TypeScript Proxy (10.0.11 and lower)

Use \`CommerceProxyGenerator.exe\` from:
\`RetailSDK\\Reference\\Microsoft.Dynamics.Commerce.Tools.CoreProxyGenerator.<version>\\tools\`

### Steps
1. Copy custom RS API, CRT, and dependent libraries to \`RetailSDK\\Reference\`
2. Open command prompt as admin → navigate to the tools folder
3. Run one of these commands:

**POS TypeScript proxy:**
\`\`\`
CommerceProxyGenerator.exe <Path>\\Microsoft.Dynamics.Retail.RetailServerLibrary.dll <YourRetailServerExtension.dll> /application:typescriptextensions
\`\`\`

**Commerce TypeScript proxy (module extensions):**
\`\`\`
CommerceProxyGenerator.exe <Path>\\Microsoft.Dynamics.Retail.RetailServerLibrary.dll <YourRetailServerExtension.dll> /application:typescriptmoduleextensions
\`\`\`

Output: **DataServiceEntities.g.ts** and **DataServiceRequests.g.ts** — include these in your POS extension project.

---

## C# Proxy (10.0.11 and lower)

> **Note:** Extensions built using \`Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts\` API work in both online and offline without a separate C# proxy. Only needed for 10.0.11 or lower or non-Hosting.Contracts extensions.

### Steps
1. Open \`RetailSDK\\SampleExtensions\\RetailProxy\\RetailProxy.Extensions.StoreHoursSample\`
2. Edit the .csproj:
   - Set \`<RootNamespace>\` and \`<AssemblyName>\` to your custom values
   - Update \`<CommerceProxyGeneratorExtendedAssemblyPaths>\` to point to your RS extension DLL
3. Rebuild → \`Interfaces.g.cs\` is auto-generated in \`Adapters\` folder
4. Add a class extending the interface manager, implementing only needed methods
5. Build the proxy, copy output DLL to \`RetailSDK\\References\`
6. Register in \`RetailProxy.MPOSOffline.ext.config\`:
\`\`\`xml
<add source="assembly" value="Contoso.Commerce.RetailProxy.StoreHoursSample" />
\`\`\`
7. Same config update in: \`C:\\Program Files (x86)\\Microsoft Dynamics 365\\70\\Retail Modern POS\\ClientBroker\\ext\`

### Initialize EDM Model (for Commerce clients)
In your \`Startup.cs\`:
\`\`\`csharp
RetailServerContext.Initialize(new IEdmModelExtension[]
{
    new Contoso.Commerce.RetailProxy.StoreHoursSample.EdmModel(),
});
\`\`\`
`.trim(),
    codeBlocks: [
      `CommerceProxyGenerator.exe <Path>\\Microsoft.Dynamics.Retail.RetailServerLibrary.dll <YourExtension.dll> /application:typescriptextensions`,
      `CommerceProxyGenerator.exe <Path>\\Microsoft.Dynamics.Retail.RetailServerLibrary.dll <YourExtension.dll> /application:typescriptmoduleextensions`,
      `<add source="assembly" value="Contoso.Commerce.RetailProxy.StoreHoursSample" />`,
      `RetailServerContext.Initialize(new IEdmModelExtension[]
{
    new Contoso.Commerce.RetailProxy.StoreHoursSample.EdmModel(),
});`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "api-crt-architecture",
    title: "Commerce Runtime (CRT) Architecture and Configuration",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-overview",
    category: "api-reference",
    tags: [
      "crt", "commerce-runtime", "architecture", "layers",
      "data-access", "services", "workflow", "api",
      "request", "response", "handler",
      "CommerceRuntime.Ext.config", "configuration",
      "stored-procedures", "business-logic", "channel",
      "portable-net", "omni-channel",
    ],
    summary:
      "CRT is a collection of portable .NET libraries that encapsulate business logic for the commerce channel. Four layers: Data Access (stored procs → entities), Services (real-time queries, customizable), Workflow (collections of services defining business processes), API (top layer, extensible). Extensions registered via CommerceRuntime.Ext.config.",
    content: `
## Commerce Runtime (CRT) — Architecture and Configuration

CRT is a collection of portable .NET libraries that encapsulate business logic for the commerce channel. It serves as the engine for Commerce, running inside the CSU process.

---

## Architecture Layers (bottom to top)

### 1. Data Access Layer
- Sits on top of the database
- Translates raw data into in-memory objects (entities: products, prices, etc.)
- Stored procedures pass data packets from the DB to entities that services and workflows consume
- You can add new fields to data packets in Commerce

### 2. Services Layer
- Sits on top of Data Access
- Queries real-time data
- Customize existing services or add new ones with new functionality

### 3. Workflow Layer
- Sits on top of Services
- A workflow = collection of services + business logic = a business process
- Example: adding item to cart → workflow gets price, validates, checks inventory, calculates shipping, tax, discounts
- You can use built-in workflows, create new ones, or connect to partner systems

### 4. API Layer
- Sits on top of Workflow
- Exposed externally via Retail Server (OData)
- Extensible to fit your business processes

---

## CRT Configuration

The CRT configuration file (\`CommerceRuntime.Ext.config\`) lists services as types.

- CRT loads services in the ORDER they appear in the config file
- CRT automatically loads all default services
- If you add a NEW service ABOVE a default service, the new service REPLACES the default

### Extension Config Registration Example
\`\`\`xml
<commerceRuntime>
  <composition>
    <add source="assembly" value="Contoso.Commerce.Runtime.MyExtension" />
  </composition>
</commerceRuntime>
\`\`\`

---

## Key Extension Rule

**CRT extension code MUST NOT reference CRT business logic classes**, methods, or handlers from:
- \`Runtime.Workflow\`
- \`Runtime.Services\`
- \`Runtime.DataServices\`

These are not backward compatible and will break extensions during upgrades.

**Only use classes from:**
- \`Runtime.*.Messages\` (requests and responses)
- \`Runtime.Framework\`
- \`Runtime.Data\`
- \`Runtime.Entities\`
`.trim(),
    codeBlocks: [
      `<commerceRuntime>
  <composition>
    <add source="assembly" value="Contoso.Commerce.Runtime.MyExtension" />
  </composition>
</commerceRuntime>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "api-crt-services-catalog",
    title: "CRT Services Catalog — Requests, Responses, and Workflow Handlers",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/crt-services",
    category: "api-reference",
    tags: [
      "crt", "services", "workflow", "request", "response", "handler",
      "CartService", "CustomerService", "PricingService", "ProductService",
      "ReceiptService", "TaxService", "PaymentService", "LoyaltyService",
      "GiftCardService", "ReasonCodeService", "ShippingService",
      "SaveCartRequest", "GetCartRequest", "CalculateSalesTransactionServiceRequest",
      "SaveCustomerServiceRequest", "GetCustomersServiceRequest",
      "CalculatePricesServiceRequest", "CalculateDiscountsServiceRequest",
      "CalculateTaxServiceRequest", "GetReceiptServiceRequest", "GetCustomReceiptFieldServiceRequest",
      "SaveCartRequestHandler", "SaveCustomerOrderRequestHandler", "SubmitOrderRequestHandler",
      "WorkflowRequestHandler", "SingleAsyncRequestHandler", "INamedRequestHandler",
    ],
    summary:
      "CRT services are groups of requests and responses. POS sends requests to CSU → CSU calls CRT → CRT returns response. Key services: CartService, CustomerService, PricingService, ProductService, ReceiptService, TaxService, PaymentService, LoyaltyService. Workflow layer: SaveCartRequest, SaveCustomerOrderRequest, SubmitSalesTransactionRequest. Critical rule: extend by adding triggers, new services, or overriding requests — never call internal Runtime.Workflow/Services/DataServices classes.",
    content: `
## CRT Services — Overview

CRT services are groups of requests and responses that handle all commerce business logic.

**Flow:** POS → Retail Server (CSU) → CRT service request → zero or more workflow requests → zero or more data access requests → response back to POS

**POS is a thin client**: all business logic runs in CRT.

---

## Three Main CRT Layers

| Layer | Purpose | Customizable |
|---|---|---|
| Services | Business operations (real-time queries) | Yes — add triggers, override requests, create new services |
| Workflow | Orchestrates services into business processes | Yes — customize workflow requests/responses |
| Data Access | DB → entity mapping via stored procs | Yes (but avoid unless necessary) |

Do NOT customize: Runtime, Authentication, Data Access Managers layers.

---

## Default CRT Services

| Service | Description |
|---|---|
| AddressService | Verifies addresses, gets cities/counties/states |
| BarcodeService | Processes barcodes, calculates quantity/price from barcode |
| CartService | Gets cart from transaction and sales transaction tables |
| ChargeService | Calculates automatic, price, and shipping charges |
| CouponService | Validates and updates coupon codes |
| CurrencyService | Converts currencies by exchange rates |
| CustomerService | Save/get customer, purchase history, customer balance |
| EmployeeService | Gets employee info and employees by store |
| FormattingService | Formats numbers, currencies, dates |
| GiftCardService | Issue gift card, get balance, add value |
| LoyaltyService | Implements loyalty reward programs |
| NotificationService | Maintains POS notification service |
| PaymentService | Credit card authorization, payment processing, extensible for partner processors |
| ProductService / ProductsService | Gets product/variant information |
| PricingService | Real-time pricing with discounts |
| ProductAvailabilityService | Calculates sellable quantities |
| ReasonCodeService | Gets/calculates required reason codes |
| ReceiptService | Gets and formats receipt data |
| RoundingService | Rounds tender amounts by tender type and store |
| SalesOrderService | Creates sales orders from cart |
| SearchProductsService | Searches products by text |
| ShippingService | Calculates shipping costs and options |
| StockCountService | Creates/commits/syncs stock journals |
| StoreOperationService | Save and Drop, Tender declaration, Search journal |
| TaxService | Calculates sales tax (built-in or partner service) |
| TotalingService | Calculates totals on sales transactions and lines |

---

## Key Service Requests

### CartService
| Request | Purpose |
|---|---|
| GetCartServiceRequest | Gets cart by cart ID from sales transaction table |
| CalculateSalesTransactionServiceRequest | Calculates transaction totals by calculation mode |
| GetSalesTransactionsServiceRequest | Gets sales transaction from HQ |

### CustomerService
| Request | Purpose |
|---|---|
| SaveCustomerServiceRequest | Saves customer from POS |
| GetCustomersServiceRequest | Gets customer details |
| CustomersSearchServiceRequest | Searches customers from POS |
| GetCustomerBalanceServiceRequest | Gets customer account balance |
| GetOrderHistoryServiceRequest | Gets customer order history |
| GetPurchaseHistoryServiceRequest | Gets customer purchase history |
| CustomerSearchByFieldsServiceRequest | Searches by name, phone, etc. |

### PricingService
| Request | Purpose |
|---|---|
| CalculatePricesServiceRequest | Calculates price for each item in cart |
| CalculateDiscountsServiceRequest | Calculates discounts for cart items |
| GetIndependentPriceDiscountServiceRequest | Price check (non-transaction context) |
| GetAllPeriodicDiscountsServiceRequest | Gets all periodic discounts |
| GetDiscountCodesServiceRequest | Gets all configured discount codes |

### ReceiptService
| Request | Purpose |
|---|---|
| GetReceiptServiceRequest | Gets receipt type and generates receipt data |
| GetCustomReceiptFieldServiceRequest | **Override this** to add custom receipt fields |
| GetEmailReceiptServiceRequest | Gets formatted receipt for print/email |

### TaxService
| Request | Purpose |
|---|---|
| CalculateTaxServiceRequest | Calculates taxes on transaction |
| AssignTaxCodesServiceRequest | Assigns tax codes before calculation |

---

## Default Workflow Handlers

| Request | Handler | Purpose |
|---|---|---|
| SaveCartRequest | SaveCartRequestHandler | Triggered on any POS cart change |
| SaveCartLinesRequest | SaveCartLinesRequestHandler | Create/update/delete/void cart lines |
| GetCartRequest | GetCartRequestHandler | Gets cart by search criteria |
| SaveCustomerOrderRequest | SaveCustomerOrderRequestHandler | Saves customer order from cart |
| SubmitSalesTransactionRequest | SubmitOrderRequestHandler | Submits sales transaction |
| SaveVoidTransactionRequest | SaveVoidTransactionRequestHandler | Voids a transaction |
| RecallCustomerOrderRequest | RecallCustomerOrderRequestHandler | Gets sales order → converts to cart |
| ValidateCartForCheckoutRequest | ValidateCartForCheckoutRequestHandler | Validates cart before checkout |
| GetScanResultRequest | GetScanResultRequestHandler | Gets entity from scanned/typed barcode |
| IssueOrAddToGiftCardRequest | IssueOrAddToGiftCardRequestHandler | Issues or tops up gift card |
| SuspendCartRequest | SuspendCartRequestHandler | Suspends cart |
| ResumeCartRequest | ResumeCartRequestHandler | Resumes suspended cart |
| UpdateCommissionSalesGroupRequest | UpdateCommissionSalesGroupHandler | Updates sales rep on cart/line |

---

## Extension Patterns for CRT

1. **Add CRT triggers** (pre/post) — lightweight, no override needed
2. **Create new service** — implement \`IRequestHandler\` or \`SingleAsyncRequestHandler<TRequest>\`
3. **Override request in service class** — replace default handler behavior

Reference: [Commerce runtime extensibility](https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility)

Full request/response documentation: \`...\\RetailSDK\\Code\\Documents\\CommerceRuntimeMessages.chm\`
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Pages 20-25: Create New Functionality / Extensibility ───────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-icontroller-extension
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-application-insights
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/async-commerce-extension
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/channel-db-extensions
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extend-commerce-data-exchange

const EXTENSIBILITY_ENTRIES: DocEntry[] = [
  {
    id: "ext-retail-server-icontroller",
    title: "Create a New Retail Server Extension API with IController",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-server-icontroller-extension",
    category: "extensibility",
    tags: [
      "retail-server", "icontroller", "extension-api", "odata",
      "RoutePrefix", "BindEntity", "HttpPost", "HttpGet",
      "Authorization", "CommerceRoles", "IEndpointContext",
      "PagedResult", "QueryResultSettings", "extensionComposition",
      "web.config", "Hosting.Contracts", "TypeScript-proxy",
      "RetailProxy.MPOSOffline.ext.config", "offline",
      "net-standard-2", "10.0.11",
    ],
    summary:
      "How to create a new Retail Server OData API (10.0.11+) by implementing IController. Steps: create CRT extension first, then create C# class library targeting .NET Standard 2.0, add Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts NuGet, decorate with [RoutePrefix]/[BindEntity], use [HttpPost]/[HttpGet] + [Authorization(CommerceRoles.*)]. Register in web.config extensionComposition. Validate at $metadata URL.",
    content: `
## Create a New Retail Server Extension API (10.0.11+)

### Important Notes
- **Modification of existing Retail Server APIs is NOT supported** — only new APIs
- RS extension must have NO logic except calling CRT with parameters
- Don't extend existing controllers (CustomerController, etc.) — only extend IController
- Don't bind to built-in entities (Customer, Cart, Product) — only custom entities
- Don't include both IController and CommerceController extensions — pick one and migrate all

### Steps

1. **Create CRT extension first** (the RS API is just a thin wrapper over CRT)
2. Create a C# class library project targeting **.NET Standard 2.0**
3. Add project reference to your CRT extension
4. Add NuGet package: **Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts** (from RetailSDK\\pkgs)
5. Create a public controller class extending **IController**
6. Add **[RoutePrefix("YourExtension")]** on the class (custom route only)
7. Add **[BindEntity(typeof(YourEntity))]** if returning a custom entity
8. Add methods with **[HttpPost]** or **[HttpGet]** and **[Authorization(CommerceRoles.*)]**

### Bounded Controller (returns custom entity)
\`\`\`csharp
[RoutePrefix("SimpleExtension")]
[BindEntity(typeof(SimpleEntity))]
public class SimpleExtensionController : IController
{
    [HttpPost]
    [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
    public async Task<string> GetStringValue(IEndpointContext context, string stringValue)
    {
        var resp = await context.ExecuteAsync<GetStringValueResponse>(
            new GetStringValueRequest(stringValue)).ConfigureAwait(false);
        return resp.StringValue;
    }

    [HttpPost]
    [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
    public async Task<SimpleEntity> GetSimpleEntity(IEndpointContext context, string name)
    {
        var resp = await context.ExecuteAsync<GetSimpleEntityResponse>(
            new GetSimpleEntityRequest(name)).ConfigureAwait(false);
        return resp.SimpleEntityObj;
    }
}
\`\`\`

### Unbounded Controller (no entity binding)
\`\`\`csharp
public class UnboundController : IController
{
    [HttpGet]
    [Authorization(CommerceRoles.Anonymous, CommerceRoles.Application,
        CommerceRoles.Customer, CommerceRoles.Device, CommerceRoles.Employee)]
    public Task<bool> SampleGet() => Task.FromResult(true);

    [HttpPost]
    [Authorization(CommerceRoles.Customer, CommerceRoles.Device, CommerceRoles.Employee)]
    public Task<bool> SamplePost() => Task.FromResult(true);
}
\`\`\`

### Paging Support (10.0.19+)
\`\`\`csharp
[HttpPost]
[Authorization(CommerceRoles.Anonymous, CommerceRoles.Customer, CommerceRoles.Employee)]
public async Task<PagedResult<StoreDayHours>> GetStoreDaysByStore(
    IEndpointContext context, string StoreNumber, QueryResultSettings queryResultSettings)
{
    var request = new GetStoreHoursDataRequest(StoreNumber) { QueryResultSettings = queryResultSettings };
    var response = await context.ExecuteAsync<GetStoreHoursDataResponse>(request).ConfigureAwait(false);
    return response.DayHours;
}
\`\`\`

### Register the Extension
\`\`\`xml
<!-- \\RetailServer\\webroot\\web.config -->
<extensionComposition>
  <add source="assembly" value="YourExtensionAssemblyName" />
</extensionComposition>
\`\`\`
Restart IIS after updating web.config.

### Validate
Browse: \`https://RS-URL/Commerce/$metadata\` — verify your entity and methods appear.

### Offline Mode
Copy the RS extension DLL to \`\\Microsoft Dynamics 365\\70\\Retail Modern POS\\ClientBroker\\ext\`.
Update \`RetailProxy.MPOSOffline.ext.config\`:
\`\`\`xml
<composition>
  <add source="assembly" value="Contoso.RetailServer.StoreHoursSample" />
</composition>
\`\`\`

### Debugging
Visual Studio → Debug → Attach to Process → **w3wp.exe** (IIS process for Retail Server).
Find the RS process ID via IIS → Worker Processes.

### Available CommerceRoles
Anonymous, Storefront, Employee, Customer, Device, Application
`.trim(),
    codeBlocks: [
      `[RoutePrefix("SimpleExtension")]
[BindEntity(typeof(SimpleEntity))]
public class SimpleExtensionController : IController
{
    [HttpPost]
    [Authorization(CommerceRoles.Customer, CommerceRoles.Employee)]
    public async Task<SimpleEntity> GetSimpleEntity(IEndpointContext context, string name)
    {
        var resp = await context.ExecuteAsync<GetSimpleEntityResponse>(
            new GetSimpleEntityRequest(name)).ConfigureAwait(false);
        return resp.SimpleEntityObj;
    }
}`,
      `<extensionComposition>
  <add source="assembly" value="YourExtensionAssemblyName" />
</extensionComposition>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-crt-extensibility",
    title: "CRT Extension Patterns — Triggers, Override, New Service, Extension Properties",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility",
    category: "extensibility",
    tags: [
      "crt", "extensibility", "triggers", "pre-trigger", "post-trigger",
      "SingleAsyncRequestHandler", "IRequestHandlerAsync", "INamedRequestHandlerAsync",
      "ExecuteNextAsync", "GetNextAsyncRequestHandler", "NotHandledResponse",
      "extension-properties", "DataContract", "DataMember",
      "CommerceRuntime.Ext.config", "CommerceRuntime.MPOSOffline.ext.config",
      "DatabaseContext", "SqlPagedQuery", "ReadEntityAsync",
      "IRequestTriggerAsync", "SupportedRequestTypes",
      "InvokeExtensionMethodRealtimeRequest", "net-standard-2", "10.0.19",
    ],
    summary:
      "Four main CRT extension patterns: (1) Create new service with IRequestHandlerAsync or SingleAsyncRequestHandler; (2) Override existing request handler — put your entry above the default in CommerceRuntime.Ext.config; (3) Add pre/post triggers with IRequestTriggerAsync; (4) Extension properties (key-value pairs on any entity). Use ExecuteNextAsync to call the base handler from an override. Never reference Runtime.Workflow/Services/DataServices classes.",
    content: `
## CRT Extension Patterns

CRT is C# class libraries (.NET assemblies). All extension projects must target **.NET Standard 2.0** (required from 10.0.19+).

Samples at: \`...\\RetailSDK\\SampleExtensions\\CommerceRuntime\`

---

## Pattern 1: Create a New CRT Service

Three classes required: **Request**, **Response**, **Handler**.

### Request class
\`\`\`csharp
[DataContract]
public sealed class GetStoreHoursDataRequest : Request
{
    public GetStoreHoursDataRequest(string storeNumber) { this.StoreNumber = storeNumber; }

    [DataMember]
    public string StoreNumber { get; private set; }
}
\`\`\`

### Response class
\`\`\`csharp
[DataContract]
public sealed class GetStoreHoursDataResponse : Response
{
    public GetStoreHoursDataResponse(PagedResult<StoreDayHours> dayHours) { this.DayHours = dayHours; }

    [DataMember]
    public PagedResult<StoreDayHours> DayHours { get; private set; }
}
\`\`\`

### Handler — IRequestHandlerAsync (multiple requests)
\`\`\`csharp
public class StoreHoursDataService : IRequestHandlerAsync
{
    public IEnumerable<Type> SupportedRequestTypes => new[] { typeof(GetStoreHoursDataRequest) };

    public async Task<Response> Execute(Request request)
    {
        if (request is GetStoreHoursDataRequest r)
            return await GetStoreDayHoursAsync(r).ConfigureAwait(false);
        throw new NotSupportedException();
    }

    private async Task<Response> GetStoreDayHoursAsync(GetStoreHoursDataRequest request)
    {
        using (var db = new DatabaseContext(request.RequestContext))
        {
            var query = new SqlPagedQuery(request.QueryResultSettings)
            {
                DatabaseSchema = "ext",
                Select = new ColumnSet("DAY", "OPENTIME", "CLOSINGTIME", "RECID"),
                From = "CONTOSORETAILSTOREHOURSVIEW",
                Where = "STORENUMBER = @storeNumber",
            };
            query.Parameters["@storeNumber"] = request.StoreNumber;
            return new GetStoreHoursDataResponse(
                await db.ReadEntityAsync<StoreDayHours>(query).ConfigureAwait(false));
        }
    }
}
\`\`\`

### Handler — SingleAsyncRequestHandler (single request, simpler)
\`\`\`csharp
public class CrossLoyaltyCardService : SingleAsyncRequestHandler<GetCrossLoyaltyCardRequest>
{
    protected override async Task<Response> Process(GetCrossLoyaltyCardRequest request)
    {
        // business logic
        return await Task.FromResult(new GetCrossLoyaltyCardResponse(0));
    }
}
\`\`\`

---

## Pattern 2: Override an Existing Request Handler

Use **SingleAsyncRequestHandler<TRequest>** or **INamedRequestHandlerAsync** (for named handlers).

**Important:** In CommerceRuntime.Ext.config, your extension must be listed **ABOVE** the default service (MEF loads by order — first wins).

### ExecuteNextAsync — override and call base
\`\`\`csharp
public class MyCustomerSaveHandler : SingleAsyncRequestHandler<SaveCustomerServiceRequest>
{
    protected override async Task<Response> Process(SaveCustomerServiceRequest request)
    {
        // Call the base handler first
        var response = await this.ExecuteNextAsync<SaveCustomerServiceResponse>(request).ConfigureAwait(false);

        // Add custom logic after base handler
        // e.g., save extension properties to custom table
        return response;
    }
}
\`\`\`

### GetNextAsyncRequestHandler — get base handler and modify results
\`\`\`csharp
protected override async Task<Response> Process(SearchProductsServiceRequest request)
{
    var nextHandler = this.GetNextAsyncRequestHandler();
    var response = await nextHandler.Execute(request) as SearchProductsServiceResponse;
    // filter/modify response
    return response;
}
\`\`\`

### NotHandledResponse — conditionally skip override
\`\`\`csharp
protected override async Task<Response> Process(MyRequest request)
{
    if (!ShouldHandle(request))
        return await Task.FromResult(NotHandledResponse.Instance);
    // custom logic
}
\`\`\`

---

## Pattern 3: Triggers (Pre / Post)

Triggers run extra logic before or after any request **without overriding** it.

\`\`\`csharp
public class MySaveTrigger : IRequestTriggerAsync
{
    public IEnumerable<Type> SupportedRequestTypes =>
        new[] { typeof(SaveCartRequest) };

    public async Task OnExecuting(Request request)
    {
        // pre-trigger: validation, custom logic
        await Task.CompletedTask;
    }

    public async Task OnExecuted(Request request, Response response)
    {
        // post-trigger: add extension properties, call external service
        var cartRequest = (SaveCartRequest)request;
        // e.g., set extension property on the cart
        cartRequest.Cart.SetProperty("MyCustomField", "value");
        await Task.CompletedTask;
    }
}
\`\`\`

---

## Pattern 4: Extension Properties

Key-value pairs you can attach to any CRT entity (Customer, Cart, Product, Transaction, etc.).

- Set in CRT → available in POS. Set in POS → available in CRT.
- **Not persisted automatically** — write custom code to store them (e.g., in your EXT schema table).
- Flow: post-trigger sets extension property → entity is sent back to POS with the custom data.

\`\`\`csharp
// Set an extension property on a customer entity
customer.SetProperty("EMAILOPTIN", true);

// Read an extension property
bool emailOptin = customer.GetProperty<bool>("EMAILOPTIN");
\`\`\`

---

## Register the CRT Extension

### Online (POS connected to RS)
1. Copy DLL to \`\\RetailServer\\webroot\\bin\\Ext\`
2. Update \`CommerceRuntime.Ext.config\`:
\`\`\`xml
<composition>
  <add source="assembly" value="Contoso.Commerce.Runtime.CustomerSearchSample" />
</composition>
\`\`\`

### Offline (POS offline mode)
1. Copy DLL to \`\\Microsoft Dynamics 365\\70\\Retail Modern POS\\ClientBroker\\ext\`
2. Update \`CommerceRuntime.MPOSOffline.ext.config\`:
\`\`\`xml
<composition>
  <add source="assembly" value="Contoso.Commerce.Runtime.CustomerSearchSample" />
</composition>
\`\`\`

### Extension Settings in Config
\`\`\`xml
<!-- Keys must be prefixed with "ext." -->
<add name="ext.AppInsightsKey" value="your-key" />
\`\`\`
\`\`\`csharp
string key = context.Runtime.Configuration.GetSettingValue("ext.AppInsightsKey");
\`\`\`

### Debugging
- Online: attach to **w3wp.exe** (IIS / RS process)
- Offline: attach to **dllhost.exe**

---

## Critical Rules
- **NEVER reference** \`Runtime.Workflow\`, \`Runtime.Services\`, \`Runtime.DataServices\` — not backward compatible
- **ONLY use**: \`Runtime.*.Messages\`, \`Runtime.Framework\`, \`Runtime.Data\`, \`Runtime.Entities\`
- Always use \`ConfigureAwait(false)\` when executing requests in extension code
- No MSDTC in CRT database extensions
- Don't wrap existing CRT request/response in TransactionScope
`.trim(),
    codeBlocks: [
      `[DataContract]
public sealed class GetStoreHoursDataRequest : Request
{
    public GetStoreHoursDataRequest(string storeNumber) { this.StoreNumber = storeNumber; }
    [DataMember]
    public string StoreNumber { get; private set; }
}`,
      `public class MySaveTrigger : IRequestTriggerAsync
{
    public IEnumerable<Type> SupportedRequestTypes => new[] { typeof(SaveCartRequest) };
    public async Task OnExecuting(Request request) { /* pre-trigger */ await Task.CompletedTask; }
    public async Task OnExecuted(Request request, Response response) { /* post-trigger */ await Task.CompletedTask; }
}`,
      `<composition>
  <add source="assembly" value="Contoso.Commerce.Runtime.CustomerSearchSample" />
</composition>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-application-insights",
    title: "Log Extension Events to Application Insights from CRT and POS",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-application-insights",
    category: "extensibility",
    tags: [
      "application-insights", "telemetry", "logging", "monitoring",
      "TelemetryClient", "TraceTelemetry", "TrackTrace", "TrackEvent",
      "instrumentation-key", "ContosoLogger", "AppInsights",
      "Microsoft.ApplicationInsights", "CommerceRuntime.Ext.config",
      "ext.AppInsightsKey", "POS", "CRT", "npm", "applicationinsights-web",
    ],
    summary:
      "Log telemetry from CRT and POS extensions to Azure Application Insights. CRT: create TelemetryClient singleton reading instrumentation key from CommerceRuntime.Ext.config (ext.AppInsightsKey), use TraceTelemetry with custom dimensions. POS: install @microsoft/applicationinsights-web npm package, create AppInsights singleton, use trackEvent(). RetailLogger class is deprecated.",
    content: `
## Log Extension Events to Application Insights

### Prerequisites
- Create an Application Insights resource in Azure Portal → get the **instrumentation key** (or connection string)
- **RetailLogger is deprecated** — migrate existing extensions to the new model below

---

## CRT Extension — Log to Application Insights

### Step 1: Create ContosoLogger class
NuGet packages needed:
- \`Microsoft.ApplicationInsights\` (or \`Microsoft.ApplicationInsights.AspNetCore\`)
- \`Microsoft.Dynamics.Commerce.Runtime.Framework\` (from \`..\\RetailSDK\\Reference\`)

\`\`\`csharp
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Dynamics.Commerce.Runtime;

public static class ContosoLogger
{
    private static readonly object lockObject = new object();
    private static TelemetryClient client = null;

    public static TelemetryClient GetLogger(RequestContext context)
    {
        if (client == null)
        {
            lock (lockObject)
            {
                if (client == null)
                {
                    string key = context.Runtime.Configuration.GetSettingValue("ext.AppInsightsKey") ?? string.Empty;
                    client = new TelemetryClient(new TelemetryConfiguration(key));
                }
            }
        }
        return client;
    }
}
\`\`\`

### Step 2: Configure the instrumentation key in CommerceRuntime.Ext.config
\`\`\`xml
<settings>
  <add name="ext.AppInsightsKey" value="YOUR-INSTRUMENTATION-KEY" />
</settings>
\`\`\`

### Step 3: Use the logger in CRT extension code
\`\`\`csharp
using Microsoft.ApplicationInsights.DataContracts;

var trace = new TraceTelemetry("CRT executing request", SeverityLevel.Information);
trace.Properties.Add("CustomDimensionColumn1", request.RequestContext.GetTerminalId().ToString());
trace.Properties.Add("CustomDimensionColumn2", "CRT demo - Save Cart request");
ContosoLogger.GetLogger(request.RequestContext).TrackTrace(trace);
\`\`\`

### Step 4: Deploy
Copy \`Contoso.Diagnostic.dll\` and \`Microsoft.ApplicationInsights.dll\` to:
- Manual: \`..\\RetailServer\\webroot\\bin\\Ext\`
- Package: add to \`BuildTools\\Customization.settings\`:
\`\`\`xml
<ISV_CommerceRuntime_CustomizableFile Include="$(SdkReferencesPath)\\Contoso.Diagnostic.dll" />
<ISV_CommerceRuntime_CustomizableFile Include="$(SdkReferencesPath)\\Microsoft.ApplicationInsights.dll" />
\`\`\`

### Step 5: Validate in Azure Portal
Azure Portal → Application Insights → Monitoring → Logs → query \`traces\` table.

---

## POS Extension — Log to Application Insights

### Step 1: Install npm package
\`\`\`
npm i --save @microsoft/applicationinsights-web@2.5.8
\`\`\`
(Package installs to \`POS/Extensions/Libraries/node_modules/@microsoft/applicationinsights-web/\`)

### Step 2: Configure tsconfig.json
\`\`\`json
{
  "exclude": ["Libraries"],
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "applicationinsights-web": ["Libraries/node_modules/@microsoft/applicationinsights-web/dist/applicationinsights-web"]
    }
  }
}
\`\`\`

### Step 3: Declare dependency in manifest.json
\`\`\`json
{
  "dependencies": [{
    "alias": "applicationinsights-web",
    "format": "amd",
    "modulePath": "../Libraries/node_modules/@microsoft/applicationinsights-web/dist/applicationinsights-web"
  }]
}
\`\`\`

### Step 4: AppInsights singleton (TypeScript)
\`\`\`typescript
import { ApplicationInsights } from "applicationinsights-web";

export class AppInsights {
    private static _instance: AppInsights = null;
    private _applicationInsights: ApplicationInsights = null;

    public static get instance(): ApplicationInsights {
        if (AppInsights._instance === null) AppInsights._instance = new AppInsights();
        return AppInsights._instance._applicationInsights;
    }

    constructor() {
        this._applicationInsights = new ApplicationInsights({
            config: { instrumentationKey: 'YOUR_INSTRUMENTATION_KEY_GOES_HERE' }
        });
        this._applicationInsights.loadAppInsights();
    }
}
\`\`\`

### Step 5: Track events in POS extension
\`\`\`typescript
AppInsights.instance.trackEvent({
    name: "extensionTest",
    properties: { "property1": "value1" },
    measurements: { "measurement1": 1 },
});
\`\`\`
`.trim(),
    codeBlocks: [
      `string key = context.Runtime.Configuration.GetSettingValue("ext.AppInsightsKey") ?? string.Empty;
client = new TelemetryClient(new TelemetryConfiguration(key));`,
      `<add name="ext.AppInsightsKey" value="YOUR-INSTRUMENTATION-KEY" />`,
      `AppInsights.instance.trackEvent({ name: "extensionTest", properties: { "prop": "val" } });`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-async-crt",
    title: "Async CRT APIs — SingleAsyncRequestHandler, IRequestHandlerAsync, DatabaseContext",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/async-commerce-extension",
    category: "extensibility",
    tags: [
      "async", "crt", "SingleAsyncRequestHandler", "IRequestHandlerAsync",
      "IRequestTriggerAsync", "IController", "DatabaseContext",
      "Task", "async", "await", "ConfigureAwait",
      "ExecuteStoredProcedureAsync", "ReadEntityAsync", "ExecuteNonQueryAsync",
      "OnExecuting", "OnExecuted", "10.0.10",
    ],
    summary:
      "From Commerce 10.0.10+, CRT supports full async/await programming model. Key classes: SingleAsyncRequestHandler<TReq,TResp> (preferred for new handlers), IRequestHandlerAsync (Execute returns Task<Response>), IRequestTriggerAsync (OnExecuting/OnExecuted return Task), DatabaseContext async methods (ReadEntityAsync, ExecuteStoredProcedureAsync, ExecuteNonQueryAsync). Always use ConfigureAwait(false).",
    content: `
## Async Commerce Runtime (CRT) APIs (10.0.10+)

CRT fully supports async/await with \`Task\` and \`Task<T>\`. Use async for all I/O, DB queries, and network calls.

---

## Key Async Classes and Interfaces

| Class/Interface | Purpose |
|---|---|
| \`SingleAsyncRequestHandler<TReq, TResp>\` | Base class for async handlers (single request) — preferred pattern |
| \`IRequestHandlerAsync\` | Interface for async request handler (multiple requests) |
| \`IRequestTriggerAsync\` | Interface for async pre/post triggers |
| \`IController\` | Base class for async Retail Server controller |
| \`DatabaseContext\` | Async DB execution (replaces sync methods) |

---

## Create a New Async CRT API

### 1. Request class
\`\`\`csharp
[DataContract]
public sealed class AsyncRequestSampleRequest : Request { }
\`\`\`

### 2. Response class
\`\`\`csharp
[DataContract]
public sealed class AsyncSampleResponse : Response
{
    public AsyncSampleResponse(Customer customer) { this.CustomerRec = customer; }
    [DataMember]
    public Customer CustomerRec { get; private set; }
}
\`\`\`

### 3. Async handler (SingleAsyncRequestHandler)
\`\`\`csharp
public class AsyncSampleRequestHandler : SingleAsyncRequestHandler<AsyncSampleRequest, AsyncSampleResponse>
{
    protected override async Task<AsyncSampleResponse> Process(AsyncSampleRequest request)
    {
        var customer = await AsyncSampleMethodGetCustomer(request.RequestContext);
        return new AsyncSampleResponse(customer);
    }

    private async Task<Customer> AsyncSampleMethodGetCustomer(RequestContext context)
    {
        var req = new GetCustomersServiceRequest(QueryResultSettings.SingleRecord, "2001", SearchLocation.Local);
        var resp = await context.ExecuteAsync<GetCustomersServiceResponse>(req);
        return resp.Customers.SingleOrDefault();
    }
}
\`\`\`

---

## Override Out-of-Box Request Asynchronously

\`\`\`csharp
public class GetScanResultRequestHandler : SingleAsyncRequestHandler<GetScanResultRequest, GetScanResultResponse>
{
    protected override async Task<GetScanResultResponse> Process(GetScanResultRequest request)
    {
        // custom logic + async calls
        var product = await this.GetSingleProductByItemId(request.RequestContext, itemId, inventDimId)
            .ConfigureAwait(false);
        var result = new ScanResult(request.ScanInfo.ScannedText) { Product = product };
        return new GetScanResultResponse(result);
    }

    private async Task<SimpleProduct> GetSingleProductByItemId(RequestContext context, string itemId, string inventDimId)
    {
        var getReq = new GetProductsServiceRequest(context.GetPrincipal().ChannelId,
            new[] { new ProductLookupClause { ItemId = itemId, InventDimensionId = inventDimId } },
            QueryResultSettings.AllRecords) { SearchLocation = SearchLocation.Local };
        var products = (await context.ExecuteAsync<GetProductsServiceResponse>(getReq).ConfigureAwait(false)).Products;
        return products.Results.SingleOrDefault();
    }
}
\`\`\`

---

## Async Trigger

\`\`\`csharp
public class SampleRequestTriggerAsync : IRequestTriggerAsync
{
    public IEnumerable<Type> SupportedRequestTypes => new[] { typeof(GetCustomerDataRequest) };

    public Task OnExecuting(Request request)
    {
        // pre-trigger async logic
        return Task.CompletedTask;
    }

    public Task OnExecuted(Request request, Response response)
    {
        // post-trigger async logic
        return Task.CompletedTask;
    }
}
\`\`\`

---

## DatabaseContext Async Methods

| Method | Purpose |
|---|---|
| \`ReadEntityAsync<T>(IDatabaseQuery query)\` | Read entities from DB |
| \`ExecuteStoredProcedureAsync<T>(name, params, settings)\` | Execute stored procedure, paged |
| \`ExecuteNonPagedStoredProcedureAsync<T>(name, params, settings)\` | Execute SP, non-paged |
| \`ExecuteStoredProcedureNonQueryAsync(name, params, settings)\` | Execute SP, no result set |
| \`ExecuteStoredProcedureScalarAsync(name, params, settings)\` | Execute SP, returns scalar |
| \`ExecuteNonQueryAsync(IDatabaseQuery query)\` | Execute query, no output |
| \`ExecuteScalarAsync<T>(IDatabaseQuery query)\` | Execute query, scalar result |

---

## Key Rule
Always use \`ConfigureAwait(false)\` when awaiting requests in extension code:
\`\`\`csharp
var response = await context.ExecuteAsync<MyResponse>(request).ConfigureAwait(false);
\`\`\`
`.trim(),
    codeBlocks: [
      `public class AsyncSampleRequestHandler : SingleAsyncRequestHandler<AsyncSampleRequest, AsyncSampleResponse>
{
    protected override async Task<AsyncSampleResponse> Process(AsyncSampleRequest request)
    {
        var req = new GetCustomersServiceRequest(QueryResultSettings.SingleRecord, "2001", SearchLocation.Local);
        var resp = await request.RequestContext.ExecuteAsync<GetCustomersServiceResponse>(req).ConfigureAwait(false);
        return new AsyncSampleResponse(resp.Customers.SingleOrDefault());
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-channel-db",
    title: "Channel Database Extensions — EXT Schema, New Tables, CDX Sync",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/channel-db-extensions",
    category: "extensibility",
    tags: [
      "channel-database", "channel-db", "ext-schema", "EXT",
      "cdx", "sql", "tables", "views", "stored-procedures",
      "REPLICATIONCOUNTERFROMORIGIN", "ROWVERSION", "DATAAREAID",
      "DataSyncUsersRole", "UsersRole", "DeployExtensibilityRole",
      "idempotent", "backward-compatible", "T-SQL", "Azure-SQL",
      "CRT.RETAILUPGRADEHISTORY", "deployable-package",
      "attributes", "order-attributes", "customer-attributes",
    ],
    summary:
      "Channel DB extensions must use the EXT schema exclusively — never modify CRT, AX, or DBO schemas. New tables require REPLICATIONCOUNTERFROMORIGIN (for CDX pull to HQ), ROWVERSION, DATAAREAID. Grant permissions to DataSyncUsersRole, UsersRole, DeployExtensibilityRole. Scripts are executed alphabetically once per DB (tracked in CRT.RETAILUPGRADEHISTORY). Must be idempotent and backward-compatible.",
    content: `
## Channel Database Extensions

The channel DB holds transactional and master data from commerce channels. Data flows:
- **HQ → Channel DB**: CDX push (master data)
- **Channel DB → HQ**: CDX pull (transactional data)

---

## Golden Rule: Use EXT Schema Only

**NEVER modify CRT, AX, or DBO schemas.** All extension artifacts go in the **EXT schema**.
- Modifying CRT/AX/DBO schemas → deployment in LCS **fails**
- Extensions can't read CRT/AX/DBO schema definitions
- To increase field length: create an extensibility request in LCS (can't do it via extension scripts)

---

## Best Practices

- Access data through **CRT data services** (not direct DB queries) — keeps backward compatibility
- Use **views** to read EXT records (not table reads)
- Use **stored procedures** for insert/update/delete in EXT schema
- Don't access \`dbo.\` objects (DBO not available in CSU deployments)
- Don't use CRT/AX/DBO data types in EXT schema — create custom types in EXT

---

## Creating a New Extension Table

\`\`\`sql
-- Create table in EXT schema
IF (SELECT OBJECT_ID('[ext].[CONTOSORETAILSTOREHOURSTABLE]')) IS NULL
BEGIN
CREATE TABLE [ext].[CONTOSORETAILSTOREHOURSTABLE](
    [RECID]                       [bigint]        NOT NULL,
    [DAY]                         [int]           NOT NULL DEFAULT ((0)),
    [OPENTIME]                    [int]           NOT NULL DEFAULT ((0)),
    [CLOSINGTIME]                 [int]           NOT NULL DEFAULT ((0)),
    [RETAILSTORETABLE]            [bigint]        NOT NULL DEFAULT ((0)),
    [REPLICATIONCOUNTERFROMORIGIN][int] IDENTITY(1,1) NOT NULL,  -- required for CDX pull to HQ
    [ROWVERSION]                  [timestamp]     NOT NULL,       -- required for CDX pull
    [DATAAREAID]                  [nvarchar](4)   NOT NULL,       -- required for per-company data
    CONSTRAINT [I_CONTOSORETAILSTOREHOURSTABLE_RECID] PRIMARY KEY CLUSTERED ([RECID] ASC)
) ON [PRIMARY]
END
GO

-- Grant permissions for CDX sync
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::[ext].[CONTOSORETAILSTOREHOURSTABLE] TO [DataSyncUsersRole]
GO
-- Grant permissions for app access
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::[ext].[CONTOSORETAILSTOREHOURSTABLE] TO [UsersRole]
GO
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::[ext].[CONTOSORETAILSTOREHOURSTABLE] TO [DeployExtensibilityRole]
GO
\`\`\`

**Notes on REPLICATIONCOUNTERFROMORIGIN:**
- Required if data is pulled FROM channel DB TO HQ (CDX pull job)
- NOT required if data is only pushed from HQ to channel DB
- Cannot be the only unique field
- Create an index on it for performance

---

## Extending an Existing Table (Extension Table Pattern)

Create a new EXT table with the same primary key as the CRT table:

\`\`\`sql
CREATE TABLE [ext].[RETAILTRANSACTIONTABLE](
    [TRANSACTIONID] [nvarchar](44) NOT NULL,  -- FK to [crt].RETAILTRANSACTIONTABLE
    [ISB2BSALES]    [int]          NOT NULL DEFAULT (0),
    [EXTERNALID]    [nvarchar](20) NOT NULL DEFAULT (''),
    CONSTRAINT [EXT_RETAILTRANSACTIONTABLE_PK] PRIMARY KEY CLUSTERED ([TRANSACTIONID])
)
GO
GRANT SELECT, INSERT, UPDATE, DELETE ON [ext].[RETAILTRANSACTIONTABLE] TO [DataSyncUsersRole]
GO
\`\`\`

---

## Creating Views and Stored Procedures in EXT

\`\`\`sql
-- View in EXT schema (can reference AX schema for reads only via JOIN — not recommended for new code)
CREATE VIEW [ext].[CONTOSORETAILSTOREHOURSVIEW] AS
(
    SELECT sdht.DAY, sdht.OPENTIME, sdht.CLOSINGTIME, sdht.RECID, rst.STORENUMBER
    FROM [ext].[CONTOSORETAILSTOREHOURSTABLE] sdht
    INNER JOIN [ax].RETAILSTORETABLE rst ON rst.RECID = sdht.RETAILSTORETABLE
)

-- Stored procedure permissions
GRANT EXECUTE ON [ext].[EXTSTOREDPROCEDURE] TO [UsersRole];
GRANT EXECUTE ON [ext].[EXTSTOREDPROCEDURE] TO [DeployExtensibilityRole];
\`\`\`

---

## Extension Script Rules

Scripts are in the deployable package as \`.sql\` files:
1. Executed in **alphabetical order** per filename → use date prefix: \`20180501_CustomerDetails.sql\`
2. Tracked in \`CRT.RETAILUPGRADEHISTORY\` → run **only once** per channel DB
3. Must be **idempotent** (safe to re-run if first run fails)
4. **Never remove or alter** published scripts — add new scripts instead
5. Must be **backward compatible** (channel DB updated first, before CSU/POS)
6. Azure SQL compatible (no SQL Server-only features)
7. Deployment timeout: **30 minutes** — split long scripts

### Naming Convention
\`\`\`
20180501_CustomerDetails.sql      ← first
20181102_CustomerDetailsIndex.sql ← second (depends on first)
\`\`\`

---

## Attributes (Configuration-Driven, No DB Changes)

For customer and order extension fields, prefer **attributes** over extension tables:
- **Customer attributes**: configure in Commerce → POS/HQ show new fields automatically
- **Order attributes**: works for cash-and-carry, customer orders, call center orders — no DB schema changes needed
`.trim(),
    codeBlocks: [
      `CREATE TABLE [ext].[CONTOSORETAILSTOREHOURSTABLE](
    [RECID]                       [bigint]        NOT NULL,
    [REPLICATIONCOUNTERFROMORIGIN][int] IDENTITY(1,1) NOT NULL,
    [ROWVERSION]                  [timestamp]     NOT NULL,
    [DATAAREAID]                  [nvarchar](4)   NOT NULL,
    CONSTRAINT [I_..._RECID] PRIMARY KEY CLUSTERED ([RECID] ASC)
)
GRANT SELECT, INSERT, UPDATE, DELETE ON [ext].[CONTOSORETAILSTOREHOURSTABLE] TO [DataSyncUsersRole]`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-cdx-realtime",
    title: "Extend CDX Real-time Service — Call HQ Logic from CRT via RetailTransactionServiceEx",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extend-commerce-data-exchange",
    category: "extensibility",
    tags: [
      "cdx", "real-time-service", "RetailTransactionServiceEx", "ExtensionOf",
      "InvokeExtensionMethodRealtimeRequest", "InvokeExtensionMethodRealtimeResponse",
      "X++", "d365fo", "finance-operations", "HQ",
      "container", "static", "public",
      "GetConnectionStatusClientRequest", "IsMasterDatabaseConnectionString",
      "offline", "connectivity", "CDX-offline",
    ],
    summary:
      "CDX Real-time Service lets CRT make synchronous calls to Finance & Operations (HQ) logic at runtime. Extend by adding a public static method returning container[bool, string, ...] to the RetailTransactionServiceEx class in X++ (D365FO). Call from CRT using InvokeExtensionMethodRealtimeRequest. Check connectivity before calling — fails when offline. Parameters must be primitive types only.",
    content: `
## Extend CDX Real-time Service

CDX Real-time Service enables CRT to call Finance & Operations (HQ) logic **synchronously** at runtime.
Use when you need to access HQ database tables or classes that cannot be accessed via channel DB.

---

## Create HQ Extension Method (X++ in D365FO)

### Rules for the extension method
- Must be **public static** method
- Return type: **container** with length ≥ 2
  - First element: **boolean** (success flag)
  - Second element: **string** (comment/error message)
  - Additional elements: any primitive type or nested containers
- Parameters: **only primitive types** — boolean, date, int, int64, str, guid, Real

### Steps

1. In D365FO, create a new model
2. Create a new class that extends \`RetailTransactionServiceEx\`
3. Add \`[ExtensionOf(classStr(RetailTransactionServiceEx))]\` attribute

\`\`\`xpp
[ExtensionOf(classStr(RetailTransactionServiceEx))]
final class ContosoRetailTransactionServiceSample_Extension
{
    public static container SerialCheck(str _serialNum)
    {
        boolean success = false;
        str errorMessage;
        int fromLine;

        try
        {
            if (_serialNum)
            {
                ttsbegin;
                // check serial number in HQ tables
                success = true;
                errorMessage = "Serial number found";
                ttscommit;
            }
            else
            {
                success = false;
                errorMessage = "Serial number not found";
            }
        }
        catch (Exception::Error)
        {
            ttsAbort;
            errorMessage = RetailTransactionServiceUtilities::getInfologMessages(fromLine);
        }

        // Always sanitize error codes
        errorMessage = RetailTransactionServiceUtilities::getErrorCode(errorMessage);

        return [success, errorMessage, "Custom values"];
    }
}
\`\`\`

4. Build and deploy the X++ project

---

## Call from CRT Extension

1. Add NuGet package: **Microsoft.Dynamics.Commerce.Runtime.RealtimeServices.Messages**
2. Use \`InvokeExtensionMethodRealtimeRequest\`:

\`\`\`csharp
InvokeExtensionMethodRealtimeRequest extensionRequest =
    new InvokeExtensionMethodRealtimeRequest("SerialCheck", "123");

InvokeExtensionMethodRealtimeResponse response =
    await request.RequestContext.ExecuteAsync<InvokeExtensionMethodRealtimeResponse>(extensionRequest)
        .ConfigureAwait(false);

ReadOnlyCollection<object> results = response.Result;
string resValue = (string)results[0];   // the "Custom values" return
\`\`\`

Constructor signature:
\`\`\`csharp
new InvokeExtensionMethodRealtimeRequest(string methodName, params object[] parameters)
\`\`\`

The CRT framework automatically checks the first two container elements (bool success, string errorMessage) and throws if \`success == false\`.

---

## Handling Offline Scenarios

Real-time Service **requires connectivity to HQ**. When offline, the call fails.

### Check connection status before calling

**From CRT:**
\`\`\`csharp
if (request.RequestContext.Runtime.Configuration.IsMasterDatabaseConnectionString)
{
    // online — safe to call CDX real-time service
}
\`\`\`

**From POS:**
Use \`GetConnectionStatusClientRequest\` POS API.

### Best Practice
- Always check connectivity before calling CDX Real-time Service
- Have fallback logic for offline scenarios (e.g., queue operation locally)
- Show clear error message to operator if CDX call fails when offline
`.trim(),
    codeBlocks: [
      `[ExtensionOf(classStr(RetailTransactionServiceEx))]
final class ContosoRetailTransactionServiceSample_Extension
{
    public static container SerialCheck(str _serialNum)
    {
        return [true, "Serial number found", "Custom values"];
    }
}`,
      `var req = new InvokeExtensionMethodRealtimeRequest("SerialCheck", "123");
var resp = await context.ExecuteAsync<InvokeExtensionMethodRealtimeResponse>(req).ConfigureAwait(false);
string result = (string)resp.Result[0];`,
      `if (request.RequestContext.Runtime.Configuration.IsMasterDatabaseConnectionString)
{
    // online — can call CDX real-time service
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Pages 26-32: Extend Existing Functionality ──────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility-trigger
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extended-columns
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cdx-extensibility
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/retail-sdk-samples
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/customer-attributes
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/order-attributes
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/manage-secrets

const EXTEND_EXISTING_ENTRIES: DocEntry[] = [
  {
    id: "ext-crt-triggers",
    title: "CRT Triggers — Pre and Post Trigger Extension Points for Every CRT Request",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility-trigger",
    category: "extensibility",
    tags: [
      "crt", "triggers", "IRequestTriggerAsync", "OnExecuting", "OnExecuted",
      "SupportedRequestTypes", "pre-trigger", "post-trigger",
      "GetCustomerDataRequest", "SaveCartRequest",
      "CommerceRuntime.Ext.config", "CommerceRuntime.MPOSOffline.ext.config",
      "extension", "w3wp", "dllhost", "performance", "cache",
    ],
    summary:
      "CRT triggers let you add business logic before (OnExecuting) or after (OnExecuted) any CRT request without overriding the handler. Implement IRequestTriggerAsync and declare SupportedRequestTypes. Performance warning: triggers on high-volume APIs (AddCartLines, GetByIds) that read from channel DB must enable cache to avoid CSU resource exhaustion. Register in commerceRuntime.ext.config.",
    content: `
## CRT Triggers (Pre and Post)

CRT triggers provide extension points **before** and **after** every CRT request, without needing to override the handler.

### Two trigger methods

| Method | When called |
|---|---|
| \`OnExecuting\` | **Before** the request is processed by the IRequestHandler |
| \`OnExecuted\` | **After** the request is processed by the IRequestHandler |

### Important performance warning
If you extend a CRT request used by a **high-volume API** (e.g., Carts/AddCartLines or Products/GetByIds) and your trigger reads from the channel database, **enable caching** for the DB read. Otherwise, the extension consumes too many Retail Server and channel database resources and can cause overall CSU performance issues.

---

## Implement a CRT Trigger

1. Implement **IRequestTriggerAsync**
2. Specify **SupportedRequestTypes** — the request types this trigger fires for
3. Add pre-trigger logic in **OnExecuting** (if needed)
4. Add post-trigger logic in **OnExecuted** (if needed)

\`\`\`csharp
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.DataServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class GetCustomerTriggers : IRequestTriggerAsync
{
    public IEnumerable<Type> SupportedRequestTypes
    {
        get { return new[] { typeof(GetCustomerDataRequest) }; }
    }

    public async Task OnExecuted(Request request, Response response)
    {
        // Post-trigger: custom logic after the customer is retrieved
        await Task.CompletedTask;
    }

    public async Task OnExecuting(Request request)
    {
        // Pre-trigger: custom logic before the customer is retrieved
        await Task.CompletedTask;
    }
}
\`\`\`

---

## Register the Trigger

### Online (RS connected)
Copy DLL to \`..\\RetailServer\\webroot\\bin\\ext\`
Update \`commerceRuntime.ext.config\`:
\`\`\`xml
<add source="assembly" value="Contoso.Commerce.Runtime.Services" />
\`\`\`

### Offline (MPOS)
Copy DLL to \`...\\Microsoft Dynamics 365\\70\\Retail Modern POS\\ClientBroker\\ext\`
Update \`CommerceRuntime.MPOSOffline.ext.config\`:
\`\`\`xml
<add source="assembly" value="Contoso.Commerce.Runtime.Services" />
\`\`\`

---

## Debugging

- **Online**: attach VS to **w3wp.exe** (IIS process for Retail Server)
- **Offline**: attach VS to **dllhost.exe**

---

## Triggers vs. Handler Override

| Use Triggers | Use Handler Override |
|---|---|
| Need to add logic before/after without changing the core handler | Need to change what the handler returns |
| Multiple extensions for the same request | Need to call \`ExecuteNextAsync\` to chain to base |
| Non-invasive logging, validation, enrichment | Full replacement or conditional replacement |
`.trim(),
    codeBlocks: [
      `public class GetCustomerTriggers : IRequestTriggerAsync
{
    public IEnumerable<Type> SupportedRequestTypes => new[] { typeof(GetCustomerDataRequest) };

    public async Task OnExecuted(Request request, Response response)
    {
        // post-trigger logic
        await Task.CompletedTask;
    }

    public async Task OnExecuting(Request request)
    {
        // pre-trigger logic
        await Task.CompletedTask;
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-extended-columns",
    title: "Pre-Extended Columns in the Channel Database — Field Length Overrides and Validation",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extended-columns",
    category: "extensibility",
    tags: [
      "extended-columns", "pre-extended", "channel-database", "field-length",
      "INVENTSERIALID", "STREET", "nvarchar", "ValidateAddressLengthServiceRequest",
      "ValidateAddressLength", "GetSerialNumberRequestHandler",
      "DataValidationFailure", "DataValidationException",
      "P-job", "EDT", "extended-data-type", "LCS", "extensibility-request",
      "CRT-override", "POS-UI-extension",
    ],
    summary:
      "Some channel DB columns are pre-extended (longer than HQ). You cannot extend column lengths yourself — file an LCS extensibility request. To use the extra length: (1) extend the HQ EDT, (2) override the CRT validation handler (e.g., ValidateAddressLengthServiceRequest), (3) extend the POS UI. Not extending HQ/CRT causes truncation on P-job or validation rejection. Key pre-extended fields: INVENTSERIALID 50, STREET 400, ADDRESS 500.",
    content: `
## Pre-Extended Columns in the Channel Database

Some channel DB columns have a **longer length than headquarters** to support extension scenarios:
- **INVENTSERIALID**: 20 chars in HQ → **50 chars** in channel DB
- **STREET**: standard → **400 chars** in channel DB
- **ADDRESS (LOGISTICSPOSTALADDRESS)**: standard → **500 chars** in channel DB

### If You Need to Use the Extra Length

You must extend in **all three places**; otherwise data is truncated or validation rejects the extra characters:

1. **Extend the HQ EDT** — use Extended Data Type (EDT) extension model in AOT
2. **Override the CRT validation handler** — e.g., \`ValidateAddressLengthServiceRequest\` or \`GetSerialNumberRequestHandler\`
3. **Extend the POS UI** — if the field has a POS input (read-only fields don't need this)

### If a Field Is Not Pre-Extended

File an **extensibility request in LCS** to request that Microsoft pre-extends the column. You cannot do it yourself.

---

## Override ValidateAddressLengthServiceRequest

\`\`\`csharp
public class ValidateAddressLengthServiceRequestExt : IRequestHandler
{
    private static int maxDefaultFullAddressColumnLength = 250;
    private static int maxDefaultStreetColumnLength = 250;
    private static int maxDefaultCountyColumnLength = 10;

    public IEnumerable<Type> SupportedRequestTypes =>
        new[] { typeof(ValidateAddressLengthServiceRequest) };

    public Response Execute(Request request)
    {
        var req = (ValidateAddressLengthServiceRequest)request;
        var validationFailures = new List<DataValidationFailure>();

        if (!string.IsNullOrEmpty(req?.Address?.FullAddress)
            && req.Address.FullAddress.Length > maxDefaultFullAddressColumnLength)
        {
            validationFailures.Add(new DataValidationFailure(
                DataValidationErrors.Microsoft_Dynamics_Commerce_Runtime_AddressLengthExceeded,
                $"The full address exceeds {maxDefaultFullAddressColumnLength} characters.")
            { LocalizedMessageParameters = new object[] { maxDefaultFullAddressColumnLength } });
        }

        if (!string.IsNullOrEmpty(req?.Address?.Street)
            && req.Address.Street.Length > maxDefaultStreetColumnLength)
        {
            validationFailures.Add(new DataValidationFailure(
                DataValidationErrors.Microsoft_Dynamics_Commerce_Runtime_StreetLengthExceeded,
                $"The street exceeds {maxDefaultStreetColumnLength} characters.")
            { LocalizedMessageParameters = new object[] { maxDefaultStreetColumnLength } });
        }

        if (validationFailures.Count > 0)
            throw new DataValidationException(
                DataValidationErrors.Microsoft_Dynamics_Commerce_Runtime_AggregateValidationError,
                validationFailures, "An error occurred when validating the address.");

        return new NullResponse();
    }
}
\`\`\`

---

## Key Pre-Extended Columns (Partial List)

| Table | Column | Channel DB Length | CRT Handler to Override | POS Handler |
|---|---|---|---|---|
| INVENTSERIAL | INVENTSERIALID | nvarchar(50) | — | GetSerialNumberRequestHandler |
| INVENTSERIAL | ITEMID | nvarchar(100) | — | — |
| LOGISTICSPOSTALADDRESS | ADDRESS | nvarchar(500) | ValidateAddressLength | — |
| LOGISTICSPOSTALADDRESS | STREET | nvarchar(400) | ValidateAddressLength | — |
| LOGISTICSPOSTALADDRESS | COUNTY | nvarchar(60) | ValidateAddressLength | — |
| LOGISTICSPOSTALADDRESS | STATE | nvarchar(60) | ValidateAddressLength | — |
| LOGISTICSPOSTALADDRESS | ZIPCODE | nvarchar(60) | ValidateAddressLength | — |
| RETAILASYNCCUSTOMER | FIRSTNAME | nvarchar(100) | — | — |
| RETAILASYNCCUSTOMER | LASTNAME | nvarchar(100) | — | — |
| RETAILTRANSACTIONSALESTRANS | INVENTSERIALID | nvarchar(50) | — | — |
| RETAILTRANSACTIONSALESTRANS | ITEMID | nvarchar(100) | — | — |
| INVENTDIM | INVENTSERIALID | nvarchar(50) | — | — |
| INVENTDIM | CONFIGID | nvarchar(60) | — | — |
| ECORESPRODUCTTRANSLATION | NAME | nvarchar(500) | — | — |
| ECORESPRODUCTTRANSLATION | DESCRIPTION | nvarchar(4000) | — | — |
| DIRPARTYTABLE | NAME | nvarchar(300) | — | — |
| RETAILTRANSACTIONTABLE | CUSTOMERNAME | nvarchar(300) | — | — |
| LOGISTICSELECTRONICADDRESS | COUNTRYREGIONCODE | nvarchar(10) | ValidateElectronicAddressServiceRequest | — |

---

## Key Rules

- **Read-only POS fields** (e.g., ECORES product fields) — POS UI extension NOT required, only HQ EDT + CRT
- Failing to extend HQ → **P-job truncation or failure**
- Failing to extend CRT → **validation rejects input at runtime**
- Cannot change column lengths yourself — must use LCS extensibility request
`.trim(),
    codeBlocks: [
      `public class ValidateAddressLengthServiceRequestExt : IRequestHandler
{
    public IEnumerable<Type> SupportedRequestTypes =>
        new[] { typeof(ValidateAddressLengthServiceRequest) };

    public Response Execute(Request request)
    {
        var req = (ValidateAddressLengthServiceRequest)request;
        // validate custom length limits and throw DataValidationException if exceeded
        return new NullResponse();
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-cdx-extensibility",
    title: "CDX Extensibility — Custom Push/Pull Jobs via RetailCDXSeedDataBase Extension",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cdx-extensibility",
    category: "extensibility",
    tags: [
      "cdx", "commerce-data-exchange", "RetailCDXSeedDataBase", "registerCDXSeedDataExtension",
      "RetailCDXSeedDataAX7", "XML-resource", "subjob", "scheduler-job",
      "IsUpload", "OverrideTarget", "TargetTableSchema", "ChannelDBSchema",
      "REPLICATIONCOUNTERFROMORIGIN", "P-0001", "P-1000",
      "Initialize-commerce-scheduler", "push-job", "pull-job",
      "AxFields", "ScheduledByJob", "TargetTableName",
      "10.0.46",
    ],
    summary:
      "Extend CDX by creating an XML resource file with custom job/subjob definitions, then subscribing to the RetailCDXSeedDataBase.registerCDXSeedDataExtension delegate in X++. Supports push (HQ→channel), pull (channel→HQ, requires REPLICATIONCOUNTERFROMORIGIN), and adding unmapped columns to existing subjobs. Always guard with `if (originalCDXSeedDataResource == resourceStr(RetailCDXSeedDataAX7))`. Run Initialize commerce scheduler after.",
    content: `
## CDX Extensibility — Custom Push and Pull Jobs

CDX (Commerce Data Exchange) transfers data between HQ and channel databases via scheduler jobs. You can extend CDX to include custom tables and fields.

**Advantage of initialization class approach**: configuration is code-driven — run "Initialize commerce scheduler" once and all environments (dev/test/prod) get the custom jobs automatically.

---

## XML Resource File Structure

\`\`\`xml
<RetailCdxSeedData ChannelDBMajorVersion="7" ChannelDBSchema="ext" Name="AX7">
    <Jobs>
        <Job DescriptionLabelId="REX4520710" Description="Custom job" Id="7000"/>
    </Jobs>
    <Subjobs>
        <Subjob Id="ContosoRetailSeatingArrangementData"
                TargetTableSchema="ext"
                AxTableName="ContosoRetailSeatingArrangementData">
            <ScheduledByJobs>
                <ScheduledByJob>7000</ScheduledByJob>
            </ScheduledByJobs>
            <AxFields>
                <Field Name="seatNumber"/>
                <Field Name="capacity"/>
                <Field Name="channelRecId"/>
                <Field Name="RecId"/>
            </AxFields>
        </Subjob>
    </Subjobs>
</RetailCdxSeedData>
\`\`\`

**Key notes:**
- \`DataAreaId\` must NOT be explicitly in AxFields — CDX adds it automatically (adding it causes initialization error)
- \`TargetTableName\` — only needed if channel table name differs from the AX table name
- \`ToName\` attribute on \`<Field>\` — only needed if channel field name differs from the AX field name

---

## Subscribe to the registerCDXSeedDataExtension Event (X++)

\`\`\`xpp
class ContosoRetailCDXSeedDataAX7EventHandler
{
    [SubscribesTo(classStr(RetailCDXSeedDataBase),
        delegateStr(RetailCDXSeedDataBase, registerCDXSeedDataExtension))]
    public static void RetailCDXSeedDataBase_registerCDXSeedDataExtension(
        str originalCDXSeedDataResource, List resources)
    {
        // IMPORTANT: always guard with this condition
        if (originalCDXSeedDataResource == resourceStr(RetailCDXSeedDataAX7))
        {
            resources.addEnd(resourceStr(RetailCDXSeedDataAX7_ContosoRetailExtension));
        }
    }
}
\`\`\`

**Why the guard is mandatory**: Without \`if (originalCDXSeedDataResource == resourceStr(RetailCDXSeedDataAX7))\`, your extension also applies to N-1 CDX seed data and causes unintended results.

---

## Pull Data from Channel to HQ (Upload Job)

For pull (channel → HQ), set \`IsUpload="true"\` and include \`REPLICATIONCOUNTERFROMORIGIN\` field:

\`\`\`xml
<Subjob Id="ContosoRetailSeatReservationTrans"
        TargetTableSchema="ext"
        IsUpload="true"
        ReplicationCounterFieldName="ReplicationCounterFromOrigin"
        AxTableName="ContosoRetailSeatReservationTrans">
    <ScheduledByJobs>
        <ScheduledByJob>P-1000</ScheduledByJob>
    </ScheduledByJobs>
    <AxFields>
        <Field Name="transactionId"/>
        <Field Name="storeId"/>
        <Field Name="replicationCounterFromOrigin"/>
    </AxFields>
</Subjob>
\`\`\`

---

## Add Unmapped Columns to Existing Table (Push)

\`\`\`xml
<Subjob Id="RetailChannelTable" TargetTableSchema="ext">
    <AxFields>
        <Field Name="Payment"/>
        <Field Name="PaymMode"/>
        <Field Name="ContosoRetailWallPostMessage"/>
    </AxFields>
</Subjob>
\`\`\`

---

## Pull Extension Columns Back to HQ (OverrideTarget=false)

\`\`\`xml
<Subjob Id="RetailTransactionTable"
        TargetTableName="CONTOSORETAILTRANSACTIONTABLE"
        TargetTableSchema="ext"
        OverrideTarget="false">
    <AxFields>
        <Field Name="ContosoRetailSeatNumber"/>
        <Field Name="ContosoRetailServerStaffId"/>
    </AxFields>
</Subjob>
\`\`\`

- \`OverrideTarget="false"\` = CDX uses TargetTableName as an **extension table**, uploads alongside the primary table
- \`OverrideTarget="true"\` = CDX **replaces** the primary table with TargetTableName (only extension fields in the pull)

---

## Run After Configuration

**Retail and Commerce → Headquarters setup → Commerce scheduler → Initialize commerce scheduler**
Check "Delete existing configuration" if reinitializing.

---

## Validate

Go to **Commerce scheduler → Scheduler subjobs** → find your subjob → check **Channel field mapping** section for the new extension columns.

---

## Important: 10.0.46+ Generated Extension SQL Scripts
Commerce 10.0.46 introduced **Generated extension SQL scripts** that simplify adding channel DB extensions. Helps avoid common CDX performance and synchronization errors.
`.trim(),
    codeBlocks: [
      `[SubscribesTo(classStr(RetailCDXSeedDataBase), delegateStr(RetailCDXSeedDataBase, registerCDXSeedDataExtension))]
public static void RetailCDXSeedDataBase_registerCDXSeedDataExtension(str originalCDXSeedDataResource, List resources)
{
    if (originalCDXSeedDataResource == resourceStr(RetailCDXSeedDataAX7))
    {
        resources.addEnd(resourceStr(RetailCDXSeedDataAX7_ContosoRetailExtension));
    }
}`,
      `<Subjob Id="RetailTransactionTable" TargetTableName="CONTOSORETAILTRANSACTIONTABLE"
        TargetTableSchema="ext" OverrideTarget="false">
    <AxFields>
        <Field Name="ContosoRetailSeatNumber"/>
        <Field Name="ContosoRetailServerStaffId"/>
    </AxFields>
</Subjob>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-receipt-extension",
    title: "Extend Store Receipts — Custom Fields and Custom Receipt Types in CRT",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/retail-sdk-samples",
    category: "extensibility",
    tags: [
      "receipt", "custom-fields", "custom-receipt-type", "GetSalesTransactionCustomReceiptFieldServiceRequest",
      "GetCustomReceiptsRequest", "GetReceiptResponse", "ReceiptType",
      "CustomReceipt1", "GetCustomReceiptFieldServiceResponse",
      "Language-text", "Custom-fields-HQ", "Receipt-format-designer",
      "1070", "WARRANTYID", "EXPIRATIONDATE",
      "PrintCustomReceipt", "pos-trigger-printing", "extension-properties",
    ],
    summary:
      "Two receipt extension patterns: (1) Custom fields — configure Language text ID and Custom field in HQ, drag into receipt designer, implement GetSalesTransactionCustomReceiptFieldServiceRequest in CRT to return the value by field name. (2) Custom receipt types — create format with CustomReceiptType(1-20) in HQ, implement GetCustomReceiptsRequest in CRT. Best practice: use extension properties set in triggers/overrides instead of per-field DB calls.",
    content: `
## Extend Store Receipts

Two ways to extend receipts:
- **Custom fields** — add new data columns to existing receipt formats
- **Custom receipt types** — new receipt document types for custom scenarios

---

## Custom Fields

### Step 1: Configure in HQ

**Language text**: Retail and Commerce → Channel setup → POS setup → POS profiles → Language text → POS tab

| Language ID | Text ID | Text |
|---|---|---|
| en-US | 1 | WARRANTYID |
| en-UK | 1 | WARRANTYID |

**Custom fields**: Retail and Commerce → Channel setup → POS setup → POS profiles → Custom fields

| Name | Type | Caption text ID |
|---|---|---|
| WARRANTYID | Receipt | 1 |
| EXPIRATIONDATE | Receipt | 2 |

**Receipt format designer**: Drag the "Custom" field into the receipt layout.

Run **Channel configuration (1070)** distribution job.

### Step 2: Implement CRT Handler

\`\`\`csharp
public class ReceiptFieldService : IRequestHandler
{
    public IEnumerable<Type> SupportedRequestTypes =>
        new[] { typeof(GetSalesTransactionCustomReceiptFieldServiceRequest) };

    public Response Execute(Request request)
    {
        if (request is GetSalesTransactionCustomReceiptFieldServiceRequest r)
            return GetCustomReceiptFieldForSalesTransactionReceipts(r);
        throw new NotSupportedException($"Request '{request.GetType()}' is not supported.");
    }

    private GetCustomReceiptFieldServiceResponse GetCustomReceiptFieldForSalesTransactionReceipts(
        GetSalesTransactionCustomReceiptFieldServiceRequest request)
    {
        string receiptFieldName = request.CustomReceiptField;
        string returnValue = null;
        switch (receiptFieldName)
        {
            case "WARRANTYID":
                // retrieve warranty ID from extension property or DB
                returnValue = "W-12345";
                break;
            case "EXPIRATIONDATE":
                // retrieve expiration date
                returnValue = DateTime.Now.AddYears(1).ToShortDateString();
                break;
        }
        return new GetCustomReceiptFieldServiceResponse(returnValue);
    }
}
\`\`\`

**Best practice:** Avoid DB calls for each field. Instead:
- Set extension properties on entities in triggers or handler overrides (e.g., in post-trigger for GetSalesOrderDataRequest)
- Read those extension properties in the receipt handler (no additional DB calls per field)

---

## Custom Receipt Types

### Step 1: Configure in HQ

1. Retail and Commerce → Channel setup → POS setup → POS → Receipt formats
2. Create new format, set **Receipt type** = **CustomReceiptType1** (through CustomReceipt20)
3. Design layout in designer, run **Channel configuration (1070)**

### Step 2: Implement CRT Handler

\`\`\`csharp
protected override GetReceiptResponse Process(GetCustomReceiptsRequest request)
{
    var result = new Collection<Receipt>();
    switch (request.ReceiptRetrievalCriteria.ReceiptType)
    {
        case ReceiptType.CustomReceipt1:
            result.AddRange(this.GetCustomReceipts(salesOrder, request.ReceiptRetrievalCriteria));
            break;
        default:
            break;
    }
    return new GetReceiptResponse(new ReadOnlyCollection<Receipt>(result));
}
\`\`\`

**Note:** Call printing of custom receipt type from POS client. See \`pos-trigger-printing\` documentation for triggering print from POS.

---

## Sample Location in Retail SDK

- Custom fields sample: \`RetailSDK\\SampleExtensions\\CommerceRuntime\\Extensions.ReceiptsSample\`
- Transactions attributes sample: \`RetailSDK\\SampleExtensions\\CommerceRuntime\\Extensions.TransactionAttributesSample\`
`.trim(),
    codeBlocks: [
      `public class ReceiptFieldService : IRequestHandler
{
    public IEnumerable<Type> SupportedRequestTypes =>
        new[] { typeof(GetSalesTransactionCustomReceiptFieldServiceRequest) };

    public Response Execute(Request request)
    {
        var r = (GetSalesTransactionCustomReceiptFieldServiceRequest)request;
        string value = r.CustomReceiptField switch
        {
            "WARRANTYID"     => GetWarrantyId(r),
            "EXPIRATIONDATE" => GetExpirationDate(r),
            _                => null,
        };
        return new GetCustomReceiptFieldServiceResponse(value);
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-customer-attributes",
    title: "Customer Attributes — Configuration-Driven Custom Fields on Customer Master",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/customer-attributes",
    category: "extensibility",
    tags: [
      "customer-attributes", "attribute-framework", "attribute-type", "attribute-group",
      "Commerce-parameters", "Customer-add-edit", "Customer-details",
      "POS", "HQ", "no-code", "no-extension-table",
      "CDX", "1010", "1110", "1090",
      "screen-layout-designer", "Customer-card",
      "CustomerAttribute", "AttributeValueBase",
      "datetime-not-supported", "extension-properties",
    ],
    summary:
      "Customer attributes let you add custom fields to the customer master via HQ configuration — no code, no extension tables. Steps: define Attribute Type → define Attribute → define Attribute Group → link to Commerce parameters (Customer attribute group) → run CDX jobs 1010 (Customers) + 1110 (Global config). Fields appear automatically in POS Customer add/edit and Customer details. Limitation: datetime and reference types not supported — use extension properties for those.",
    content: `
## Customer Attributes — Configuration-Only Custom Fields

Add new fields to the customer master **without writing code** or creating extension tables.

### What the attribute framework supports
- **Text**, **Integer**, **Decimal**, **Boolean** attribute types
- Fixed list (dropdown) or value range for validation
- Multilingual translations
- Appears in POS: Customer add/edit screen and Customer details screen
- Appears in HQ: All customers → Retail attributes

### Limitation
- **datetime** and **reference** types NOT supported in this version
- For those, use **extension properties** and custom controls

---

## Setup in HQ

### 1. Define Attribute Types
Product information management → Setup → Categories and attributes → **Attribute types**
- Set data type: Text, Integer, Decimal, Boolean
- Optional: Fixed list (for Text), Value range

### 2. Define Attributes
Product information management → Setup → Categories and attributes → **Attributes**
- Set name, friendly name, description, help text
- Assign Attribute type
- Set default value

### 3. Define Attribute Group
Product information management → Setup → Categories and attributes → **Attribute groups**
- Add attributes to the group, set per-attribute defaults

### 4. Link to Commerce Parameters
Retail and Commerce → Headquarters setup → Parameters → **Commerce parameters**
→ General tab → **Customer attribute group** → select the group

### 5. Run Distribution Jobs
\`\`\`
Distribution schedule → Customers (1010) → Run now
Distribution schedule → Global configuration (1110) → Run now
\`\`\`

---

## View in HQ
Retail and Commerce → Customers → All customers → Action Pane → Retail and Commerce → **Retail attributes**

## View in POS
POS → Customer add/edit screen or Customer details screen — the configured attributes appear automatically.

---

## Show on POS Transaction Screen (Customer Card)
1. Screen layouts → open layout → Layout designer
2. Drag **Customer** card to transaction screen
3. Right-click Customer card → **Customize**
4. Move desired attributes from Available to Selected columns
5. Save → close designer

Note: Customer attributes are **legal-entity specific** — screen layout designer shows attributes for the legal entity of the signed-in user.

Run **Registers (1090)** job to push screen layout to POS.

---

## Read Customer Attributes Programmatically (CRT)

Customer attributes are part of the \`Customer\` entity's \`Attributes\` collection:
\`\`\`csharp
// In a CRT trigger or handler
var getCustomerReq = new GetCustomersServiceRequest(
    QueryResultSettings.SingleRecord, customerId, SearchLocation.Local);
var customer = context.Execute<GetCustomersServiceResponse>(getCustomerReq)
    .Customers.SingleOrDefault();

// Read an attribute
var emailOptIn = customer?.Attributes
    .FirstOrDefault(a => a.Name == "EmailOptIn") as AttributeTextValue;
string value = emailOptIn?.TextValue;
\`\`\`
`.trim(),
    codeBlocks: [
      `// Distribution jobs after configuring customer attributes:
// 1. Customers (1010) — syncs customer attribute definitions to channel
// 2. Global configuration (1110) — syncs Commerce parameters including attribute group link
// 3. Registers (1090) — only needed if you updated screen layout to show attributes on transaction screen`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-order-attributes",
    title: "Order Attributes — Custom Fields on Transactions, Customer Orders, and Call Center Orders",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/order-attributes",
    category: "extensibility",
    tags: [
      "order-attributes", "transaction-attributes", "SalesTransaction",
      "AttributeTextValue", "AttributeValueBase", "AttributeValues",
      "SaveAttributesOnCartClientRequest", "GetCurrentCartClientRequest",
      "SuspendCartRequest", "IRequestTrigger",
      "cash-and-carry", "customer-order", "call-center",
      "Header", "Lines", "Apply-attributes-to",
      "Attributes-panel", "8.1.3", "B2BSample",
      "1040", "1070", "1090",
      "no-code", "no-extension-table",
    ],
    summary:
      "Order attributes add custom fields to cash-and-carry transactions, customer orders, and call center orders via HQ configuration — no DB extension tables. In 8.1.3+ POS shows an Attributes panel for viewing/editing. Only String type in first version. Set values in CRT triggers/overrides (business logic) or POS (user input). Check for duplicate attributes before adding — use CreateUpdateTransactionHeaderAttribute pattern. Run CDX jobs 1040 (Products) + 1070 (Channel config).",
    content: `
## Order Attributes — Custom Fields on Orders and Transactions

Add custom fields to cash-and-carry transactions, customer orders, and call center orders **via HQ configuration** — no extension tables, no DB changes.

### Supports
- Cash-and-carry transactions
- Customer orders
- Call center orders

### Limitation
- Only **String** attribute type in first version (future versions add others)
- If you need complex search logic or data from master tables, use **extension properties** instead

---

## Setup in HQ

### 1. Define Attribute Types
Product information management → Setup → Categories and attributes → **Attribute types**
- Set type to **Text** (String)

### 2. Define Attributes
Product information management → Setup → Categories and attributes → **Attributes**
- Assign attribute type, set defaults, add translations

### 3. Define Attribute Groups
Product information management → Setup → Categories and attributes → **Attribute groups**
- Add attributes, set defaults

### 4. Link to Channel
Retail and Commerce → Channels → Stores → All stores → your store
→ Set up tab → **Sales order attributes** → add attribute group

Specify scope in **Apply attributes to** field:
- **Header** — transaction header only
- **Lines** — transaction lines only
- **Default** — both header and lines

### 5. Run Distribution Jobs
\`\`\`
Products (1040) → Run now   (only if new attribute types/groups added)
Channel configuration (1070) → Run now
\`\`\`

---

## Set Attribute Values in CRT

Check for duplicate before adding — if attribute already exists, **update** it (adding duplicate causes runtime error):

\`\`\`csharp
public class CustomSuspendCartTrigger : IRequestTrigger
{
    public IEnumerable<Type> SupportedRequestTypes => new[] { typeof(SuspendCartRequest) };

    public void OnExecuting(Request request)
    {
        var suspendReq = (SuspendCartRequest)request;
        var getCartReq = new GetCartServiceRequest(
            new CartSearchCriteria(suspendReq.CartId), QueryResultSettings.SingleRecord);
        Cart cart = request.RequestContext.Execute<GetCartServiceResponse>(getCartReq).Carts.Single();

        if (cart.CartType == CartType.CustomerOrder)
        {
            bool cartUpdated = CreateUpdateTransactionHeaderAttribute(cart, reserveNow: false, updateAttribute: true);
            if (cartUpdated)
                request.RequestContext.Execute<SaveCartResponse>(new SaveCartRequest(cart));
        }
    }

    public void OnExecuted(Request request, Response response) { }
}

// Safe add-or-update pattern (avoids duplicate attribute runtime error)
public static bool CreateUpdateTransactionHeaderAttribute(Cart cart, bool reserveNow, bool updateAttribute)
{
    var transactionAttributes = cart.AttributeValues;
    string attrName = "Reserve now";
    string attrValue = reserveNow ? "Yes" : "No";

    var existing = transactionAttributes.SingleOrDefault(a => a.Name == attrName);
    if (existing == null)
    {
        transactionAttributes.Add(new AttributeTextValue { Name = attrName, TextValue = attrValue });
        return true;
    }
    else if (updateAttribute && ((AttributeTextValue)existing).TextValue != attrValue)
    {
        ((AttributeTextValue)existing).TextValue = attrValue;
        return true;
    }
    return false;
}
\`\`\`

---

## Set Attribute Values from POS (TypeScript)

Since 8.1.3, use the built-in **Attributes panel** (no code required for UI).
For programmatic setting from POS trigger:

\`\`\`typescript
// In a POS trigger (e.g., PreEndTransactionTrigger)
let attributeValue = new ProxyEntities.AttributeTextValueClass();
attributeValue.Name = "B2BOrder";
attributeValue.TextValue = "Yes";
let attributeValues: ProxyEntities.AttributeValueBase[] = [attributeValue];

let saveAttributesOnCartRequest = new SaveAttributesOnCartClientRequest(attributeValues);
await this.context.runtime.executeAsync(saveAttributesOnCartRequest);
\`\`\`

---

## Show in POS Transaction Screen (8.1.3+)

Screen layouts → Layout designer → Drag **Attributes panel** → adjust size → save
Run **Registers (1090)**.

Users can see header and line attributes in the panel, select the edit icon to update.

---

## Set for Call Center Orders
Customer service → All Sales orders → create order
→ Action Pane → Commerce tab → **Attributes** (header)
→ Lines view → select line → Retail and Commerce → **Attributes** (line level)

---

## Sample Code Location
\`RetailSDK\\SampleExtensions\\CommerceRuntime\\Extensions.TransactionAttributesSample\`
\`RetailSDK\\POS\\Extensions\\B2BSample\`

---

## Important Notes
- Only **configured attributes** (linked to channel via attribute group) appear in HQ UI
- You can set/add attributes in code even if they're not in the attribute group — but they won't appear in HQ UI
`.trim(),
    codeBlocks: [
      `// Safe add-or-update pattern (required — adding duplicate attribute throws runtime error)
var existing = cart.AttributeValues.SingleOrDefault(a => a.Name == "MyAttr");
if (existing == null)
    cart.AttributeValues.Add(new AttributeTextValue { Name = "MyAttr", TextValue = "value" });
else
    ((AttributeTextValue)existing).TextValue = "value";`,
      `// POS TypeScript: set attribute on cart
let attr = new ProxyEntities.AttributeTextValueClass();
attr.Name = "B2BOrder";
attr.TextValue = "Yes";
await this.context.runtime.executeAsync(new SaveAttributesOnCartClientRequest([attr]));`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "ext-manage-secrets",
    title: "Manage Secrets in Commerce Extensions — Azure Key Vault Integration from CRT",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/manage-secrets",
    category: "extensibility",
    tags: [
      "secrets", "key-vault", "azure-key-vault", "credentials",
      "GetUserDefinedSecretStringValueServiceRequest", "GetUserDefinedSecretStringValueServiceResponse",
      "GetUserDefinedSecretCertificateServiceRequest", "GetUserDefinedSecretCertificateServiceResponse",
      "SecretStringValue", "X509Certificate2",
      "Key-Vault-Parameters", "HQ", "secretName",
      "credential-rotation", "offline-support",
      "CSU", "web.config", "thumbprint",
      "cache", "memory", "latency",
    ],
    summary:
      "Extensions cannot deploy certificates or add secrets to web.config in CSU. Use Azure Key Vault. In HQ (Key Vault Parameters page) configure Key Vault connection and secret name. In CRT extension call GetUserDefinedSecretStringValueServiceRequest (pass secretName) for string secrets, or GetUserDefinedSecretCertificateServiceRequest for X509Certificate2. Cache the secret in memory — each call without cache goes HQ→KeyVault (high latency). Credential rotation = just update Key Vault value, no code change.",
    content: `
## Manage Secrets in Commerce Extensions via Azure Key Vault

Extensions **cannot** deploy custom certificates in CSU or add thumbprints/secrets to web.config files.
Instead, use **Azure Key Vault** to store secrets that CRT extensions consume at runtime.

---

## Setup Flow

### Extension Developer
1. Create a test secret in Azure Key Vault
2. Configure HQ to connect to Key Vault: **Head Office → Key Vault Parameters**
3. Specify an **extension key name** for the Key Vault secret in Key Vault Parameters
4. Use \`GetUserDefinedSecretStringValueServiceRequest\` in CRT — pass the secret key name
5. Document the secret name in extension setup docs (use a namespace prefix to avoid conflicts)

### IT Pro / Implementation Partner
1. Apply the extension deployable package to the environment
2. Upload the actual secrets to Azure Key Vault
3. Configure Key Vault connection in **Head Office → Key Vault Parameters**
4. Map the extension secret name to the Key Vault secret

---

## Consume Secret in CRT Extension

### Get a String Secret

\`\`\`csharp
GetUserDefinedSecretStringValueServiceRequest keyVaultRequest =
    new GetUserDefinedSecretStringValueServiceRequest("MyExtension.SecretName");

GetUserDefinedSecretStringValueServiceResponse keyVaultResponse =
    request.RequestContext.Execute<GetUserDefinedSecretStringValueServiceResponse>(keyVaultRequest);

string secretValue = keyVaultResponse.SecretStringValue;
\`\`\`

### Get a Certificate Secret (X.509)

\`\`\`csharp
GetUserDefinedSecretCertificateServiceRequest certRequest =
    new GetUserDefinedSecretCertificateServiceRequest(
        profileId: null,
        secretName: "MyExtension.CertName",
        thumbprint: null,
        expirationInterval: null);

GetUserDefinedSecretCertificateServiceResponse certResponse =
    request.RequestContext.Execute<GetUserDefinedSecretCertificateServiceResponse>(certRequest);

X509Certificate2 certificate = certResponse.Certificate;
\`\`\`

---

## Example: Trigger Using Key Vault Secret

\`\`\`csharp
public class CustomSaveCartTrigger : IRequestTrigger
{
    public IEnumerable<Type> SupportedRequestTypes => new[] { typeof(SaveCartRequest) };

    public void OnExecuting(Request request)
    {
        ThrowIf.Null(request, "request");
        if (request is SaveCartRequest)
        {
            // Get secret string
            var kvReq = new GetUserDefinedSecretStringValueServiceRequest("SecretName");
            var kvResp = request.RequestContext.Execute<GetUserDefinedSecretStringValueServiceResponse>(kvReq);
            string secretValue = kvResp.SecretStringValue;

            // Get certificate
            var certReq = new GetUserDefinedSecretCertificateServiceRequest(null, "CertName", null, null);
            var certResp = request.RequestContext.Execute<GetUserDefinedSecretCertificateServiceResponse>(certReq);
            X509Certificate2 cert = certResp.Certificate;
        }
    }

    public void OnExecuted(Request request, Response response) { }
}
\`\`\`

---

## Important: Cache the Secret in Memory

Each call to \`GetUserDefinedSecretStringValueServiceRequest\` without caching:
CRT → HQ → Azure Key Vault (3 hops = high latency)

**Cache the secret value in-process** (static/singleton) with appropriate cache expiration strategy.

---

## Credential Rotation

When using Key Vault, credential rotation is simple:
- IT admin updates the secret in Key Vault
- **No extension code change or redeployment required**
- Cache expiration determines how quickly the new value takes effect

---

## Offline Support

- Key Vault secrets require **connectivity to HQ**
- Your extension code must handle **failover to offline** when Key Vault credentials can't be reached
- Consider local fallback or graceful degradation

---

## Register in Config (same as all CRT extensions)

\`\`\`xml
<!-- CommerceRuntime.Ext.config -->
<add source="assembly" value="YourSecretExtensionAssembly" />
\`\`\`
`.trim(),
    codeBlocks: [
      `// Get a string secret from Azure Key Vault
var req = new GetUserDefinedSecretStringValueServiceRequest("MyExtension.ApiKey");
var resp = request.RequestContext.Execute<GetUserDefinedSecretStringValueServiceResponse>(req);
string apiKey = resp.SecretStringValue;`,
      `// Get a certificate from Azure Key Vault
var certReq = new GetUserDefinedSecretCertificateServiceRequest(null, "MyExtension.Cert", null, null);
var certResp = request.RequestContext.Execute<GetUserDefinedSecretCertificateServiceResponse>(certReq);
X509Certificate2 cert = certResp.Certificate;`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Pages 33-36: Samples ────────────────────────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/trigger-example-blocking-transaction
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/abandoned-cart-sample-app
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/loyalty-extension-sample
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extensions-shipping-carrier-integration

const SAMPLES_ENTRIES: DocEntry[] = [
  {
    id: "sample-blocking-transaction",
    title: "Block Transactions Using CRT Triggers — Customer Blocked Sample",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/trigger-example-blocking-transaction",
    category: "samples",
    tags: [
      "trigger", "blocking", "IRequestTrigger", "GetCustomersServiceRequest",
      "GetCustomersServiceResponse", "OnExecuted", "post-trigger",
      "CartValidationException", "DataValidationErrors",
      "Microsoft_Dynamics_Commerce_Runtime_CustomerAccountIsBlocked",
      "Blocked", "customer-blocked", "CRT", "invoice", "credit",
    ],
    summary:
      "Sample showing how to block transactions using a CRT post-trigger on GetCustomersServiceRequest. In OnExecuted, check if the returned customer has Blocked == true and throw CartValidationException with Microsoft_Dynamics_Commerce_Runtime_CustomerAccountIsBlocked. This prevents adding a blocked customer to the cart. Pattern applies to any scenario where you need to cancel an operation after the base handler runs.",
    content: `
## Block Transactions Using CRT Triggers

This sample shows how to **block an invoice or credit transaction** when the customer is marked as Blocked in the system.

### Pattern Used
**CRT post-trigger** (OnExecuted) on \`GetCustomersServiceRequest\`.

The base handler fetches the customer from CRT. The post-trigger inspects the result and throws an exception if the customer is blocked — which cancels the operation and prevents the customer from being added to the cart.

---

## Implementation

### Step 1: Create the trigger class

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Services.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Messages;

namespace CRTTriggerExtension
{
    public class GetCustomersServiceRequestTrigger : IRequestTrigger
    {
        // Declare the request type this trigger fires for
        public IEnumerable<Type> SupportedRequestTypes
        {
            get { return new[] { typeof(GetCustomersServiceRequest) }; }
        }

        // Post trigger: runs AFTER the customer is loaded from CRT
        public void OnExecuted(Request request, Response response)
        {
            if (response == null)
                throw new ArgumentNullException("request");

            var getCustomersResponse = (GetCustomersServiceResponse)response;
            var customer = getCustomersResponse.Customers.FirstOrDefault();

            if (customer?.Blocked == true)
            {
                string message = string.Format(
                    "Failed to add customer '{0}' to cart. Blocked customers are not allowed for transactions.",
                    customer.AccountNumber);

                throw new CartValidationException(
                    DataValidationErrors.Microsoft_Dynamics_Commerce_Runtime_CustomerAccountIsBlocked,
                    message);
            }
        }

        // Pre trigger: runs BEFORE the customer is loaded (add pre-validation here if needed)
        public void OnExecuting(Request request)
        {
            if (request == null)
                throw new ArgumentNullException("request");
        }
    }
}
\`\`\`

---

## Key Points

| Element | Detail |
|---|---|
| Trigger interface | \`IRequestTrigger\` (sync) or \`IRequestTriggerAsync\` (async) |
| Monitored request | \`GetCustomersServiceRequest\` |
| Method used | \`OnExecuted\` (post-trigger — after base handler ran) |
| How to block | Throw \`CartValidationException\` with the appropriate \`DataValidationErrors\` enum member |
| Error code | \`Microsoft_Dynamics_Commerce_Runtime_CustomerAccountIsBlocked\` |

---

## Generalizing the Pattern

Use this same pattern to block any CRT operation:

1. Choose the CRT request to intercept (e.g., \`SaveCartRequest\`, \`GetProductsServiceRequest\`)
2. Decide whether to check **before** (\`OnExecuting\`) or **after** (\`OnExecuted\`) the base handler
3. Throw the appropriate exception to cancel the operation:
   - \`CartValidationException\` — for cart-level business rule violations
   - \`DataValidationException\` — for data validation failures
   - \`CommerceException\` — general commerce exception

---

## Register the Trigger

\`\`\`xml
<!-- CommerceRuntime.Ext.config -->
<add source="assembly" value="CRTTriggerExtension" />
\`\`\`

Copy DLL to \`..\\RetailServer\\webroot\\bin\\ext\` (online) or \`...\\ClientBroker\\ext\` (offline).
`.trim(),
    codeBlocks: [
      `public class GetCustomersServiceRequestTrigger : IRequestTrigger
{
    public IEnumerable<Type> SupportedRequestTypes =>
        new[] { typeof(GetCustomersServiceRequest) };

    public void OnExecuted(Request request, Response response)
    {
        var customer = ((GetCustomersServiceResponse)response).Customers.FirstOrDefault();
        if (customer?.Blocked == true)
            throw new CartValidationException(
                DataValidationErrors.Microsoft_Dynamics_Commerce_Runtime_CustomerAccountIsBlocked,
                $"Customer '{customer.AccountNumber}' is blocked.");
    }

    public void OnExecuting(Request request) { }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "sample-abandoned-cart",
    title: "Abandoned Cart Connector Sample — Detect Abandoned Carts and Send Email Notifications",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/abandoned-cart-sample-app",
    category: "samples",
    tags: [
      "abandoned-cart", "email-notification", "connector", "Emarsys",
      "Retail-Server", "Azure-Cosmos-DB", "Azure-Key-Vault",
      "IEmailProvider", "AbandonedCartSample", "Dynamics365Commerce.Solutions",
      "IncludeAbandonedCartsModifiedSinceLastMinutes", "ExcludeAbandonedCartsModifiedSinceLastMinutes",
      "RetailServerClientOptions", "appSettings.json",
      "operating-unit-number", "e-commerce", "cart-recovery",
      "DefaultAzureCredential", "Microsoft-Entra",
    ],
    summary:
      "The abandoned cart connector sample detects e-commerce shopping carts not modified within a configurable time window and sends reminder emails. Uses Retail Server API to fetch carts, Azure Cosmos DB to track previously processed carts, Azure Key Vault for credentials, and Emarsys (or custom IEmailProvider) for email delivery. Found in Dynamics365Commerce.Solutions GitHub under src/Extensions.AbandonedCartSample. Configure via appSettings.json: time window (IncludeAbandonedCartsModifiedSinceLastMinutes / ExcludeAbandonedCartsModifiedSinceLastMinutes).",
    content: `
## Abandoned Cart Connector Sample App

Detects e-commerce carts abandoned within a configurable time window and sends reminder emails to customers.

### Repository
GitHub: **microsoft/Dynamics365Commerce.Solutions**
Path: \`src/Extensions.AbandonedCartSample\`
(Branch: \`release/9.50\`)

---

## Architecture Components

| Component | Purpose |
|---|---|
| Retail Server API | Fetches shopping carts within the time window |
| Azure Cosmos DB | Tracks cart IDs + timestamps of already-processed carts (avoids duplicate emails) |
| Azure Key Vault | Stores API credentials securely (Emarsys API key, app secret) |
| Email provider | Sends abandoned cart emails (default: Emarsys; extensible via \`IEmailProvider\`) |
| Microsoft Entra | App registration for Retail Server service-to-service auth |

---

## How It Works

1. Connector retrieves all carts modified between **IncludeAbandonedCartsModifiedSinceLastMinutes** and **ExcludeAbandonedCartsModifiedSinceLastMinutes** ago
2. Filters out carts already processed (tracked in Cosmos DB)
3. Enriches carts with product + customer data from Retail Server
4. Passes enriched data to email provider (Emarsys)
5. Stores processed cart IDs in Cosmos DB

---

## Configuration (appSettings.json)

### Key Vault
\`\`\`json
"KeyVaultOptions": {
    "KeyVaultURI": "https://your-vault.vault.azure.net/"
}
\`\`\`

### Retail Server
\`\`\`json
"RetailServerClientOptions": {
    "TenantId": "your-entra-tenant-id",
    "RetailServerAudienceId": "...",
    "AppIdKeyVaultSecretName": "AbandonedCartAppId",
    "AppSecretKeyVaultSecretName": "AbandonedCartAppSecret",
    "RetailServerUrl": "https://your-rs-url/Commerce",
    "OperatingUnitNumber": "123456",
    "IncludeAbandonedCartsModifiedSinceLastMinutes": 120,
    "ExcludeAbandonedCartsModifiedSinceLastMinutes": 30,
    "ReturnToCartUrl": "https://your-site/cart"
}
\`\`\`

**Time window example**: IncludeAbandonedCartsModifiedSinceLastMinutes=120, ExcludeAbandonedCartsModifiedSinceLastMinutes=30 → retrieves carts last modified between 120 and 30 minutes ago (carts idle for 30–120 min).

### Cosmos DB
\`\`\`json
"AzureCosmosOptions": {
    "EndPointUri": "https://your-cosmos.documents.azure.com:443/",
    "PrimaryKey": "your-key",
    "DatabaseId": "AbandonedCartDB",
    "ContainerId": "AbandonedCarts"
}
\`\`\`

### Emarsys (default email provider)
\`\`\`json
"EmarsysClientOptions": {
    "ApiUrl": "https://api.emarsys.net/api/v2/event/{0}/trigger",
    "ExternalEventId": "your-event-id",
    "ApiUserNameKeyVaultSecretName": "EmarsysApiUser",
    "ApiSecretKeyVaultSecretName": "EmarsysApiSecret",
    "EmarsysContactKeyId": 3
}
\`\`\`

---

## Customize Email Provider

Implement \`IEmailProvider\` to replace Emarsys with another provider (Constant Contact, Mailchimp, SendGrid, etc.):

\`\`\`csharp
public class MyEmailProvider : IEmailProvider
{
    public async Task SendAbandonedCartEmail(AbandonedCartData cartData)
    {
        // call your email API
    }
}
\`\`\`

---

## Email Content Available
- Customer first name, last name, email address
- URL to return to cart
- Transaction currency
- Per product: display name, product ID, image URL (resizable), alt text, unit price

---

## Prerequisites
1. Azure Cosmos DB account (or local emulator for testing)
2. Azure Key Vault with secrets for app credentials and email provider
3. Microsoft Entra App Registration for Retail Server service-to-service auth
4. App ID added to Retail Server allow list

---

## Regional Compliance Note
If operating in regions that require opt-out or data deletion rights (GDPR, etc.), you must build those controls — the sample does not include them.
`.trim(),
    codeBlocks: [
      `// Customize email provider by implementing IEmailProvider
public class MyEmailProvider : IEmailProvider
{
    public async Task SendAbandonedCartEmail(AbandonedCartData cartData)
    {
        // integrate with Mailchimp, SendGrid, etc.
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "sample-loyalty-extension",
    title: "Loyalty Extension Sample — Earn and Redeem Points in the Same Transaction",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/loyalty-extension-sample",
    category: "samples",
    tags: [
      "loyalty", "earn-redeem", "FillInLoyaltyRewardPointLinesForSalesServiceRequest",
      "FillInLoyaltyRewardPointLinesForEarnOrDeductServiceRequest",
      "FillInLoyaltyRewardPointLinesForReturnServiceRequest",
      "LoyaltyRewardPointLine", "LoyaltyRewardPointEntryType",
      "Earn", "Redeem", "RewardPointAmountQuantity",
      "IRequestHandler", "IRequestTrigger", "SalesTransaction",
      "SingleEntityDataServiceResponse", "post-trigger",
      "loyalty-scheme", "loyalty-program", "CartType",
    ],
    summary:
      "Sample enabling customers to earn AND redeem loyalty points in the same transaction (not supported out-of-box). Two-step approach: (1) Override FillInLoyaltyRewardPointLinesForSalesServiceRequest to always call the earn calculation even when redeeming; (2) Add a post-trigger on the same request to reduce the over-earned points by (earning rate / redemption rate × redeemed points). Key classes: LoyaltyRewardPointLine, LoyaltyRewardPointEntryType.Earn/Redeem.",
    content: `
## Loyalty Extension Sample — Earn and Redeem in Same Transaction

**Problem**: Out-of-box Commerce does NOT allow customers to both earn and redeem loyalty points in the same transaction. If a tender line for loyalty card exists, the earn calculation is skipped.

**Solution**: A two-step CRT extension using a handler override + post-trigger.

---

## Architecture

### Loyalty Service Requests (out-of-box)

| Request | Purpose |
|---|---|
| \`GetLoyaltyCardStatusServiceRequest\` | Get loyalty card status |
| \`CalculateLoyaltyRewardPointsServiceRequest\` | Calculate reward points |
| \`IssueLoyaltyCardServiceRequest\` | Issue a loyalty card |
| \`FillInLoyaltyRewardPointLinesForSalesServiceRequest\` | Fill reward lines for sales transaction |
| \`FillInLoyaltyRewardPointLinesForReturnServiceRequest\` | Fill reward lines for returns |
| \`FillInLoyaltyRewardPointLinesForEarnOrDeductServiceRequest\` | Do the actual earn/deduct calculation |

---

## Step 1: Override FillInLoyaltyRewardPointLinesForSalesServiceRequest

Force the earn calculation to always run, even when loyalty redemption tender is present:

\`\`\`csharp
public class FillInLoyaltyRewardPointLinesForSalesHandler : IRequestHandler
{
    public IEnumerable<Type> SupportedRequestTypes =>
        new[] { typeof(FillInLoyaltyRewardPointLinesForSalesServiceRequest) };

    public Response Execute(Request request)
    {
        ThrowIf.Null(request, "request");
        var req = (FillInLoyaltyRewardPointLinesForSalesServiceRequest)request;
        SalesTransaction salesTransaction = req.SalesTransaction;

        // Always calculate earn, regardless of loyalty redemption tender
        var earnReq = new FillInLoyaltyRewardPointLinesForEarnOrDeductServiceRequest(
            salesTransaction, req.EarnSchemeLines, LoyaltyRewardPointEntryType.Earn);

        var earnResp = request.RequestContext
            .Execute<SingleEntityDataServiceResponse<SalesTransaction>>(earnReq);

        salesTransaction = earnResp.Entity;
        return new SingleEntityDataServiceResponse<SalesTransaction>(salesTransaction);
    }
}
\`\`\`

---

## Step 2: Post-Trigger to Adjust Over-Earned Points

After the earn is calculated, reduce the points for the portion paid with loyalty:

\`\`\`csharp
class AdjustLoyaltyRewardsTrigger : IRequestTrigger
{
    public IEnumerable<Type> SupportedRequestTypes =>
        new[] { typeof(FillInLoyaltyRewardPointLinesForSalesServiceRequest) };

    public void OnExecuted(Request request, Response response)
    {
        ThrowIf.Null(request, "request");
        var req = (FillInLoyaltyRewardPointLinesForSalesServiceRequest)request;
        SalesTransaction salesTransaction = req.SalesTransaction;

        if (salesTransaction.LoyaltyRewardPointLines == null) return;

        // Sum all redeemed points
        decimal totalRedeemedPoints = salesTransaction.LoyaltyRewardPointLines
            .Where(l => l.EntryType == LoyaltyRewardPointEntryType.Redeem)
            .Sum(l => l.RewardPointAmountQuantity);

        if (totalRedeemedPoints > 0)
        {
            // earning rate: $0.1 per $1 spent; redemption: 1 point = $1
            // → for every redeemed point, 0.1 extra points were earned incorrectly
            decimal extraEarnedPoints = 0.1m * totalRedeemedPoints;

            // Subtract from the earn lines
            var earnLine = salesTransaction.LoyaltyRewardPointLines
                .FirstOrDefault(l => l.EntryType == LoyaltyRewardPointEntryType.Earn);
            if (earnLine != null)
                earnLine.RewardPointAmountQuantity -= extraEarnedPoints;
        }
    }

    public void OnExecuting(Request request) { }
}
\`\`\`

---

## Key Notes

- **Earning/redemption rates are hardcoded** in the sample for clarity — in production, read from the database via CRT data service requests
- **No tiers** assumed — a single loyalty scheme and reward point type
- The post-trigger adjustment formula: \`extraEarnedPoints = (earn rate / redemption rate) × totalRedeemedPoints\`
- Both the handler override and trigger are registered together in \`CommerceRuntime.Ext.config\`
- SDK sample location: \`RetailSDK\\SampleExtensions\\CommerceRuntime\` (loyalty folder)

---

## Register Both Extensions

\`\`\`xml
<!-- CommerceRuntime.Ext.config -->
<add source="assembly" value="Contoso.Commerce.Runtime.EarnRedeemLoyalty" />
\`\`\`
`.trim(),
    codeBlocks: [
      `// Step 1: Override to always run earn calculation
var earnReq = new FillInLoyaltyRewardPointLinesForEarnOrDeductServiceRequest(
    salesTransaction, req.EarnSchemeLines, LoyaltyRewardPointEntryType.Earn);
salesTransaction = request.RequestContext
    .Execute<SingleEntityDataServiceResponse<SalesTransaction>>(earnReq).Entity;`,
      `// Step 2: Post-trigger adjusts over-earned points
decimal extraEarnedPoints = 0.1m * totalRedeemedPoints; // earn_rate / redemption_rate
earnLine.RewardPointAmountQuantity -= extraEarnedPoints;`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "sample-packing-slip-shipping",
    title: "Extension Points for Packing Slips and Shipping Carrier Integration in Order Fulfillment",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extensions-shipping-carrier-integration",
    category: "samples",
    tags: [
      "packing-slip", "shipping-carrier", "order-fulfillment",
      "PrintPackingSlipClientRequestHandler", "PrintPackingSlipClientRequestHandlerExt",
      "PrintPackingSlipClientRequest", "PrintPackingSlipClientResponse",
      "MarkAsPickedRealtimeRequest", "PackFulfillmentLinesRealtimeRequest",
      "RetailTransactionServiceFulfillment", "GetPackingSlipsData",
      "GetFulfillmentLinesByPackingSlipId", "MarkFulfillmentLinesAsPacked",
      "packingSlipExtensionPoint", "defaultExecuteAsync",
      "POS", "CRT", "HQ", "PDF", "fulfillment-lines",
      "StoreFulfillmentRequestHandlers",
    ],
    summary:
      "Extension points across POS, CRT, and HQ for customizing packing slips during order fulfillment. POS: override PrintPackingSlipClientRequestHandler (StoreFulfillmentRequestHandlers) to intercept print, add custom data, or change format. CRT: override or trigger MarkAsPickedRealtimeRequest (add item weight) and PackFulfillmentLinesRealtimeRequest (change Packed status logic). HQ: extend RetailTransactionServiceFulfillment — packingSlipExtensionPoint for custom packing info or delivery notes.",
    content: `
## Extension Points for Packing Slips and Shipping Carrier Integration

When generating packing slips for customer orders from POS, you can extend across three layers:
- **POS** — intercept the print action, add custom print logic or format
- **CRT** — add custom logic when lines are picked/packed (e.g., calculate item weight)
- **HQ** — extend real-time service methods to return custom data with packing slips

---

## POS Layer: Override PrintPackingSlipClientRequestHandler

Override the request that fires when the cashier selects **Print packing slip** in POS.

\`\`\`typescript
import { PrintPackingSlipClientRequestHandler }
    from "PosApi/Extend/RequestHandlers/StoreFulfillmentRequestHandlers";
import { PrintPackingSlipClientRequest, PrintPackingSlipClientResponse }
    from "PosApi/Consume/SalesOrders";
import { ClientEntities } from "PosApi/Entities";

export default class PrintPackingSlipClientRequestHandlerExt
    extends PrintPackingSlipClientRequestHandler
{
    public executeAsync(
        request: PrintPackingSlipClientRequest<PrintPackingSlipClientResponse>
    ): Promise<ClientEntities.ICancelableDataResult<PrintPackingSlipClientResponse>>
    {
        // Custom logic BEFORE the default handler:
        // - validate shipping carrier info
        // - append custom fields to packing slip data
        // - check a condition and cancel printing

        // Call the default handler (PDF print)
        return this.defaultExecuteAsync(request);
    }
}
\`\`\`

Register in manifest.json:
\`\`\`json
{
    "requestHandlers": [
        { "modulePath": "Handlers/PrintPackingSlipClientRequestHandlerExt" }
    ]
}
\`\`\`

**What you can do with this override**:
- Print packing slip in a **different format** (not PDF)
- Conditionally **stop printing** based on business logic
- Add **validation before print**
- Call a **custom shipping carrier API** to get label data

**What you cannot do**: change the actual data printed (must go to CRT or HQ for that).

---

## CRT Layer: Real-time Service Requests for Fulfillment

### MarkAsPickedRealtimeRequest
Fires when fulfillment lines are marked as **Picked** in POS.
Use override or pre/post trigger to:
- Calculate item weight for each line
- Call external APIs (use CDX real-time service pattern)
- Modify line properties before they're used for the packing slip

### PackFulfillmentLinesRealtimeRequest
Fires when fulfillment lines are marked as **Partially packed** or **Packed**.
Use override or pre/post trigger to:
- Add custom packing validation
- Integrate with 3PL (third-party logistics) systems

**Note**: If the required data is only available in HQ, implement the logic in HQ real-time service methods and call from CRT (see HQ section below).

---

## HQ Layer: RetailTransactionServiceFulfillment

All packing slip real-time service methods live in \`RetailTransactionServiceFulfillment\`:

| Method | Description |
|---|---|
| \`GetPackingSlipsData(salesId)\` | Returns all packing slip info for a sales order |
| \`GetFulfillmentLinesByPackingSlipId(packingSlipId)\` | Returns fulfillment lines for a given packing slip ID |
| \`MarkFulfillmentLinesAsPacked(fulfillmentDetailsXml)\` | Updates fulfillment line status to Packed |
| \`packingSlipExtensionPoint()\` | **Extension point** — add custom packing info or delivery note |

### Extend packingSlipExtensionPoint
This method is called by \`MarkFulfillmentLinesAsPacked\` via chain-of-command. Add here:
- Custom shipping carrier label data
- Delivery notes
- Additional package information

\`\`\`xpp
[ExtensionOf(classStr(RetailTransactionServiceFulfillment))]
final class ContosoRetailFulfillmentExtension
{
    protected str packingSlipExtensionPoint(SalesId salesId, PackingSlipId packingSlipId)
    {
        // Return custom packing info as string (XML or JSON)
        return next packingSlipExtensionPoint(salesId, packingSlipId);
    }
}
\`\`\`

---

## Shipping Carrier Integration Pattern

Typical end-to-end flow:
1. **POS**: cashier selects lines to pack → POS calls CRT \`MarkAsPickedRealtimeRequest\`
2. **CRT**: override the request → call CDX Real-time Service to get shipping rates from HQ
3. **HQ**: \`RetailTransactionServiceFulfillment.packingSlipExtensionPoint\` → call 3PL/carrier API → return label data
4. **CRT**: use the returned label data → pass back to POS
5. **POS**: \`PrintPackingSlipClientRequestHandlerExt\` → print label + packing slip

---

## Layer Summary

| Layer | Extension Point | Use For |
|---|---|---|
| POS | \`PrintPackingSlipClientRequestHandler\` override | Custom print format, pre-print validation |
| CRT | \`MarkAsPickedRealtimeRequest\` trigger/override | Item weight, external API call |
| CRT | \`PackFulfillmentLinesRealtimeRequest\` trigger/override | Custom packed status logic |
| HQ | \`packingSlipExtensionPoint\` chain-of-command | Custom packing data, carrier label, delivery note |
`.trim(),
    codeBlocks: [
      `export default class PrintPackingSlipClientRequestHandlerExt
    extends PrintPackingSlipClientRequestHandler
{
    public executeAsync(request: PrintPackingSlipClientRequest<PrintPackingSlipClientResponse>)
        : Promise<ClientEntities.ICancelableDataResult<PrintPackingSlipClientResponse>>
    {
        // custom logic before print
        return this.defaultExecuteAsync(request);
    }
}`,
      `[ExtensionOf(classStr(RetailTransactionServiceFulfillment))]
final class ContosoRetailFulfillmentExtension
{
    protected str packingSlipExtensionPoint(SalesId salesId, PackingSlipId packingSlipId)
    {
        // return custom packing data / carrier label
        return next packingSlipExtensionPoint(salesId, packingSlipId);
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Pages 37-39: Packaging and Deployment ───────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/csu-packaging
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/merge-csu-extensions
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/remove-csu-package

const DEPLOYMENT_ENTRIES: DocEntry[] = [
  {
    id: "deploy-csu-packaging",
    title: "Create a Cloud Scale Unit (CSU) Extension Package — CloudScaleUnitExtensionPackage.zip",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/csu-packaging",
    category: "deployment",
    tags: [
      "CSU", "packaging", "CloudScaleUnitExtensionPackage", "LCS",
      "Microsoft.Dynamics.Commerce.Sdk.ScaleUnit", "NuGet",
      "Dynamics365Commerce.ScaleUnit", "GitHub",
      "CommerceRuntimeExtensionSettings", "CommerceRuntime.Ext.config",
      "web.config", "extensionComposition",
      "CRT", "Retail-Server", "channel-database", "payment-connector",
      "Store-Commerce-web", "net-standard-2", "bin-output",
      "pkgs.dev.azure.com", "dynamics365-commerce",
      "Release-candidate", "Asset-library",
    ],
    summary:
      "A CSU extension package bundles CRT, Headless Commerce APIs, channel DB scripts, payment connectors, and Store Commerce for web into CloudScaleUnitExtensionPackage.zip. Two options: (1) clone Dynamics365Commerce.ScaleUnit from GitHub, add project references; (2) create new .NET Standard 2.0 C# project, add Microsoft.Dynamics.Commerce.Sdk.ScaleUnit NuGet. Both auto-generate Web.Config (no manual config needed). Add ext.* settings via CommerceRuntimeExtensionSettings. Upload to LCS Asset library as Commerce Cloud Scale Unit Extension, mark as Release candidate, then deploy.",
    content: `
## Create a CSU Extension Package

A CSU (Cloud Scale Unit) extension package bundles all server-side Commerce extensions:
- **Commerce Runtime (CRT)** extensions
- **Headless Commerce APIs** (Retail Server) extensions
- **Channel database** extension scripts
- **Payment connectors**
- **Store Commerce for web** extensions

Output: **CloudScaleUnitExtensionPackage.zip** in the project bin output folder.

---

## Option 1: Clone the Sample Packaging Project (Recommended)

1. Clone from GitHub: **microsoft/Dynamics365Commerce.ScaleUnit**
   Select the correct release branch for your SDK/application version.

2. Add your extension projects as **project references** to the ScaleUnit packaging project:
   - CRT extension project
   - Retail Server extension project
   - Channel DB project
   - Payment connector project
   - Store Commerce for web extension project

3. If CRT/RS/Payment extensions depend on additional assemblies, add them as **project references** in the extension project.
   > **Do NOT add dependent assemblies to CommerceRuntime.Ext.config** — the packaging process includes them in the \`ext\` folder automatically. Adding them to config may cause runtime errors.

4. To add settings/config values to \`CommerceRuntime.Ext.config\`, edit the packaging project .csproj file:
   \`\`\`xml
   <CommerceRuntimeExtensionSettings Include="ext.YourKeyName">
       <Value>samplevalue</Value>
   </CommerceRuntimeExtensionSettings>
   \`\`\`

5. Build the project → generates \`CloudScaleUnitExtensionPackage.zip\`.

---

## Option 2: Create a New Packaging Project from Scratch

1. Create a new **C# class library** project targeting **.NET Standard 2.0**

2. Add NuGet package: \`Microsoft.Dynamics.Commerce.Sdk.ScaleUnit\`
   (Select version matching your SDK/application version)

3. Configure NuGet feed in \`nuget.config\`:
   \`\`\`xml
   <packageSources>
       <add key="dynamics365-commerce"
            value="https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/nuget/v3/index.json" />
       <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
   </packageSources>
   \`\`\`

4. Add your extension projects as **project references** (same as Option 1, steps 2–4)

5. Build → \`CloudScaleUnitExtensionPackage.zip\`

### Auto-generated configuration
The packaging project auto-generates \`Web.Config\` (extensionComposition) — **no manual config file creation required**.

---

## Deploy to CSU via LCS

1. Sign in to LCS → open your project
2. Menu → **Asset library**
3. Asset type: **Commerce Cloud Scale Unit Extension** → click **+**
4. Enter name + description → **Add file** → select \`CloudScaleUnitExtensionPackage.zip\`
5. **Confirm** upload (LCS validates the package — takes a few minutes)
6. After validation: mark as **Release candidate**
7. Deploy to environment via: Retail and Commerce → Apply updates and extensions to Commerce Scale Unit (cloud)

---

## Key Rules

| Rule | Detail |
|---|---|
| Don't add dependencies to Ext.config | Add as project references — packager puts them in ext folder |
| Settings prefix | Must start with \`ext.\` (e.g., \`ext.AppInsightsKey\`) |
| One package per CSU | LCS supports only one extension package — use merge for multiple ISV packages |
| Config auto-generated | Web.Config is auto-generated by the packaging project |
`.trim(),
    codeBlocks: [
      `<!-- Add CRT extension settings to CommerceRuntime.Ext.config via project file -->
<CommerceRuntimeExtensionSettings Include="ext.YourKeyName">
    <Value>samplevalue</Value>
</CommerceRuntimeExtensionSettings>`,
      `<!-- nuget.config — Commerce NuGet feed -->
<packageSources>
    <add key="dynamics365-commerce"
         value="https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/nuget/v3/index.json" />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
</packageSources>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "deploy-merge-csu-extensions",
    title: "Merge CSU Extension Packages — Combining ISV and Custom Extensions into One Package",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/merge-csu-extensions",
    category: "deployment",
    tags: [
      "merge", "CSU", "extension-packages", "ISV", "NuGet",
      "GeneratePackageOnBuild", "PackageReference",
      "nuget.config", "local-feed", "package-source",
      "Contoso.Extension.Sample.Package",
      "LCS", "single-package", "deployment",
      "on-premises", "Store-Commerce", "Hardware-Station",
    ],
    summary:
      "LCS supports only ONE CSU extension package at a time — deploying a second overwrites the first. To combine ISV + custom extensions: ask ISVs to produce NuGet packages (add GeneratePackageOnBuild=true to their CSU project), add their NuGet as a PackageReference in your CSU packaging project, then build. The output package contains all extensions. Exception: on-premises CSU, Store Commerce, and shared Hardware Station support multiple deployments (no merge needed).",
    content: `
## Merge CSU Extension Packages

**Problem**: LCS supports only **one CSU extension package** at a time. If you deploy a second package, it **overwrites the previous deployment**.

**Scenario**: You have your own CSU extension package, plus packages from a tax ISV and a payment ISV. You must merge all three into a single package before deploying to LCS.

---

## When Merge Is Required vs Not Required

| Component | Merge Required? |
|---|---|
| **Cloud CSU (LCS deployment)** | **YES** — only one package supported |
| On-premises CSU | No — multiple deployments supported |
| Store Commerce (MPOS/CPOS) | No — multiple deployments supported |
| Shared Hardware Station | No — multiple deployments supported |

---

## How to Merge: NuGet Package Approach

### Step 1: ISV generates a NuGet package for their CSU extension

ISVs add this to their CSU packaging project (.csproj):
\`\`\`xml
<GeneratePackageOnBuild>true</GeneratePackageOnBuild>
\`\`\`

This makes the build produce both \`CloudScaleUnitExtensionPackage.zip\` AND a NuGet package (\`.nupkg\`).

### Step 2: You receive the ISV NuGet package

ISVs give you their \`.nupkg\` file (e.g., \`Contoso.TaxExtension.Package.2.0.0.nupkg\`).

### Step 3: Configure local NuGet feed in your project

Add the folder containing the ISV \`.nupkg\` files as a local NuGet source in your \`nuget.config\`:
\`\`\`xml
<packageSources>
    <add key="local" value="packages" />
    <!-- also add your ISV's Azure DevOps feed if applicable -->
</packageSources>
\`\`\`

Copy the ISV \`.nupkg\` files to the \`packages\` folder.

### Step 4: Reference the ISV NuGet in your CSU packaging project

Edit your CSU packaging project file (\`.csproj\`):
\`\`\`xml
<PackageReference Include="Contoso.TaxExtension.Package" Version="2.0.*" />
<PackageReference Include="Contoso.PaymentExtension.Package" Version="1.5.0" />
\`\`\`

Use exact version or wildcards (\`2.0.*\`) to pick up the latest patch automatically.
Repeat for each ISV package.

### Step 5: Build your CSU packaging project

The output \`CloudScaleUnitExtensionPackage.zip\` now contains:
- Your extensions
- All ISV extensions (from the NuGet packages)

Deploy this single merged package to LCS.

---

## Summary

\`\`\`
ISV1 CSU project  →  ISV1.Extension.Package.nupkg  ─┐
ISV2 CSU project  →  ISV2.Extension.Package.nupkg  ─┼─► Your CSU packaging project ─► CloudScaleUnitExtensionPackage.zip → LCS
Your CRT/RS/DB projects                             ─┘
\`\`\`

---

## Reference
For creating the initial CSU package, see [Create a Cloud Scale Unit extension package](csu-packaging).
`.trim(),
    codeBlocks: [
      `<!-- ISV adds to their CSU packaging .csproj to produce a NuGet package -->
<GeneratePackageOnBuild>true</GeneratePackageOnBuild>`,
      `<!-- Your CSU packaging .csproj — reference ISV NuGet packages -->
<PackageReference Include="Contoso.TaxExtension.Package" Version="2.0.*" />
<PackageReference Include="Contoso.PaymentExtension.Package" Version="1.5.0" />`,
      `<!-- nuget.config — point to local folder containing ISV .nupkg files -->
<packageSources>
    <add key="local" value="packages" />
</packageSources>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "deploy-remove-csu-package",
    title: "Remove CSU Extensions — Apply the Remove CSU Extension Package via LCS",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/retail-sdk/remove-csu-package",
    category: "deployment",
    tags: [
      "remove", "uninstall", "CSU", "extensions", "LCS",
      "Microsoft.Dynamics.Commerce.Deployment.CSUExtensionCleanUpPackage",
      "Remove-CSU-Extension", "Shared-asset-library",
      "Commerce-Cloud-Scale-Unit-Extension",
      "once-per-day", "rollback", "cleanup",
      "10.0.16", "base-CSU", "hotfixes",
      "Store-Commerce", "Hardware-Station", "channel-components",
    ],
    summary:
      "To remove ALL CSU extensions: download 'Remove CSU Extension' package (Microsoft.Dynamics.Commerce.Deployment.CSUExtensionCleanUpPackage) from LCS Shared asset library, upload to your project Asset library as Commerce Cloud Scale Unit Extension, mark as Release candidate, deploy. Removes all extensions and keeps only base CSU + Microsoft hotfixes. Applies from version 10.0.16+. Critical: can only be applied ONCE per calendar day. Does NOT remove Store Commerce, Hardware Station, or on-premises extensions.",
    content: `
## Remove CSU Extensions

Applies to: Commerce SDK **10.0.16 or later**

### What It Removes
Applying the **Remove CSU Extension** package removes ALL of these from CSU:
- Commerce Runtime (CRT) extensions
- Headless Commerce API extensions
- Channel database extension scripts
- Store Commerce for web extensions

### What It Does NOT Remove
- Store Commerce app extensions
- Hardware Station extensions
- Cloud Scale Unit - Self hosted extensions
- Commerce back office (HQ) extensions

After removal, only **base CSU components + Microsoft hotfixes** remain.

---

## Steps to Remove CSU Extensions

1. Sign in to [LCS](https://lcs.dynamics.com/v2)

2. Select **Shared asset library** tile

3. Asset type: **Commerce Cloud Scale Unit Extension**
   Download the package named **Remove CSU Extension**
   (Package ID: \`Microsoft.Dynamics.Commerce.Deployment.CSUExtensionCleanUpPackage\`)

4. Go to your project in LCS

5. Menu → **Asset library**

6. Asset type: **Commerce Cloud Scale Unit Extension** → click **+**

7. Enter a package name and description → **Add file** → select the downloaded **Remove CSU Extension** package

8. After upload → **Confirm**

9. LCS validates the package (takes a few minutes) → after validation: mark as **Release candidate**

10. Deploy to environment:
    Follow steps in **Apply updates and extensions to Commerce Scale Unit (cloud)**

---

## Critical Limitation

> **The Remove CSU Extension package can only be applied ONCE per calendar day.**
> Any subsequent deployment attempts in the same day will fail.

Plan removal operations accordingly.

---

## After Removal

To re-deploy your extensions (e.g., after removing a problematic package):
1. Build and upload a new \`CloudScaleUnitExtensionPackage.zip\` without the unwanted extension
2. Deploy the new package to CSU via LCS

---

## Reference
- Creating a CSU package: [Create a Cloud Scale Unit extension package](csu-packaging)
- Deploying packages: [Apply updates and extensions to Commerce Scale Unit](../../fin-ops-core/dev-itpro/deployment/update-retail-channel)
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Page 40: Store Commerce Local Dev Environment Setup ─────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/setup-local-dev-env

const LOCAL_STORE_COMMERCE_DEV_ENTRIES: DocEntry[] = [
  {
    id: "sc-local-dev-env",
    title: "Set Up a Local Development Environment for Store Commerce / CSU Extensions",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/setup-local-dev-env",
    category: "dev-environment",
    tags: [
      "local-dev", "dev-environment", "CSU", "self-hosted", "IIS-hosted",
      "Dynamics365Commerce.ScaleUnit", "GitHub", "ScaleUnitSample",
      "dotnet-8", "ASP.NET-Core-8", "NET-Standard-2",
      "SQL-Server", "full-text-search", "mixed-authentication",
      "NuGet.exe", "MSBuild", "Visual-Studio-Code", "Node.js",
      "baseProduct_UseSelfHost", "baseProduct_SslCertFullPath",
      "baseProduct_RetailServerCertFullPath", "baseProduct_AsyncClientCertFullPath",
      "baseProduct_RetailServerAadClientId", "baseProduct_CposAadClientId",
      "baseProduct_AsyncClientAadClientId", "baseProduct_Config",
      "tasks.json", "build-extension", "install", "uninstall",
      "localhost:12345", "health-check", "F5", "debugger",
      "CloudScaleUnitExtensionPackage", "Scale-Unit-Extension-installer",
      "Retail-Self-service", "SEALED", "LCS", "Download-folder",
      "Async-Client", "channel-database", "demo-data",
      "TLS-1.2", "HTTPS", "IIS", "w3wp", "RssuCore",
      "net461", "netstandard2.0",
    ],
    summary:
      "Two local dev environment options for Commerce extensions: (1) Self-hosted CSU — lightweight, no IIS/HQ/TLS, RTS mocked, demo data auto-loaded, serves at http://localhost:12345; (2) IIS-hosted CSU — full on-premises topology, real RTS with HQ, Async Client, CPOS, requires certificates and Entra app registrations. Prerequisites: .NET 8 SDK + ASP.NET Core 8 Hosting Bundle, SQL Server 2016 SP2+ (mixed auth), NuGet.exe on PATH, MSBuild v15+, Node.js 64-bit, VS Code + C# extension, clone Dynamics365Commerce.ScaleUnit GitHub, download Commerce Scale Unit (SEALED) from LCS into Download/ folder. Debug via F5 in VS Code — auto-deploys base + extension + demo data + attaches debugger.",
    content: `
## Set Up Local Development Environment for Store Commerce / CSU

> **Development only** — this setup cannot be used for production.
> From version 10.0.38, predeployed channel-side Commerce components are no longer updated (last version 10.0.37). Use Commerce SDK with sealed installers.

---

## Environment Type Options

### Option 1: Self-hosted CSU (Recommended for CRT development)
- No IIS, no HQ connectivity required
- RTS (real-time service) calls are **mocked** via demo-mode CRT handlers
- Channel database auto-filled with **demo data**
- Retail Server runs as a **console app**
- No TLS/certificates required
- Serves at: \`http://localhost:12345\`

**Best for:** CRT/Retail Server extension development, quick iteration, minimal dependencies

### Option 2: IIS-hosted CSU (Full topology)
- Full on-premises scale unit — nothing mocked
- Real RTS communication with Commerce headquarters
- Async Client fills channel database from HQ (no demo data)
- Requires certificates, Microsoft Entra app registrations, HQ connectivity
- Hosts CPOS

**Best for:** Integration testing, full stack scenarios, verifying production-equivalent behavior

---

## Hardware Requirements

- 16 GB RAM, 2 CPU cores minimum
- If running F&O apps + Retail Server + e-Commerce concurrently: 24 GB RAM, 4 CPU cores

---

## Prerequisites (Both Modes)

Install in this order:

1. **.NET Core SDK 8.0** for Windows x64 — [dotnet.microsoft.com/download/dotnet/8.0](https://dotnet.microsoft.com/download/dotnet/8.0)

2. **ASP.NET Core Runtime 8.0.x Hosting Bundle** for Windows — select **Hosting Bundle** (not x64/x86)

3. **SQL Server** (minimum 13.0.5026.0 / SQL Server 2016 SP2)
   - Enable **full text search**
   - Enable **Mixed (SQL + Windows) authentication**
   - Must have a **default instance** — or edit \`Install.ps1\` line 71:
   \`\`\`powershell
   $installerArgs += $("--sqlservername", "PutYourSqlServerSeenInSSMSHere")
   \`\`\`

4. **NuGet.exe** — download from [nuget.org/downloads](https://www.nuget.org/downloads), add to PATH

5. **MSBuild v15+** — install via Visual Studio Build Tools (Tools for Visual Studio section)
   - Verify: run \`msbuild /version\` from regular Command Prompt (not Developer Command Prompt)
   - PATH must point to the msbuild.exe folder at the beginning

6. **Microsoft.NET.Sdk** — install via Visual Studio Build Tools > Individual components > .NET SDK

7. **Node.js 64-bit** — [nodejs.org](https://nodejs.org/en/download/), add to PATH

8. **Visual Studio Code 64-bit** — [code.visualstudio.com](https://code.visualstudio.com/download)

9. **C# for VS Code (OmniSharp)** extension — install from VS Code Extension Marketplace

10. **Clone Dynamics365Commerce.ScaleUnit** repo from GitHub

11. **Download Commerce Scale Unit (SEALED)** from LCS Shared asset library
    - Asset type: **Retail Self-service package**
    - Find file ending in **Commerce Scale Unit (SEALED)** for your release version
    - Place in: \`Dynamics365Commerce.ScaleUnit/src/ScaleUnitSample/Download/\`

---

## Additional Prerequisites for IIS-Hosted CSU

Configure these in \`.vscode/tasks.json\`:

| Parameter | Description |
|---|---|
| \`baseProduct_Port\` | Default: 446. Change if port is in use. |
| \`baseProduct_SslCertFullPath\` | SSL cert thumbprint: \`store:///My/LocalMachine?FindByThumbprint=YourThumbprintHere\` |
| \`baseProduct_RetailServerCertFullPath\` | Retail Server identity cert thumbprint (same format) |
| \`baseProduct_AsyncClientCertFullPath\` | Async Client auth cert thumbprint (same format) |
| \`baseProduct_RetailServerAadClientId\` | Entra app client ID for Retail Server identity |
| \`baseProduct_RetailServerAadResourceId\` | Entra app Application ID URI for Retail Server |
| \`baseProduct_CposAadClientId\` | Entra app client ID for CPOS |
| \`baseProduct_AsyncClientAadClientId\` | Entra app client ID for Async Client |
| \`baseProduct_Config\` | Config file name (downloaded from HQ) — place in Download/ folder |
| \`baseProduct_UseSelfHost\` | Set to \`false\` for IIS mode |

**SSL certificate creation (IIS):** Open IIS → your machine name → Server Certificates → Create Self-Signed Certificate. Use FQDN as friendly name. Copy thumbprint from Details tab, uppercase all letters.

> For dev purposes, you can use the **same certificate** for all three cert parameters (SSL, RetailServer, AsyncClient) — provided the cert has \`digitalSignature\`, \`keyEncipherment\`, and \`dataEncipherment\` key usage values.

---

## Debug with Self-Hosted CSU (F5)

1. Open VS Code **as administrator**
2. Open \`src\\ScaleUnitSample\` folder from cloned repo
3. Open \`.vscode/tasks.json\` → set \`baseProduct_UseSelfHost\` to \`true\`
4. Terminal → Run Task → **build-extension**
5. Press **F5**

F5 automatically:
- Compiles extension → generates Sealed CSU Extension installer package
- Deploys Base Sealed Scale Unit (if not already deployed)
- Downloads demo data package from SDK feed → applies to channel database
- Deploys Sealed Scale Unit Extension installer
- Opens browser showing health check endpoint results
- Attaches debugger
- CSU serves at \`http://localhost:12345\`

Use **Debug Console** for real-time CSU internal diagnostics log.

---

## Debug with IIS-Hosted CSU (F5)

1. VS Code → **Run and Debug** (Ctrl+Shift+D) → select **Debug with IIS**
2. Press **F5** — deploys base installer, then extension installer
3. Base installer runs prerequisite checks (SQL Server, IIS, TLS, .NET Core Hosting Bundle)
4. After deployment: browser opens with health check, prompt to attach debugger
   - Enter \`w3wp\` in process list → select row containing **RssuCore** (CSU IIS app pool)

IIS-hosted result:
- Channel database (filled from HQ via Async Client)
- Async Client
- ASP.NET Core 8 Retail Server with real RTS to HQ
- CPOS

---

## Available VS Code Tasks

| Task | Description |
|---|---|
| \`build-extension\` | Build the extension |
| \`install\` | Verify prerequisites + deploy Base Scale Unit + Extension installer |
| \`uninstall\` | Uninstall extension and Base Scale Unit |
| \`uninstall-extension\` | Uninstall extension only |
| \`uninstall-base-product\` | Uninstall Base Scale Unit (fails if extension installed) |
| \`clean-extension\` | Clean build output |
| \`check-msbuild\` | Show MSBuild version available to VS Code |
| \`check-ps-bitness\` | Verify PowerShell is 64-bit |

---

## Build Output for Production

After successful build:
- **Cloud CSU package** → \`ScaleUnit\\bin\\Debug\\netstandard2.0\\\` (for cloud LCS deployment)
- **On-premises installer** → \`Installer\\bin\\Debug\\net461\\\` (for in-store self-hosted installations)

---

## Troubleshooting

**Script disabled error:** Run as admin: \`powershell Set-ExecutionPolicy RemoteSigned\`

**msbuild not found:** Run from Visual Studio Developer Command Prompt or verify PATH

**Runtime logs:**
- IIS mode → Windows Event Viewer → Windows Logs > Application → filter by:
  - \`Microsoft Dynamics - Async Client Service\`
  - \`Microsoft Dynamics - Retail Server\`
- Self-hosted mode → logs print directly to VS Code terminal
`.trim(),
    codeBlocks: [
      `$installerArgs += $("--sqlservername", "PutYourSqlServerSeenInSSMSHere")`,
      `store:///My/LocalMachine?FindByThumbprint=YourThumbprintHere`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Pages 41-46: Store Commerce APIs and Reference ──────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/view-pos-extension-package-details
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-apis
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/controls-pos-extension
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-dual-display-extension
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/consume-apis-pos
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/knockout-pos-extension

const POS_API_REFERENCE_ENTRIES: DocEntry[] = [
  {
    id: "pos-view-extension-packages",
    title: "View POS Extension Package Details — Loaded/Failed/Skipped Status in Settings",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/view-pos-extension-package-details",
    category: "pos-extensions",
    tags: [
      "extension-packages", "Settings", "POS-settings",
      "Loaded", "Failed", "Skipped",
      "View-details", "Status", "Name", "Path",
      "manifest.json", "extension-loader",
      "troubleshooting", "conflicting-extension",
      "Store-Commerce-for-web", "About", "Customization.settings",
      "dual-display",
    ],
    summary:
      "In POS Settings view, the Extension packages section lists all loaded extension packages with their status: Loaded (success), Failed (error during load), Skipped (excluded for current locale via supportedCountryRegions in manifest). Selecting 'View details' opens a detail view showing Status/Name/Path for each individual extension in the package, with errors in the right pane. Use this for troubleshooting conflicting or failed extensions. Note: Store Commerce for web does not show extension version in the About section — only in the Extension details section. Dual display custom control details do not appear in this view.",
    content: `
## View POS Extension Package Details

In the POS **Settings** view, the **Extension packages** section shows all POS extension packages included as part of the core POS.

---

## Extension Package Status

| Status | Meaning |
|---|---|
| **Loaded** | Extension package was successfully loaded |
| **Failed** | Extension package failed to load (check details for error) |
| **Skipped** | Package was skipped — not loaded for the current locale. The manifest \`supportedCountryRegions\` field can limit which locales load the package. |

---

## Extension Package Details View

Select **View details** on a package tile to open the detail view.

The detail view shows all individual extensions in the package with three columns:
- **Status** — success, failed, or skipped per extension
- **Name** — the extension type name
- **Path** — path of the implementation file in the package

When you select a line item, the right pane shows a description of the extension and any error details.

The information is based on the **manifest.json** file included in the extension package.

---

## Troubleshooting With This View

Use this view when:
- An extension doesn't appear to be working
- You suspect a conflicting extension
- You need to identify which specific file in a package is causing a load failure

---

## Store Commerce for Web Note

Store Commerce for web does **not** display the extension version in the **Customization.settings** file under the **About** section on the **Settings** page. It only shows the Microsoft app package version. Extension package versions are only visible from the **Extension details** section.

---

## Dual Display Note

Dual display custom control details and other dual-display extension information do **not** appear in the extension details view.
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-apis-reference",
    title: "POS APIs Reference — Cart, Payments, Peripherals, Device, Dialog, Customer, StoreOperations",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-apis",
    category: "pos-extensions",
    tags: [
      "POS-APIs", "Pos.Api.d.ts", "context.runtime.executeAsync",
      "PosApi/Consume", "ProxyEntities", "ClientEntities",
      "request-response",
      // Cart
      "GetCurrentCartClientRequest", "SaveAttributesOnCartClientRequest", "SaveExtensionPropertiesOnCartClientRequest",
      "AddItemToCartOperationRequest", "PriceOverrideOperationRequest", "VoidTransactionOperationRequest",
      "VoidCartLineOperationRequest", "SetCustomerOnCartOperationRequest", "RefreshCartClientRequest",
      "ReturnTransactionOperationRequest", "SuspendCurrentCartOperationRequest",
      "LineDiscountAmountOperationRequest", "TotalDiscountAmountOperationRequest",
      // Payments
      "GetGiftCardByIdServiceRequest", "GetSignatureClientRequest",
      // Device
      "GetConnectionStatusClientRequest", "GetDeviceConfigurationClientRequest", "TriggerToastNotificationClientRequest",
      // Dialog
      "ShowMessageDialogClientRequest", "ShowAlphanumericInputDialogClientRequest", "ShowNumericInputDialogClientRequest",
      // Customer
      "GetCustomerClientRequest", "CreateCustomerServiceRequest", "SelectCustomerClientRequest",
      // Employee
      "GetLoggedOnEmployeeClientRequest",
      // Products
      "GetProductsByIdsClientRequest", "SelectProductClientRequest", "GetActivePricesServiceRequest",
      // SalesOrders
      "GetReceiptsClientRequest", "PrintPackingSlipClientRequest",
      // StoreOperations
      "LoyaltyCardPointsBalanceOperationRequest", "RegisterCustomAuditEventClientRequest",
      "SaveFiscalTransactionClientRequest",
      "ICancelableDataResult",
    ],
    summary:
      "Complete POS API reference organized by module. Pattern: import { ApiName } from 'PosApi/Consume/ModuleName'; execute via this.context.runtime.executeAsync(request). All APIs use request/response pattern like CRT. Key modules: Cart (50+ APIs including GetCurrentCartClientRequest, SaveAttributesOnCartClientRequest, PriceOverrideOperationRequest, VoidTransactionOperationRequest), Payments (GetGiftCardByIdServiceRequest, GetSignatureClientRequest), Device (GetConnectionStatusClientRequest, TriggerToastNotificationClientRequest), Dialog (ShowMessageDialogClientRequest, ShowAlphanumericInputDialogClientRequest), Customer (GetCustomerClientRequest, SelectCustomerClientRequest), Employee (GetLoggedOnEmployeeClientRequest), Products (GetProductsByIdsClientRequest, GetActivePricesServiceRequest), SalesOrders (GetReceiptsClientRequest), StoreOperations (LoyaltyCardPointsBalanceOperationRequest, SaveFiscalTransactionClientRequest). Full list in Pos.Api.d.ts.",
    content: `
## POS APIs Reference

POS APIs use the same request/response pattern as CRT and Hardware Station.

> Full type declarations: **Pos.Api.d.ts** — included in the \`Microsoft.Dynamics.Commerce.Sdk.Pos\` NuGet package.
> Extensions must only use APIs exposed in Pos.Api.d.ts. Do not access POS commerce or session objects directly.

---

## How to Consume a POS API

\`\`\`typescript
// 1. Import from PosApi/Consume/<ModuleName>
import { SaveAttributesOnCartClientRequest, SaveAttributesOnCartClientResponse } from "PosApi/Consume/Cart";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";

// 2. Build the request and execute via context.runtime
let attr: ProxyEntities.AttributeTextValue = new ProxyEntities.AttributeTextValueClass();
attr.Name = "MyAttribute";
attr.TextValue = "Yes";

let request = new SaveAttributesOnCartClientRequest([attr]);
let result: ClientEntities.ICancelableDataResult<SaveAttributesOnCartClientResponse>
    = await this.context.runtime.executeAsync(request);
\`\`\`

Return type: \`Promise<ICancelableDataResult<TResponse>>\` — check \`result.canceled\` before using \`result.data\`.

---

## Cart APIs (\`PosApi/Consume/Cart\`)

| API | Description |
|---|---|
| \`GetCurrentCartClientRequest\` | Gets the current active cart |
| \`RefreshCartClientRequest\` | Refreshes cart from server |
| \`AddItemToCartOperationRequest\` | Adds items to cart |
| \`SaveAttributesOnCartClientRequest\` | Saves attributes on the cart |
| \`SaveAttributesOnCartLinesClientRequest\` | Saves attributes on cart lines |
| \`SaveExtensionPropertiesOnCartClientRequest\` | Saves extension properties on cart |
| \`SaveExtensionPropertiesOnCartLinesClientRequest\` | Saves extension properties on cart lines |
| \`PriceOverrideOperationRequest\` | Override price for a cart line |
| \`LineDiscountAmountOperationRequest\` | Add line discount amount |
| \`LineDiscountPercentOperationRequest\` | Add line discount percent |
| \`TotalDiscountAmountOperationRequest\` | Add total discount amount |
| \`TotalDiscountPercentOperationRequest\` | Add total discount percent |
| \`VoidCartLineOperationRequest\` | Void a cart line |
| \`VoidTransactionOperationRequest\` | Void the transaction |
| \`VoidTenderLineOperationRequest\` | Void a tender line |
| \`SetCustomerOnCartOperationRequest\` | Set customer on cart |
| \`SetTransactionCommentOperationRequest\` | Set transaction comment |
| \`SetCartLineCommentOperationRequest\` | Set cart line comment |
| \`SuspendCurrentCartOperationRequest\` | Suspend current transaction |
| \`ResumeSuspendedCartClientRequest\` | Resume suspended transaction by ID |
| \`ReturnTransactionOperationRequest\` | Return a transaction |
| \`ReturnCartLineOperationRequest\` | Return a cart line |
| \`CreateCustomerOrderOperationRequest\` | Create customer order |
| \`AddLoyaltyCardToCartOperationRequest\` | Add loyalty card |
| \`AddCouponsOperationRequest\` | Add coupon to transaction |
| \`ShipAllCartLinesOperationRequest\` | Ship all cart lines |
| \`ShipSelectedCartLinesOperationRequest\` | Ship selected cart lines |
| \`ConcludeTransactionClientRequest\` | Conclude the transaction |
| \`ShowChangeDueClientRequest\` | Show change due dialog |
| \`AddTenderLineToCartClientRequest\` | Add tender line to cart |
| \`DepositOverrideOperationRequest\` | Override deposit amount |
| \`PickupAllOperationRequest\` | Pick up the order |
| \`CalculateTotalOperationRequest\` | Calculate cart total |

---

## Payments APIs (\`PosApi/Consume/Payments\`)

| API | Description |
|---|---|
| \`GetGiftCardByIdServiceRequest\` | Gets gift card by ID |
| \`GetPaymentCardTypeByBinRangeClientRequest\` | Get card type from BIN range |
| \`GetSignatureClientRequest\` | Show signature capture dialog or send to device |

---

## Device APIs (\`PosApi/Consume/Device\`)

| API | Description |
|---|---|
| \`GetDeviceConfigurationClientRequest\` | Gets device configuration |
| \`GetConnectionStatusClientRequest\` | Gets online/offline status |
| \`GetHardwareProfileClientRequest\` | Gets hardware profile |
| \`GetAuthenticationTokenClientRequest\` | Gets auth token |
| \`GetActiveHardwareStationClientRequest\` | Gets active Hardware Station |
| \`GetChannelConfigurationClientRequest\` | Gets channel configuration |
| \`TriggerToastNotificationClientRequest\` | Shows toast notification in POS |

---

## Dialog APIs (\`PosApi/Consume/Dialogs\`)

| API | Description |
|---|---|
| \`ShowMessageDialogClientRequest\` | Shows message dialog |
| \`ShowAlphanumericInputDialogClientRequest\` | Shows alphanumeric input dialog |
| \`ShowNumericInputDialogClientRequest\` | Shows numeric input dialog |
| \`ShowListInputDialogClientRequest\` | Shows list selection dialog |
| \`ShowTextInputDialogClientRequest\` | Shows text input dialog |

---

## Customer APIs (\`PosApi/Consume/Customer\`)

| API | Description |
|---|---|
| \`GetCustomerClientRequest\` | Get customer by ID |
| \`SelectCustomerClientRequest\` | Show customer selection dialog |
| \`CreateCustomerServiceRequest\` | Create a new customer |
| \`UpdateCustomerServiceRequest\` | Update customer |

---

## Employee APIs (\`PosApi/Consume/Employee\`)

| API | Description |
|---|---|
| \`GetLoggedOnEmployeeClientRequest\` | Get current logged-in employee |
| \`SelectStoreEmployeeClientRequest\` | Show store employee selection |

---

## Products APIs (\`PosApi/Consume/Products\`)

| API | Description |
|---|---|
| \`GetProductsByIdsClientRequest\` | Get products by IDs |
| \`SelectProductClientRequest\` | Show product selection |
| \`SelectProductVariantClientRequest\` | Show variant selection |
| \`GetSerialNumberClientRequest\` | Get serial number |
| \`GetActivePricesServiceRequest\` | Get active prices |
| \`GetRefinerValuesByTextServiceRequest\` | Search refiners by text |

---

## SalesOrders APIs (\`PosApi/Consume/SalesOrders\`)

| API | Description |
|---|---|
| \`GetReceiptsClientRequest\` | Get receipts for transaction |
| \`GetGiftReceiptsClientRequest\` | Get gift receipts |
| \`GetSalesOrderDetailsByTransactionIdClientRequest\` | Get sales order details |
| \`PrintPackingSlipClientRequest\` | Print packing slip |
| \`MarkAsPickedServiceRequest\` | Mark lines as picked |

---

## StoreOperations APIs (\`PosApi/Consume/StoreOperations\`)

| API | Description |
|---|---|
| \`LoyaltyCardPointsBalanceOperationRequest\` | Get loyalty card balance |
| \`IssueLoyaltyCardOperationRequest\` | Issue loyalty card |
| \`RegisterCustomAuditEventClientRequest\` | Register custom audit event |
| \`SaveFiscalTransactionClientRequest\` | Save fiscal transaction |
| \`GetOfflinePendingTransactionCountClientRequest\` | Get offline pending transaction count |
| \`TenderDeclarationOperationRequest\` | Tender declaration |
| \`TenderRemovalOperationRequest\` | Tender removal |
| \`SafeDropOperationRequest\` | Safe drop |
| \`BankDropOperationRequest\` | Bank drop |
| \`GetAllDiscountsServiceRequest\` | Get all applicable discounts for cart |
| \`GetCurrenciesServiceRequest\` | Get store currencies |
| \`GetPickingAndReceivingOrdersClientRequest\` | Get picking and receiving orders |

---

## Toast Notification Example

\`\`\`typescript
import { TriggerToastNotificationClientRequest, TriggerToastNotificationClientResponse }
    from "PosApi/Consume/Device";
import { ClientEntities } from "PosApi/Entities";

const contentProps: ClientEntities.IToastNotificationComponentContent = {
    notificationTitle: "My Extension",
    notificationBody: "Operation completed successfully",
    primaryFooterButton: { label: "OK", action: () => {} },
    notificationMessageType: ClientEntities.ToastMessageType.WARNING
};

await this.context.runtime.executeAsync(
    new TriggerToastNotificationClientRequest("correlationId", contentProps)
);
\`\`\`
`.trim(),
    codeBlocks: [
      `import { SaveAttributesOnCartClientRequest, SaveAttributesOnCartClientResponse } from "PosApi/Consume/Cart";
let request = new SaveAttributesOnCartClientRequest([attr]);
let result = await this.context.runtime.executeAsync(request);`,
      `import { TriggerToastNotificationClientRequest } from "PosApi/Consume/Device";
await this.context.runtime.executeAsync(new TriggerToastNotificationClientRequest("id", contentProps));`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-controls-extension",
    title: "Use POS Controls in Extensions — DataList, DatePicker, NumPad, Toggle, Menu, TimePicker",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/controls-pos-extension",
    category: "pos-extensions",
    tags: [
      "PosApi/Consume/Controls", "controlFactory",
      "DataList", "IDataList", "IPaginatedDataList", "IDataListOptions", "DataListInteractionMode",
      "DatePicker", "IDatePicker",
      "Menu", "IMenu",
      "NumPad", "IAlphanumericNumPad", "ICurrencyNumPad", "INumericNumPad", "ITransactionNumPad",
      "TimePicker", "ITimePicker",
      "Toggle", "IToggle",
      "context.controlFactory.create",
      "onReady", "HTMLElement", "CustomViewControllerBase",
      "SelectionChanged", "addEventListener",
      "Dynamics365Commerce.InStore", "PosSample", "10.0.18",
    ],
    summary:
      "PosApi/Consume/Controls provides standard POS UI controls for consistent look and feel in extensions. Create instances via context.controlFactory.create(correlationId, controlType, options, element). Supported controls: DataList (IDataList/IPaginatedDataList — responsive list with columns, SingleSelect/MultiSelect modes), DatePicker (IDatePicker), Menu (IMenu — contextual info), NumPad variants (IAlphanumericNumPad, ICurrencyNumPad, INumericNumPad, ITransactionNumPad), TimePicker (ITimePicker), Toggle (IToggle). Use in onReady(element: HTMLElement) of custom view controllers, dialogs, and custom controls.",
    content: `
## Use POS Controls in Extensions

The \`PosApi/Consume/Controls\` module provides standard POS UI controls so your extension matches the native POS look and feel.

Create control instances using the **control factory** from the extension context — do NOT instantiate them directly.

\`\`\`typescript
this.context.controlFactory.create(correlationId, "ControlType", options, htmlElement);
\`\`\`

---

## Available POS Controls

| Control | Interface(s) | Description |
|---|---|---|
| **Data List** | \`IDataList\`, \`IPaginatedDataList\` | Responsive list control for showing rows of data. Supports SingleSelect and MultiSelect modes. |
| **Date Picker** | \`IDatePicker\` | Standard POS date picker control |
| **Menu** | \`IMenu\` | Contextual menu control |
| **Number Pad** | \`IAlphanumericNumPad\` | Accepts alphanumeric input |
| **Number Pad** | \`ICurrencyNumPad\` | Accepts monetary values |
| **Number Pad** | \`INumericNumPad\` | Accepts numeric values only |
| **Number Pad** | \`ITransactionNumPad\` | Accepts item identifiers or quantities (transaction scenarios) |
| **Time Picker** | \`ITimePicker\` | Standard POS time picker control |
| **Toggle** | \`IToggle\` | Toggle switch control |

---

## DataList Example

Create a DataList in the \`onReady\` function of a custom view controller:

\`\`\`typescript
public onReady(element: HTMLElement): void {
    let dataListOptions: IDataListOptions<Entities.ExampleEntity> = {
        interactionMode: DataListInteractionMode.SingleSelect,
        data: this.viewModel.loadedData,
        columns: [
            {
                title: this.context.resources.getString("string_1001"),
                ratio: 40, collapseOrder: 1, minWidth: 100,
                computeValue: (data: Entities.ExampleEntity): string => data.IntData.toString()
            },
            {
                title: this.context.resources.getString("string_1002"),
                ratio: 60, collapseOrder: 2, minWidth: 100,
                computeValue: (data: Entities.ExampleEntity): string => data.StringData
            }
        ]
    };

    let rootElem = element.querySelector("#exampleListView") as HTMLDivElement;
    this.dataList = this.context.controlFactory.create(
        this.context.logger.getNewCorrelationId(),
        "DataList",
        dataListOptions,
        rootElem
    );

    this.dataList.addEventListener("SelectionChanged", (eventData: { items: Entities.ExampleEntity[] }) => {
        this.viewModel.selectionChanged(eventData.items);
    });

    this.viewModel.load().then((): void => {
        this.dataList.data = this.viewModel.loadedData;
    });
}
\`\`\`

---

## Where to Use Controls

Controls can be used inside:
- **Custom view controllers** (classes extending \`CustomViewControllerBase\`) — in \`onReady(element)\`
- **Custom dialog controllers**
- **Custom controls** (for dual display or other extension points)

---

## More Samples

See the [PosSample folder](https://github.com/microsoft/Dynamics365Commerce.InStore/tree/release/9.28/src/PosSample) in the GitHub repo for complete examples of each control type.
`.trim(),
    codeBlocks: [
      `this.context.controlFactory.create(correlationId, "DataList", dataListOptions, rootElem);`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-dual-display-extension",
    title: "Extend POS Dual Display View — DualDisplayCustomControlBase, CartChangedData, manifest dualDisplay",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-dual-display-extension",
    category: "pos-extensions",
    tags: [
      "dual-display", "DualDisplayCustomControlBase", "IDualDisplayCustomControlContext",
      "IDualDisplayCustomControlState",
      "CartChangedData", "CustomerChangedData", "LogOnStatusChangedData",
      "cartChangedHandler", "customerChangedHandler", "logOnStatusChangedHandler",
      "PosApi/Extend/DualDisplay",
      "dualDisplay", "customControl", "controlName", "htmlPath", "modulePath",
      "manifest.json", "components.dualDisplay",
      "hardware-profile", "Dual-display-in-use", "1090",
      "onReady", "init", "ko.observable", "ko.computed",
      "data-bind", "msPosDataList",
      "resources.resjson", "supportedUICultures",
    ],
    summary:
      "Extend POS Dual display by adding a custom control that overrides the standard content. Extend DualDisplayCustomControlBase from PosApi/Extend/DualDisplay — receive cart/customer/employee state changes via cartChangedHandler, customerChangedHandler, logOnStatusChangedHandler. Implement onReady(element) to bind HTML template using ko.applyBindingsToNode, and init(state) to set initial state. Register in manifest.json under components.dualDisplay.customControl (controlName, htmlPath, modulePath). Prerequisites: enable Dual display in hardware profile (Dual display in use = Yes) + run CDX 1090 job. Note: dual display details do not appear in the extension details view in POS Settings.",
    content: `
## Extend POS Dual Display View

The dual display is a secondary screen shown to customers during a transaction (cart details, total, customer info, employee info).

Extend it by adding a **custom control** that completely **overrides** the standard dual display content.

> **Note:** The custom control overrides all standard content. Dual display details do not appear in the POS Settings extension details view.

---

## Step 1: Enable Dual Display in Hardware Profile

1. Go to **Retail and Commerce → Channel setup → POS setup → POS profiles → Hardware profiles**
2. Select the profile linked to your register
3. On the **Dual display** tab → set **Dual display in use** = **Yes**
4. Go to **Distribution schedule** → run job **1090 (Registers)**

---

## Step 2: Create the Custom Control TypeScript Class

Extend \`DualDisplayCustomControlBase\` from \`PosApi/Extend/DualDisplay\`:

\`\`\`typescript
import {
    DualDisplayCustomControlBase,
    IDualDisplayCustomControlState,
    IDualDisplayCustomControlContext,
    CartChangedData,
    CustomerChangedData,
    LogOnStatusChangedData
} from "PosApi/Extend/DualDisplay";

export default class DualDisplayCustomControl extends DualDisplayCustomControlBase {
    private static readonly TEMPLATE_ID: string = "Microsoft_Pos_Extensibility_Samples_DualDisplay";

    constructor(id: string, context: IDualDisplayCustomControlContext) {
        super(id, context);

        // Register event handlers for state changes
        this.cartChangedHandler = (data: CartChangedData) => {
            // data.cart contains the updated cart
        };
        this.customerChangedHandler = (data: CustomerChangedData) => {
            // data.customer contains the updated customer
        };
        this.logOnStatusChangedHandler = (data: LogOnStatusChangedData) => {
            // data.loggedOn boolean, data.employee object
        };
    }

    // Bind HTML template to DOM element
    public onReady(element: HTMLElement): void {
        ko.applyBindingsToNode(element, {
            template: {
                name: DualDisplayCustomControl.TEMPLATE_ID,
                data: this
            }
        });
    }

    // Set initial state
    public init(state: IDualDisplayCustomControlState): void {
        // state.cart, state.customer, state.loggedOn, state.employee
    }
}
\`\`\`

---

## Step 3: Create the HTML Template

Use an HTML file with a \`<script type="text/html">\` block. The \`id\` attribute must match the \`TEMPLATE_ID\` constant.

\`\`\`html
<script id="Microsoft_Pos_Extensibility_Samples_DualDisplay" type="text/html">
<div class="height100Percent width100Percent">
    <div id="dualDisplayDataListSample" data-bind="msPosDataList: cartLinesDataList"></div>
    <h2 data-bind="text: cartTotalAmount"></h2>
    <h2 data-bind="text: customerName"></h2>
    <h2 data-bind="text: isLoggedOn() ? 'logged in' : 'logged out'"></h2>
    <h2 data-bind="text: employeeName"></h2>
</div>
</script>
\`\`\`

---

## Step 4: Register in manifest.json

\`\`\`json
{
    "$schema": "../manifestSchema.json",
    "name": "Pos_Extensibility_DualDisplaySample",
    "publisher": "Microsoft",
    "version": "7.2.0",
    "minimumPosVersion": "7.2.0.0",
    "components": {
        "resources": {
            "supportedUICultures": [ "en-US" ],
            "fallbackUICulture": "en-US",
            "culturesDirectoryPath": "Resources/Strings",
            "stringResourcesFileName": "resources.resjson"
        },
        "dualDisplay": {
            "customControl": {
                "controlName": "DualDisplayCustomControl",
                "htmlPath": "CustomControl/DualDisplayCustomControl.html",
                "modulePath": "CustomControl/DualDisplayCustomControl"
            }
        }
    }
}
\`\`\`

---

## Event Handlers Summary

| Handler | Fires when | Data available |
|---|---|---|
| \`cartChangedHandler\` | Cart is updated | \`data.cart\` (full Cart entity) |
| \`customerChangedHandler\` | Customer changes on cart | \`data.customer\` (Customer entity) |
| \`logOnStatusChangedHandler\` | Cashier logs on/off | \`data.loggedOn\` (bool), \`data.employee\` (Employee entity) |
`.trim(),
    codeBlocks: [
      `import { DualDisplayCustomControlBase } from "PosApi/Extend/DualDisplay";
export default class DualDisplayCustomControl extends DualDisplayCustomControlBase {
    this.cartChangedHandler = (data: CartChangedData) => { /* data.cart */ };
    this.customerChangedHandler = (data: CustomerChangedData) => { /* data.customer */ };
    this.logOnStatusChangedHandler = (data: LogOnStatusChangedData) => { /* data.loggedOn, data.employee */ };
}`,
      `"dualDisplay": {
    "customControl": {
        "controlName": "DualDisplayCustomControl",
        "htmlPath": "CustomControl/DualDisplayCustomControl.html",
        "modulePath": "CustomControl/DualDisplayCustomControl"
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-consume-custom-apis",
    title: "Consume Custom Headless Commerce APIs in POS — TypeScript Proxy Auto-Generation",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/consume-apis-pos",
    category: "pos-extensions",
    tags: [
      "TypeScript-proxy", "auto-generation", "DataService",
      "DataServiceEntities.g.ts", "DataServiceRequests.g.ts",
      "DataService.g", "CRT-project-reference",
      "Microsoft.Dynamics.Commerce.Sdk.Runtime", "Microsoft.Dynamics.Commerce.Sdk.Pos",
      "headless-Commerce", "custom-API", "IController",
      "context.runtime.executeAsync",
      "GetStoreDaysByStoreRequest", "GetStoreDaysByStoreResponse",
      "StoreHours", "PreProductSaleTrigger",
      "ProxyEntities", "ClientEntities",
      "10.0.18",
    ],
    summary:
      "To consume custom CRT/Retail Server APIs from POS: (1) CRT project must reference Microsoft.Dynamics.Commerce.Sdk.Runtime; (2) POS extension project must reference Microsoft.Dynamics.Commerce.Sdk.Pos; (3) Add project reference from POS project to the CRT project; (4) Build POS project — auto-generates DataServiceEntities.g.ts and DataServiceRequests.g.ts in a DataService/ folder; (5) Import generated types and call via context.runtime.executeAsync. No manual proxy generation or CommerceProxyGenerator needed in the independent packaging model.",
    content: `
## Consume Custom Headless Commerce APIs in POS

In the independent packaging model, the TypeScript proxy for your custom CRT/Retail Server APIs is **automatically generated** at build time — no manual proxy generation needed.

---

## Setup Steps

1. **CRT project** must reference: \`Microsoft.Dynamics.Commerce.Sdk.Runtime\` NuGet package

2. **POS extension project** must reference: \`Microsoft.Dynamics.Commerce.Sdk.Pos\` NuGet package

3. Add a **project reference** from your POS extension project → to the CRT project that defines your APIs

4. **Build** your POS extension project

   The build auto-generates two TypeScript files in a \`DataService/\` folder in your project root:
   - \`DataServiceEntities.g.ts\` — TypeScript entity types for all referenced CRT extension projects
   - \`DataServiceRequests.g.ts\` — TypeScript data service request/response types

5. **Import** and use the generated types in your POS extension code

---

## Usage Example

\`\`\`typescript
import * as Triggers from "PosApi/Extend/Triggers/ProductTriggers";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { ClientEntities } from "PosApi/Entities";
import { StoreHours } from "../DataService/DataService.g";

export default class PreProductSaleTrigger extends Triggers.PreProductSaleTrigger {
    public execute(options: Triggers.IPreProductSaleTriggerOptions): Promise<ClientEntities.ICancelable> {
        if (ObjectExtensions.isNullOrUndefined(options)) {
            let error = new ClientEntities.ExtensionError("Invalid options");
            return Promise.reject(error);
        } else {
            // Call your custom CRT API via the generated proxy
            return this._context.runtime.executeAsync(
                new StoreHours.GetStoreDaysByStoreRequest<StoreHours.GetStoreDaysByStoreResponse>(0)
            );
        }
    }
}
\`\`\`

---

## Key Points

- The \`DataService/\` folder and its \`.g.ts\` files are **auto-generated on every build** — do not edit them manually
- The generated file names follow the pattern of your CRT namespace
- If multiple CRT projects are referenced, their entities and requests are merged into the generated files
- This replaces the old manual \`CommerceProxyGenerator\` workflow from the legacy Retail SDK
`.trim(),
    codeBlocks: [
      `import { StoreHours } from "../DataService/DataService.g";
return this._context.runtime.executeAsync(
    new StoreHours.GetStoreDaysByStoreRequest<StoreHours.GetStoreDaysByStoreResponse>(0)
);`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-knockout-extension",
    title: "Use Knockout.js in POS Extensions — Bundle, manifest dependencies, tsconfig paths, ApplicationStart trigger",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/knockout-pos-extension",
    category: "pos-extensions",
    tags: [
      "Knockout.js", "ko", "knockout",
      "knockoutjs", "NuGet",
      "MSBuild", "ContentIncludeKnockoutLibrary", "BeforeTargets",
      "Libraries/knockout", "KnockoutjsFile",
      "manifest.json", "dependencies", "alias", "format", "amd", "modulePath",
      "tsconfig.json", "paths", "baseUrl", "noImplicitAny",
      "knockout.d.ts", "type-declarations",
      "ApplicationStartTrigger", "__posStopExtensionsBinding",
      "import ko from knockout",
      "ko.observable", "ko.computed", "ko.applyBindingsToNode",
      "collision", "independent-packaging", "10.0.18",
    ],
    summary:
      "Knockout.js global variable (ko) is not available in the independent packaging model. To use Knockout.js: (1) add knockoutjs NuGet reference to POS.Extensions project; (2) add MSBuild target to copy knockout.js to Libraries/ folder; (3) declare in manifest.json dependencies array (alias: 'knockout', format: 'amd', modulePath: 'Libraries/knockout'); (4) add knockout.d.ts to project and configure tsconfig.json paths alias pointing to it; (5) create ApplicationStart trigger registering __posStopExtensionsBinding to prevent collision with other knockout versions; (6) import via 'import ko from \"knockout\"'. The alias name in tsconfig, manifest, and import must all match.",
    content: `
## Use Knockout.js in POS Extensions (Independent Packaging)

In the sealed/independent packaging model, the global \`ko\` variable is **not available**. You must bundle your own copy of Knockout.js inside your extension package.

---

## Step 1: Add knockoutjs NuGet Reference

Add the \`knockoutjs\` NuGet package to your \`Pos.Extensions\` project.

---

## Step 2: Add MSBuild Target to Copy knockout.js

In your \`.csproj\` file, add a target to copy the library to your project directory during the build:

\`\`\`xml
<Target Name="ContentIncludeKnockoutLibrary" BeforeTargets="AssignTargetPaths" DependsOnTargets="RunResolvePackageDependencies">
    <PropertyGroup>
        <KnockoutjsFile>Libraries/knockout.js</KnockoutjsFile>
        <KnockoutLibraryFilePath Condition="'%(PackageDefinitions.Name)' == 'knockoutjs'">
            %(PackageDefinitions.ResolvedPath)\Content\Scripts\knockout-%(PackageDefinitions.Version).js
        </KnockoutLibraryFilePath>
    </PropertyGroup>
    <Copy SourceFiles="\$(KnockoutLibraryFilePath)" DestinationFiles="\$(KnockoutjsFile)" SkipUnchangedFiles="true" />
    <ItemGroup>
        <Content Include="\$(KnockoutjsFile)"></Content>
    </ItemGroup>
</Target>
\`\`\`

---

## Step 3: Register in manifest.json Dependencies

\`\`\`json
{
    "dependencies": [
        {
            "alias": "knockout",
            "format": "amd",
            "modulePath": "Libraries/knockout"
        }
    ]
}
\`\`\`

> **Note:** \`modulePath\` must match the \`KnockoutjsFile\` variable in the MSBuild target (without the .js extension). If knockout depends on other libraries, include those too.

---

## Step 4: Add TypeScript Type Declarations

1. Download the knockout source zip from the official releases (same version as in NuGet)
2. Extract — type declarations are at \`<knockout_folder>\build\types\knockout.d.ts\`
3. Copy \`knockout.d.ts\` to any folder in your extension project (e.g., \`Libraries/\`)
4. Update \`tsconfig.json\` with a paths alias:

\`\`\`json
{
    "extends": "./devDependencies/pos-tsconfig-base.json",
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "knockout": [ "Libraries/knockout" ]
        },
        "noImplicitAny": false
    }
}
\`\`\`

> The alias name (\`"knockout"\`) must match the \`alias\` in \`manifest.json\` and the import statement.

---

## Step 5: Register ApplicationStart Trigger to Prevent Collisions

Create an \`ApplicationStartTrigger\` that registers the \`__posStopExtensionsBinding\` handler to prevent conflicts between your bundled knockout version and any other knockout version in POS:

\`\`\`typescript
import { ApplicationStartTrigger } from "PosApi/Extend/Triggers/ApplicationTriggers";

export default class KnockoutSetupTrigger extends ApplicationStartTrigger {
    public execute(options): Promise<void> {
        // Register handler to prevent knockout collision
        (window as any).__posStopExtensionsBinding = true;
        return Promise.resolve();
    }
}
\`\`\`

See [POS extension samples on GitHub](https://github.com/microsoft/Dynamics365Commerce.InStore/tree/release/9.28/src/PosSample/Pos.Extension) for a complete example.

---

## Step 6: Import and Use Knockout.js

\`\`\`typescript
import ko from "knockout"; // alias must match tsconfig and manifest

// Now use ko.observable, ko.computed, ko.applyBindingsToNode as normal
const myValue = ko.observable("initial");
\`\`\`
`.trim(),
    codeBlocks: [
      `"dependencies": [
    {
        "alias": "knockout",
        "format": "amd",
        "modulePath": "Libraries/knockout"
    }
]`,
      `{
    "extends": "./devDependencies/pos-tsconfig-base.json",
    "compilerOptions": {
        "baseUrl": ".",
        "paths": { "knockout": [ "Libraries/knockout" ] },
        "noImplicitAny": false
    }
}`,
      `import ko from "knockout";`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Pages 47-53: Store Commerce (POS) Extensions ────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/pos-extension-overview
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/pos-extension-basics
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/migrate-pos-extension
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/create-pos-extension-package
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/sc-debug
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/create-pos-extension-appx
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/debug-pos-extension

const POS_EXTENSION_ENTRIES: DocEntry[] = [
  {
    id: "pos-extension-overview",
    title: "POS Extension Overview — Store Commerce, MPOS, CPOS Extension Model",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/pos-extension-overview",
    category: "pos-extensions",
    tags: [
      "POS", "Store-Commerce", "MPOS", "CPOS", "Store-Commerce-for-web",
      "Store-Commerce-iOS", "Store-Commerce-Android",
      "pos-extension", "independent-packaging", "sealed-SDK",
      "triggers", "views", "operations", "request-handlers", "controls",
      "app-bar", "custom-columns", "UX", "UI", "TypeScript",
      "Commerce-SDK", "10.0.18", "screen-layout-designer",
      "PosApi", "manifest.json", "extension-package",
    ],
    summary:
      "Overview of POS extensibility using the independent packaging model (Commerce SDK 10.0.18+). You can extend POS UI (custom columns, app bar buttons, controls, cart view), override business logic (request handlers), add pre/post triggers, consume POS APIs, add custom views/APIs, and add custom operations. Applies to Store Commerce (Windows Chromium), Store Commerce for web (browser), MPOS (legacy UWP), and mobile shell apps (iOS/Android) — same code base, cross-app without rewriting.",
    content: `
## POS Extension Overview

POS extensions use the independent packaging model with the sealed Commerce SDK (version 10.0.18+).

> **Retail SDK ended October 2023** — use or migrate to Commerce SDK.

---

## What You Can Extend

| Extension Point | Description |
|---|---|
| **Extend POS UI** | Add custom columns, app bar buttons, and custom controls per view. Configure cart view and welcome page via screen layout designer. |
| **Override business logic** | Override POS request handlers to add custom logic. |
| **Pre/post triggers** | Run custom logic before or after any POS operation. |
| **Consume POS APIs** | Use POS-exposed APIs and UX controls in extension scenarios. |
| **Custom views and APIs** | Add new views and APIs that support new functionality. |
| **Custom operations** | Add custom operations to perform custom functionality. |

---

## Supported POS Apps

All apps share the same code base — one extension works across all without code duplication.

| App | Description |
|---|---|
| **Store Commerce** | Windows app (Microsoft Store) running Chromium engine. Replaces MPOS. Default POS for D365 Commerce. Full functional parity with MPOS. |
| **Store Commerce for web** | Hosted POS running in a browser. Deployed in the cloud. |
| **MPOS** | Legacy UWP Windows app. Support ended October 2023. Replaced by Store Commerce. |
| **Store Commerce for iOS** | Shell app hosting Store Commerce for web. Supports peripheral connectivity. |
| **Store Commerce for Android** | Shell app hosting Store Commerce for web. Supports peripheral connectivity. |

---

## Key Concepts

- **Extension point** — specific location where POS can be extended (e.g., PreOperationTrigger, new view)
- **Extension** — individual component that implements an extension point
- **Extension package** — set of extensions that together enable a custom end-to-end POS scenario
- Extensions can be either *Extend* (modify existing) or *Create* (add new functionality)

---

## POS Extension Development Flow

1. Create a POS Extension Package project (.NET Standard 2.0 class library)
2. Add \`Microsoft.Dynamics.Commerce.Sdk.Pos\` NuGet
3. Write TypeScript extensions importing from \`PosApi/*\`
4. Define \`manifest.json\` listing all components
5. Register the package in CRT via \`GetExtensionPackageDefinitionsRequest\` trigger
6. For Store Commerce: build → install; For CPOS: symlink in Extensions folder; For MPOS: build + deploy .appx
`.trim(),
    codeBlocks: [],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-extension-basics",
    title: "POS Extension Basics — PosApi Library, manifest.json Schema, Extension Registration",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/pos-extension-basics",
    category: "pos-extensions",
    tags: [
      "PosApi", "manifest.json", "manifestSchema.json",
      "Extend", "Create", "Consume",
      "PosApi/Extend/Views/CustomerDetailsView", "PosApi/Extend/Triggers/ProductTriggers",
      "PosApi/Create/Views", "PosApi/Consume/Controls",
      "ApplicationStartTrigger", "CustomViewControllerBase",
      "GetExtensionPackageDefinitionsRequest", "GetExtensionPackageDefinitionsResponse",
      "ExtensionPackageDefinition", "DefinePosExtensionPackageTrigger",
      "IRequestTrigger", "PackageName", "Publisher",
      "name", "publisher", "version", "minimumPosVersion", "supportedCountryRegions", "components",
      "Pos.Api.d.ts", "Microsoft.Dynamics.Commerce.Sdk.Pos",
      "default-export", "non-relative-import",
    ],
    summary:
      "POS API library has three module groups: Extend (modify existing POS components by view/feature area), Create (new components/views), Consume (run POS functionality from extensions). All extension classes inherit from a PosApi base class, use a single default export, and import via non-relative paths (e.g., 'PosApi/Extend/Triggers/ProductTriggers'). manifest.json fields: name, description, publisher, version, minimumPosVersion, supportedCountryRegions, components. Register extension packages in CRT via a post-trigger on GetExtensionPackageDefinitionsRequest that adds an ExtensionPackageDefinition (Name must match PackageName, Publisher must match manifest.json publisher).",
    content: `
## POS API Library Structure

The POS API library (type declarations in \`Pos.Api.d.ts\` inside \`Microsoft.Dynamics.Commerce.Sdk.Pos\` NuGet) is organized into three groups:

| Module Group | Purpose | Example Module |
|---|---|---|
| **Extend** | Modify existing POS components | \`PosApi/Extend/Views/CustomerDetailsView\` |
| **Extend** | Add triggers | \`PosApi/Extend/Triggers/ProductTriggers\` |
| **Create** | New components and functionality | \`PosApi/Create/Views\` |
| **Consume** | Run POS functionality from extensions | \`PosApi/Consume/Controls\` |

---

## Extension Class Structure

Every extension module must:
- Import from a POS API module using **non-relative imports**
- Inherit from the applicable **PosApi base class**
- Have a **single default export** of the extension class

\`\`\`typescript
import { ApplicationStartTrigger } from "PosApi/Extend/Triggers/ApplicationTriggers";

export default class MyCustomApplicationStartTrigger extends ApplicationStartTrigger {
    public execute(options): Promise<void> {
        return Promise.resolve();
    }
}
\`\`\`

---

## manifest.json Fields

| Field | Required | Description |
|---|---|---|
| \`name\` | Yes | Package name — must match \`PackageName\` in CRT ExtensionPackageDefinition |
| \`description\` | Yes | Description of package functionality |
| \`publisher\` | Yes | Publisher name — must match ExtensionPackageDefinition |
| \`version\` | Yes | Semantic versioning (e.g., \`1.0.0\`) |
| \`minimumPosVersion\` | Yes | Minimum POS version (e.g., \`9.28.0.0\`). If extension package version is later than installed POS, it won't load. |
| \`supportedCountryRegions\` | No | Optional list of country/region codes. Omit to load in all regions. |
| \`components\` | Yes | List of extensions in the package |

\`\`\`json
{
    "$schema": "./devDependencies/schemas/manifestSchema.json",
    "name": "Contoso.Pos.Developer.Samples",
    "publisher": "Contoso",
    "version": "1.0.0",
    "minimumPosVersion": "9.28.0.0",
    "description": "An extension package containing POS developer samples."
}
\`\`\`

---

## Register Extension Package in CRT

POS calls \`GetExtensionPackageDefinitions\` CRT API to get the list of extension packages to load.
Add a **post-trigger** on \`GetExtensionPackageDefinitionsRequest\` that appends your \`ExtensionPackageDefinition\`.

\`\`\`csharp
public class DefinePosExtensionPackageTrigger : IRequestTrigger
{
    public IEnumerable<Type> SupportedRequestTypes
    {
        get { return new[] { typeof(GetExtensionPackageDefinitionsRequest) }; }
    }

    public void OnExecuted(Request request, Response response)
    {
        var getExtensionsResponse = (GetExtensionPackageDefinitionsResponse)response;
        var extensionPackageDefinition = new ExtensionPackageDefinition();

        // Must match the PackageName used when packaging
        extensionPackageDefinition.Name = "Contoso.Commerce";
        extensionPackageDefinition.Publisher = "Contoso";
        extensionPackageDefinition.IsEnabled = true;

        getExtensionsResponse.ExtensionPackageDefinitions.Add(extensionPackageDefinition);
    }

    public void OnExecuting(Request request) { }
}
\`\`\`

**Critical:** \`ExtensionPackageDefinition.Name\` must exactly match the \`PackageName\` property of the extension package project (the value used when building). \`Publisher\` must match the \`publisher\` field in \`manifest.json\`.
`.trim(),
    codeBlocks: [
      `import { ApplicationStartTrigger } from "PosApi/Extend/Triggers/ApplicationTriggers";
export default class MyCustomApplicationStartTrigger extends ApplicationStartTrigger {
    public execute(options): Promise<void> {
        return Promise.resolve();
    }
}`,
      `{
    "$schema": "./devDependencies/schemas/manifestSchema.json",
    "name": "Contoso.Pos.Developer.Samples",
    "publisher": "Contoso",
    "version": "1.0.0",
    "minimumPosVersion": "9.28.0.0",
    "description": "An extension package containing POS developer samples."
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-migrate-extension",
    title: "Migrate POS Extension to Independent Packaging Model — From Retail SDK to Commerce SDK",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/migrate-pos-extension",
    category: "pos-extensions",
    tags: [
      "migration", "independent-packaging", "sealed-SDK", "Retail-SDK",
      "Pos.UI.Sdk", "Knockout.js", "ko",
      "ExtensionViewControllerBase", "CustomViewControllerBase",
      "extensions.json", "GetExtensionPackageDefinitionsRequest",
      "PosApi/Consume/Controls", "knockout.d.ts",
      "CommerceProxyGenerator", "TypeScript-proxy",
      "NuGet", "no-code-merge", "version-update",
      "Pos.Extensions", "manifest.json", "manifestSchema.json",
      "10.0.18",
    ],
    summary:
      "Migration from Retail SDK Pos.Extensions project to independent packaging model: (1) Create new POS Extension Package project per create-pos-extension-package guide; (2) Copy source files from Pos.Extensions dir (not build artifacts); (3) Update manifest.json $schema reference; (4) Replace Pos.UI.Sdk references with PosApi/Consume/Controls; (5) Replace global Knockout.js (ko variable) with bundled copy in extension; (6) Replace ExtensionViewControllerBase with CustomViewControllerBase (header/nav bars now auto-shown). Key benefits: no code merge on updates, TypeScript proxy auto-generated at build, automated packaging, faster builds.",
    content: `
## Migrate POS Extension to Independent Packaging Model

The independent packaging model separates extension code from the Retail SDK — update to latest SDK by just updating NuGet package versions (no code merge required).

> **Retail SDK ended October 2023.** All new development and extensions must use the Commerce SDK independent packaging model.

---

## Benefits of Independent Packaging Model

| Benefit | Detail |
|---|---|
| **No code merge on updates** | Only maintain your extension. Update = update NuGet version. No need to maintain full Retail SDK in repo or compile POS.App. |
| **Auto TypeScript proxy** | TypeScript code for data service requests/entities is auto-generated at build. No more manual CommerceProxyGenerator runs. |
| **Automated packaging** | Extension config files for offline and Hardware Station auto-generated. Assemblies auto-included in MPOS package. No manual Customization.settings edits. |
| **Faster builds** | Only build your Commerce extension solution, not the full SDK. |

---

## Breaking Changes in Independent Packaging Model

### 1. Pos.UI.Sdk Library Removed
The \`Pos.UI.Sdk\` library (Knockout.js dependent) is replaced by library-agnostic \`PosApi/Consume/Controls\` APIs.

Migration: Search for \`PosUISdk\` in your solution → replace each control with the equivalent from \`PosApi/Consume/Controls\`.

### 2. Global Knockout.js Removed
The global \`ko\` variable is no longer available in extensions. The \`knockout.d.ts\` file is removed from the SDK.

Migration: Bundle your own copy of Knockout.js inside the extension package if needed. See [Use Knockout.js in POS extensions](knockout-pos-extension).

### 3. ExtensionViewControllerBase → CustomViewControllerBase
\`ExtensionViewControllerBase\` is not supported in independent packaging. Extension views MUST use \`CustomViewControllerBase\`.

Key difference: With \`CustomViewControllerBase\`, header and navigation bars are **automatically shown** — no manual configuration needed.

### 4. Extension Loading Changed
Old: Single \`extensions.json\` file listed extension packages.
New: POS calls headless Commerce engine — configure via CRT trigger on \`GetExtensionPackageDefinitionsRequest\`.

---

## Migration Steps

1. Follow [Create a POS Extension Package project](create-pos-extension-package) guide to create the new project structure.

2. Copy source files from the \`Pos.Extensions\` project directory to the new project root.
   - Copy only **source files** (not build artifacts like \`.js\`, \`.d.ts\`, \`node_modules\`)
   - After copying, \`manifest.json\` should be in the project root

3. Update the \`$schema\` reference in \`manifest.json\`:
   \`\`\`json
   "$schema": "./devDependencies/schemas/manifestSchema.json"
   \`\`\`

4. **(If using Pos.UI.Sdk)** Replace all POS UI SDK controls with \`PosApi/Consume/Controls\` equivalents.

5. **(If using Knockout.js)** Bundle your own copy of Knockout.js inside the extension package.

6. Replace all \`ExtensionViewControllerBase\` usages with \`CustomViewControllerBase\`.

7. Build the project and verify it compiles successfully.
`.trim(),
    codeBlocks: [
      `"$schema": "./devDependencies/schemas/manifestSchema.json"`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-create-extension-package",
    title: "Create a POS Extension Package Project — .NET Standard 2.0, Microsoft.Dynamics.Commerce.Sdk.Pos, tsconfig.json",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/create-pos-extension-package",
    category: "pos-extensions",
    tags: [
      "POS.Extensions", "NET-Standard-2", "class-library",
      "Microsoft.Dynamics.Commerce.Sdk.Pos", "NuGet",
      "Microsoft.TypeScript.MSBuild", "tsconfig.json", "pos-tsconfig-base.json",
      "manifest.json", "manifestSchema.json",
      "CustomizationPackage.props",
      "PackagePublisher", "PackagePublisherDisplayName", "PackageVersion",
      "PackageName", "PackageDisplayName", "PackageDescription",
      "nuget.config", "pkgs.dev.azure.com", "dynamics365-commerce",
      "minimumPosVersion", "version", "publisher",
      "GetExtensionPackageDefinitionsRequest",
      "Dynamics365Commerce.InStore", "GitHub",
      "CRT-project-reference",
    ],
    summary:
      "Step-by-step: create POS Extension Package project. (1) New .NET Standard 2.0 class library named POS.Extensions; (2) Create CustomizationPackage.props with PackageName, PackagePublisher, PackageVersion etc.; (3) Import props file in .csproj; (4) Install Microsoft.TypeScript.MSBuild NuGet; (5) Install Microsoft.Dynamics.Commerce.Sdk.Pos NuGet from pkgs.dev.azure.com/commerce-partner/Registry; (6) Add tsconfig.json extending ./devDependencies/pos-tsconfig-base.json; (7) Create manifest.json with $schema, name, publisher, version, minimumPosVersion; (8) Add CRT project references; (9) Build; (10) Add extensions and update manifest components list.",
    content: `
## Create a POS Extension Package Project

### Step 1: Create Project

Create a new **.NET Standard 2.0** C# class library project named \`POS.Extensions\`. Delete the default class file.

---

### Step 2: Create CustomizationPackage.props

Create a shared XML props file at the solution root. All projects in the customization package reference this file.

\`\`\`xml
<Project>
    <PropertyGroup>
        <Version>1.0.0.0</Version>
        <PackagePublisher Condition="'$(PackagePublisher)' == ''">$(Publisher)</PackagePublisher>
        <PackagePublisherDisplayName Condition="'$(PackagePublisherDisplayName)' == ''">$(PublisherDisplayName)</PackagePublisherDisplayName>
        <PackageVersion Condition="'$(PackageVersion)' == ''">$(Version)</PackageVersion>
        <PackageName Condition="'$(PackageName)' == ''">Contoso.Commerce</PackageName>
        <PackageDisplayName Condition="'$(PackageDisplayName)' == ''">Contoso POS Commerce Customization</PackageDisplayName>
        <PackageDescription Condition="'$(PackageDescription)' == ''">Contoso POS Commerce Customization</PackageDescription>
    </PropertyGroup>
</Project>
\`\`\`

Properties:
- **PackagePublisher** — For MPOS extensions, must match the signing certificate subject
- **PackageName** — 3–50 chars, alphanumeric + periods/hyphens, no trailing period. Must match \`ExtensionPackageDefinition.Name\` in CRT trigger.
- **PackageVersion** — Quad notation, major ≠ 0 (e.g., \`1.0.0.0\`)

---

### Step 3: Import Props File in .csproj

\`\`\`xml
<Import Project="..\CustomizationPackage.props" />
\`\`\`

---

### Step 4: Install TypeScript NuGet

Install \`Microsoft.TypeScript.MSBuild\` (latest stable). Match the version to your TypeScript Tools for Visual Studio.

---

### Step 5: Install Commerce SDK POS NuGet

Install \`Microsoft.Dynamics.Commerce.Sdk.Pos\` from the Commerce NuGet feed.

Add to \`nuget.config\`:
\`\`\`xml
<packageSources>
    <add key="dynamics365-commerce"
         value="https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/nuget/v3/index.json" />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
</packageSources>
\`\`\`

---

### Step 6: Add tsconfig.json

Add a TypeScript JSON Configuration File named \`tsconfig.json\` with only the extends field:

\`\`\`json
{
    "extends": "./devDependencies/pos-tsconfig-base.json"
}
\`\`\`

Build the project first — this copies POS dependencies including \`pos-tsconfig-base.json\` and \`devDependencies/\` to the project directory.

---

### Step 7: Create manifest.json

\`\`\`json
{
    "$schema": "./devDependencies/schemas/manifestSchema.json",
    "name": "Contoso.Pos.Developer.Samples",
    "publisher": "Contoso",
    "version": "1.0.0",
    "minimumPosVersion": "9.28.0.0",
    "description": "An extension package containing POS developer samples to showcase various types of POS extensions."
}
\`\`\`

---

### Step 8: Add Project References

Add project references from the POS.Extensions project to each CRT extension project in the solution.

---

### Step 9: Add Extensions

Write TypeScript extension classes. Register each in the \`components\` section of \`manifest.json\`. See samples at [Dynamics365Commerce.InStore on GitHub](https://github.com/microsoft/Dynamics365Commerce.InStore/tree/release/9.28/src/PosSample/Pos.Extension).

> **Build note:** The empty project may show "Payload file doesn't exist" error — include at least one .ts file with POS extensions before building.
`.trim(),
    codeBlocks: [
      `{
    "extends": "./devDependencies/pos-tsconfig-base.json"
}`,
      `{
    "$schema": "./devDependencies/schemas/manifestSchema.json",
    "name": "Contoso.Pos.Developer.Samples",
    "publisher": "Contoso",
    "version": "1.0.0",
    "minimumPosVersion": "9.28.0.0",
    "description": "An extension package containing POS developer samples."
}`,
      `<packageSources>
    <add key="dynamics365-commerce"
         value="https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/nuget/v3/index.json" />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
</packageSources>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "sc-debug-vscode",
    title: "Debug Store Commerce Extensions Using Visual Studio Code — launch.json, port 9222, pwa-msedge",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/sc-debug",
    category: "pos-extensions",
    tags: [
      "debug", "Visual-Studio-Code", "VS-Code", "Store-Commerce",
      "Microsoft-Edge-Tools", "pwa-msedge", "port-9222",
      "--enablewebviewdevtools", "StoreCommerce.Installer.exe",
      "launch.json", "tasks.json", ".vscode",
      "msbuild", "InstallStoreCommerceExtensionsAfterBuild",
      "Debug Store Commerce", "Build and Debug Store Commerce",
      "Attach debugger to Store Commerce",
      "useWebView", "runtimeExecutable", "userDataDir",
      "Microsoft.Dynamics.Commerce.StoreCommerce.exe",
      "breakpoint", "source-maps", "TypeScript",
      "CRT", "HWS", "Visual-Studio-2019", "64-bit-NET-Framework",
    ],
    summary:
      "Debug Store Commerce TypeScript extensions using VS Code + Microsoft Edge Tools extension. Install Store Commerce with --enablewebviewdevtools flag. Create .vscode/launch.json with pwa-msedge configuration (port 9222, useWebView: true) pointing to StoreCommerce.exe. Create .vscode/tasks.json with msbuild task using /p:InstallStoreCommerceExtensionsAfterBuild=true. Three debug modes: 'Debug Store Commerce' (launch app + attach), 'Build and Debug Store Commerce' (build + deploy + launch), 'Attach debugger to Store Commerce' (attach only). For offline CRT/HWS debugging use Visual Studio 2019+.",
    content: `
## Debug Store Commerce Extensions Using Visual Studio Code

> **Note:** VS Code debugs only 64-bit .NET Framework apps. For offline CRT/Hardware Station code, use Visual Studio 2019 or later and attach to \`Microsoft.Dynamics.Commerce.StoreCommerce.exe\`.

---

## Prerequisites

1. Install [Visual Studio Code](https://code.visualstudio.com/) (do NOT run in administrator mode)
2. Install **Microsoft Edge Tools for VS Code** from VS Marketplace
3. Install Store Commerce with the debug flag enabled:

\`\`\`powershell
.\StoreCommerce.Installer.exe install --enablewebviewdevtools
\`\`\`

4. Open VS Code from the **Visual Studio developer command prompt** (not a regular terminal) so msbuild is on PATH:
\`\`\`
code
\`\`\`

---

## Configure .vscode/launch.json

Create a \`.vscode\` folder in the solution root, then create \`launch.json\`:

\`\`\`json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "pwa-msedge",
            "request": "launch",
            "port": 9222,
            "name": "Debug Store Commerce",
            "useWebView": true,
            "runtimeExecutable": "\${env:ProgramFiles}/Microsoft Dynamics 365/10.0/Store Commerce/Microsoft/contentFiles/Microsoft.Dynamics.Commerce.StoreCommerce.exe",
            "userDataDir": "\${env:LocalAppData}/Microsoft Dynamics 365/10.0/Data/Store Commerce/Pos",
            "url": "file:///\${env:ProgramFiles}/Microsoft Dynamics 365/10.0/Store Commerce/Microsoft/contentFiles/Pos/Pos.html"
        },
        {
            "type": "pwa-msedge",
            "request": "launch",
            "port": 9222,
            "name": "Build and Debug Store Commerce",
            "useWebView": true,
            "runtimeExecutable": "\${env:ProgramFiles}/Microsoft Dynamics 365/10.0/Store Commerce/Microsoft/contentFiles/Microsoft.Dynamics.Commerce.StoreCommerce.exe",
            "userDataDir": "\${env:LocalAppData}/Microsoft Dynamics 365/10.0/Data/Store Commerce/Pos",
            "url": "file:///\${env:ProgramFiles}/Microsoft Dynamics 365/10.0/Store Commerce/Microsoft/contentFiles/Pos/Pos.html",
            "preLaunchTask": "\${defaultBuildTask}"
        },
        {
            "name": "Attach debugger to Store Commerce",
            "type": "pwa-msedge",
            "port": 9222,
            "request": "attach",
            "useWebView": true,
            "runtimeExecutable": "\${env:ProgramFiles}/Microsoft Dynamics 365/10.0/Store Commerce/Microsoft/contentFiles/Microsoft.Dynamics.Commerce.StoreCommerce.exe"
        }
    ]
}
\`\`\`

---

## Configure .vscode/tasks.json

\`\`\`json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build & Install Store Commerce Extension",
            "type": "shell",
            "command": "msbuild",
            "args": [
                "/p:Configuration=debug",
                "/p:InstallStoreCommerceExtensionsAfterBuild=true",
                "/t:build",
                "/m",
                "/consoleloggerparameters:NoSummary",
                "\${workspaceFolder}"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
\`\`\`

---

## Debug Modes

| Configuration | What it does |
|---|---|
| **Debug Store Commerce** | Opens Store Commerce app and attaches extension code to it |
| **Build and Debug Store Commerce** | Builds extension, deploys it, opens Store Commerce, attaches debugger |
| **Attach debugger to Store Commerce** | Attaches to already-running Store Commerce app (no launch) |

---

## Troubleshooting

**msbuild not found:** Close VS Code, open Visual Studio developer command prompt, go to solution directory, run \`code\` to reopen.

**JSON comment errors:** Close the .json file, retry the Debug command. Or delete all comments from the .json file.
`.trim(),
    codeBlocks: [
      `.\StoreCommerce.Installer.exe install --enablewebviewdevtools`,
      `{
    "type": "pwa-msedge",
    "request": "launch",
    "port": 9222,
    "name": "Debug Store Commerce",
    "useWebView": true,
    "runtimeExecutable": "\${env:ProgramFiles}/Microsoft Dynamics 365/10.0/Store Commerce/Microsoft/contentFiles/Microsoft.Dynamics.Commerce.StoreCommerce.exe"
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-create-appx",
    title: "Create MPOS .appx Extension Package — UWP JavaScript Project, MSIX, x86 Only",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/create-pos-extension-appx",
    category: "pos-extensions",
    tags: [
      "MPOS", "appx", "MSIX", "UWP", "Windows",
      "JavaScript-UWP", "ModernPos", "jsproj",
      "x86", "Windows-10-1809", "Windows-Server-2019",
      "Microsoft.Dynamics.Commerce.Sdk.Pos", "NuGet",
      "CustomizationPackage.props", "package.appxmanifest",
      "StoreLogo.png", "platform-configuration", "ProjectConfiguration",
      "POS.Extension-Package", "CRT-reference", "Hardware-Station-reference",
      "Deploy", "Debug-Installed-App-Package", "Commerce-Modern-POS",
      "optional-packages", "independent-packaging",
    ],
    summary:
      "Create MPOS .appx/MSIX packaging project (only needed for MPOS — Store Commerce handles packaging differently). Steps: new JavaScript UWP project named ModernPos targeting Windows 10 1809 minimum; delete auto-generated js/css/index.html/package.appxmanifest but keep images/StoreLogo.png; import CustomizationPackage.props in jsproj (auto-generates package.appxmanifest from props); add Microsoft.Dynamics.Commerce.Sdk.Pos NuGet; remove all platforms except x86 in Configuration Manager and in jsproj ProjectConfiguration items; add project references to POS.Extensions project, CRT extension projects, Hardware Station extension projects; deploy via VS Debug > Other Debug Targets > Debug Installed App Package > Commerce Modern POS.",
    content: `
## Create an .appx File for MPOS Extension Package

> This is only needed if developing extensions for **Modern POS (MPOS)**.
> For Store Commerce app, packaging works differently.
> Retail SDK ended October 2023 — use Commerce SDK.

MPOS uses the [MSIX Windows app package](/windows/msix/overview) format.
Modern POS optional packages require **Windows 10 version 1809 or later** / **Windows Server 2019 or later**.

---

## Steps

### 1. Create UWP JavaScript Project

Add new project: **Windows JavaScript > Blank App (Universal Windows)** named \`ModernPos\`.
- Target version: **Windows 10, version 1809 (10.0; Build 17763)**
- Minimum version: **Windows 10, version 1809 (10.0; Build 17763)**

### 2. Delete Auto-Generated Files

Delete these files/folders from the project:
- \`js\` folder
- \`css\` folder
- \`index.html\`
- \`package.appxmanifest\`

**Do NOT delete** \`images\StoreLogo.png\` (app package logo — keep or replace with your own).

### 3. Import CustomizationPackage.props

Edit the \`.jsproj\` file and add:
\`\`\`xml
<Import Project="..\CustomizationPackage.props" />
\`\`\`
The \`package.appxmanifest\` is auto-generated from these props. This import is required.

### 4. Install Microsoft.Dynamics.Commerce.Sdk.Pos NuGet

Same NuGet package as the POS.Extensions project.

### 5. Configure x86-Only Platform

In Solution Explorer: right-click project > Properties > Configuration Manager > Active solution platform > Edit > **remove all platforms except x86**.

Then edit the \`.jsproj\` to remove non-x86 ProjectConfiguration items:

\`\`\`xml
<ItemGroup Label="ProjectConfigurations">
    <ProjectConfiguration Include="Debug|x86">
        <Configuration>Debug</Configuration>
        <Platform>x86</Platform>
    </ProjectConfiguration>
    <ProjectConfiguration Include="Release|x86">
        <Configuration>Release</Configuration>
        <Platform>x86</Platform>
        <UseDotNetNativeToolchain>true</UseDotNetNativeToolchain>
    </ProjectConfiguration>
</ItemGroup>
\`\`\`

### 6. Add Project References

From the MPOS \`.jsproj\`, add project references to:
- The **POS.Extensions** package project
- Each **CRT extension** project in the solution
- Each **Hardware Station extension** project in the solution

When prompted about unsupported reference, select **Yes**.

### 7. Build and Deploy

1. Build the MPOS packaging project (.jsproj)
2. Right-click > **Deploy**
3. In Visual Studio: **Debug > Other Debug Targets > Debug Installed App Package**
4. Search for and select **Commerce Modern POS**
5. Select **Start** to open the app with debugger attached
`.trim(),
    codeBlocks: [
      `<Import Project="..\CustomizationPackage.props" />`,
      `<ItemGroup Label="ProjectConfigurations">
    <ProjectConfiguration Include="Debug|x86">
        <Configuration>Debug</Configuration>
        <Platform>x86</Platform>
    </ProjectConfiguration>
    <ProjectConfiguration Include="Release|x86">
        <Configuration>Release</Configuration>
        <Platform>x86</Platform>
        <UseDotNetNativeToolchain>true</UseDotNetNativeToolchain>
    </ProjectConfiguration>
</ItemGroup>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },

  {
    id: "pos-debug-extension",
    title: "Debug Sealed MPOS and CPOS Extensions — VS 2017, Edge F12, IIS Symlink",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/debug-pos-extension",
    category: "pos-extensions",
    tags: [
      "debug", "MPOS", "CPOS", "Cloud-POS", "Store-Commerce-for-web",
      "Visual-Studio-2017", "sealed-MPOS",
      "Modern-POS-SEALED", "LCS", "Retail-Self-service",
      "Install-or-Update-POS-UWP", "Debug-Installed-App-Package",
      "Commerce-Modern-POS", "IIS", "RetailCloudPos",
      "Extensions-directory", "symlink", "mklink",
      "ExtensionPackageName", "AbsolutePathToExtensionPackageProject",
      "Microsoft-Edge", "F12", "Edge-developer-tools",
      "JavaScript-Source-Mapping", "workspace",
      "debug-pos-extension", "sc-debug",
    ],
    summary:
      "Debug sealed MPOS: install MPOS (SEALED) from LCS Shared asset library (Retail Self-service package section), build your .jsproj extension, Deploy, then VS Debug > Other Debug Targets > Debug Installed App Package > Commerce Modern POS. Debug CPOS: create a directory symbolic link (mklink /D) in the IIS RetailCloudPos/Extensions/ folder pointing to your extension project root — allows hot-reload without reinstalling. Then build, open CPOS in Edge, F12 > enable JavaScript Source Mapping, set up workspace pointing to extension root. For Store Commerce app use sc-debug (VS Code + pwa-msedge).",
    content: `
## Debug Sealed MPOS and CPOS Extensions

> To debug the **Store Commerce app** (not MPOS/CPOS), see [Debug Store Commerce extensions using Visual Studio Code](sc-debug).

---

## Debug Sealed Modern POS (MPOS)

### Prerequisites
Install the sealed MPOS installer from **LCS Shared Asset Library** (https://lcs.dynamics.com/V2/SharedAssetLibrary) — look in **Retail Self-service package** section for **Modern POS (SEALED)**.

After installing, double-click the desktop shortcut **"Install or Update Retail Modern POS"** to install the UWP app.

### Debug Steps

1. In Visual Studio, build your **MPOS extension package project** (the \`.jsproj\` file)
2. In Solution Explorer, right-click the \`.jsproj\` → **Deploy**
3. Open POS with debugger:
   - **Debug** menu → **Other Debug Targets** → **Debug Installed App Package**
   - Search for and select **Commerce Modern POS**
   - Select **Start**

---

## Configure CPOS Development Environment

Do this once per machine (or after deleting the link). Creates a symlink so CPOS serves your extension code directly.

1. Verify CPOS is deployed on the machine (use CSU self-hosted installer if not deployed)
2. Open IIS (**Win+R** → \`inetmgr\`)
3. Expand **Sites** → right-click **RetailCloudPos** → **Explore**
4. **File** → **Open Windows PowerShell as administrator**
5. In PowerShell, open a cmd window:
\`\`\`powershell
cmd .
\`\`\`
6. Change to the Extensions root directory:
\`\`\`powershell
cd Extensions
\`\`\`
7. Set a variable for your extension package name:
\`\`\`powershell
set ExtensionPackageName=Contoso.Pos.Developer.Samples
\`\`\`
The name must match the name in \`ExtensionPackageDefinition\` in your CRT trigger.

8. Set the path to your POS extension project:
\`\`\`powershell
set AbsolutePathToExtensionPackageProject=K:\RetailCloudPos\WebRoot\Extensions\Contoso.Pos.Developer.Samples
\`\`\`

9. Create the symlink:
\`\`\`powershell
mklink /D %ExtensionPackageName% %AbsolutePathToExtensionPackageProject%
\`\`\`

10. Verify the linked folder appears in the CPOS Extensions directory.

---

## Debug CPOS Using Microsoft Edge Developer Tools

1. Follow the CPOS environment setup steps above.
2. Build your CPOS extension project.
3. Open the CPOS website in **Microsoft Edge**.
4. Press **F12** to open Microsoft Edge developer tools.
5. Set up a workspace pointing to your extension package root directory (one-time setup).
6. Ensure **JavaScript Source Mapping** is enabled.
7. Set breakpoints in your TypeScript extension files.
`.trim(),
    codeBlocks: [
      `cmd .
cd Extensions
set ExtensionPackageName=Contoso.Pos.Developer.Samples
set AbsolutePathToExtensionPackageProject=K:\\RetailCloudPos\\WebRoot\\Extensions\\Contoso.Pos.Developer.Samples
mklink /D %ExtensionPackageName% %AbsolutePathToExtensionPackageProject%`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Store Commerce: Create New Functionality ────────────────────────────────
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/add-pos-operations
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/custom-pos-view
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/end-to-end-payment-extension
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/payment-custom-error-messages
// https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/duplicate-payments-protection

const POS_CREATE_ENTRIES: DocEntry[] = [
  {
    id: "pos-custom-operation",
    title: "Add POS Operations to POS Layouts by Using Button Grid Designer",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/add-pos-operations",
    category: "pos-extensions",
    tags: [
      "pos", "operation", "button-grid", "ExtensionOperationRequestBase",
      "ExtensionOperationRequestHandlerBase", "ExtensionOperationRequestFactoryFunctionType",
      "executeAsync", "supportedRequestType", "operation-id", "PosApi/Create/Operations",
    ],
    summary:
      "How to create a custom POS operation: operation request (ExtensionOperationRequestBase), response (Response), handler (ExtensionOperationRequestHandlerBase), and factory (ExtensionOperationRequestFactoryFunctionType). Operation IDs 4001+ are for extensions; register in manifest.json under components.create.operations; add the operation to a button grid in HQ and distribute via job 1090.",
    content: `
## Add POS Operations

If you want business logic to run in the POS when users select a button, create a POS operation. Every operation has four parts:

1. **Operation request** — extends \`ExtensionOperationRequestBase\`. Contains the operation ID and all input. Operation IDs 0–4000 are reserved; extension operations must start at **4001**. The custom parameters field (for passing data from HQ button grid) only appears for IDs ≥ 4001.
2. **Operation response** — extends \`Response\`. Contains the operation result.
3. **Operation handler** — extends \`ExtensionOperationRequestHandlerBase\`. Implements \`supportedRequestType()\` and \`executeAsync()\`. All business logic goes here; returns an \`ICancelableDataResult<TResponse>\`.
4. **Operation factory** — a function of type \`ExtensionOperationRequestFactoryFunctionType\`. Links the button click to the handler by creating and returning the request.

### Registration in manifest.json

\`\`\`json
{
  "components": {
    "create": {
      "operations": [
        {
          "operationId": "5001",
          "operationRequestFactoryPath": "Operations/EndOfDayOperationRequestFactory",
          "operationRequestHandlerPath": "Operations/EndOfDayOperationRequestHandler"
        }
      ]
    }
  }
}
\`\`\`

### Add to POS Layout in HQ

1. Go to **Retail and commerce > Channel setup > POS setup > POS > Operations** and create the operation with the matching ID.
2. Go to **Button grids**, open the designer, right-click to add a new row, set the button **Action** to the new operation.
3. Run distribution job **1090** to push the change to channels.

### Chain Existing Operations

Call standard operations from a handler via \`this.context.runtime.executeAsync(request)\`. The sample EOD operation chains: TenderRemoval → SafeDrop → TenderDeclaration → CloseShift in sequence, each checking \`result.canceled\` before proceeding.

\`\`\`typescript
import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import { CloseShiftOperationRequest, CloseShiftOperationResponse } from "PosApi/Consume/Shifts";
import { SafeDropOperationRequest, SafeDropOperationResponse } from "PosApi/Consume/StoreOperations";
// ...

export default class EndOfDayOperationRequestHandler<TResponse extends EndOfDayOperationResponse>
    extends ExtensionOperationRequestHandlerBase<TResponse> {
    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return EndOfDayOperationRequest;
    }
    public executeAsync(request: EndOfDayOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {
        return this.context.runtime.executeAsync(new TenderRemovalOperationRequest(...))
            .then(result => result.canceled ? Promise.resolve({ canceled: true, data: null })
                : this.context.runtime.executeAsync(new SafeDropOperationRequest(...)))
            // ... chain continues
    }
}
\`\`\`
`.trim(),
    codeBlocks: [
      `// Request — extends ExtensionOperationRequestBase
import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
export default class EndOfDayOperationRequest<TResponse extends EndOfDayOperationResponse>
    extends ExtensionOperationRequestBase<TResponse> {
    constructor(correlationId: string) {
        super(5001, correlationId); // ID must be >= 4001 for extension operations
    }
}`,
      `// Handler — extends ExtensionOperationRequestHandlerBase
import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
export default class EndOfDayOperationRequestHandler<TResponse extends EndOfDayOperationResponse>
    extends ExtensionOperationRequestHandlerBase<TResponse> {
    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return EndOfDayOperationRequest;
    }
    public executeAsync(request: EndOfDayOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {
        return this.context.runtime.executeAsync(new TenderRemovalOperationRequest(this.context.logger.getNewCorrelationId()));
    }
}`,
      `// Factory — ExtensionOperationRequestFactoryFunctionType
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<EndOfDayOperationResponse> =
    function(context: IOperationContext, operationId: number, actionParameters: string[], correlationId: string) {
        return Promise.resolve({ canceled: false, data: new EndOfDayOperationRequest<EndOfDayOperationResponse>(correlationId) });
    };
export default getOperationRequest;`,
      `// manifest.json — register the operation
{
  "components": {
    "create": {
      "operations": [
        {
          "operationId": "5001",
          "operationRequestFactoryPath": "Operations/EndOfDayOperationRequestFactory",
          "operationRequestHandlerPath": "Operations/EndOfDayOperationRequestHandler"
        }
      ]
    }
  }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-custom-view",
    title: "Create a Custom View in POS",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/custom-pos-view",
    category: "pos-extensions",
    tags: [
      "pos", "custom-view", "CustomViewControllerBase", "onReady", "onShown", "onHidden",
      "dispose", "ICustomViewControllerConfiguration", "commandBar", "ICommandDefinition",
      "app-bar", "navigate", "PosApi/Create/Views", "10.0.18",
    ],
    summary:
      "How to create a custom POS view by extending CustomViewControllerBase (PosApi/Create/Views). Required abstract methods: onReady (render into provided HTMLElement) and dispose. Optional lifecycle: onShown/onHidden. The constructor receives ICustomViewControllerContext and an optional ICustomViewControllerConfiguration for title and commandBar (app bar commands). Commands implement ICommandDefinition with execute, icon, name, label, canExecute, isVisible. Update command state at runtime via this.state.commandBar.commands.",
    content: `
## Create a Custom View in POS

Applies to Retail SDK 10.0.18 and later. All custom views extend **CustomViewControllerBase** from **PosApi/Create/Views**.

### Required abstract methods

- **onReady(element: HTMLElement)** — Called when the page is added to the DOM. Render your view inside \`element\`.
- **dispose()** — Called when the view is removed from the DOM. Release resources.

### Optional lifecycle methods

- **onShown()** — Called every time the view becomes visible.
- **onHidden()** — Called every time the view is hidden.

### Constructor and configuration

Pass an **ICustomViewControllerConfiguration** to configure the view:

\`\`\`typescript
import * as Views from "PosApi/Create/Views";

export default class ExampleView extends Views.CustomViewControllerBase {
    constructor(context: Views.ICustomViewControllerContext) {
        let config: Views.ICustomViewControllerConfiguration = {
            title: context.resources.getString("string_0001"),
            commandBar: {
                commands: [
                    {
                        name: "Create",
                        label: context.resources.getString("string_2001"),
                        icon: Views.Icons.Add,
                        isVisible: true,
                        canExecute: true,
                        execute: (args: Views.CustomViewControllerExecuteCommandArgs): void => {
                            this.createExampleEntity().then((entityCreated) => {
                                if (entityCreated) {
                                    this.dataList.data = this.viewModel.loadedData;
                                }
                            });
                        }
                    }
                ]
            }
        };
        super(context, config);
    }
}
\`\`\`

### App bar commands (ICommandDefinition)

Commands appear in order from right to left on the app bar when the view is visible.

| Property | Description |
|---|---|
| name | Unique within the view |
| label | Localized display text |
| icon | From Views.Icons enum |
| canExecute | Whether the command is enabled |
| isVisible | Whether the command is shown |
| execute | Handler invoked when command is selected |

### Updating command state at runtime

Use the DataList **SelectionChanged** event to enable/disable commands:

\`\`\`typescript
this.dataList.addEventListener("SelectionChanged", (eventData: { items: Entities.ExampleEntity[] }) => {
    this.state.commandBar.commands.forEach((command) => {
        if (command.name === "Edit" || command.name === "Delete") {
            command.canExecute = eventData.items.length > 0;
        }
    });
});
\`\`\`

### View registration in manifest.json

Register custom views under \`components.views\` in manifest.json. Navigate to the view programmatically using \`this.context.navigator.navigateTo()\`.
`.trim(),
    codeBlocks: [
      `import * as Views from "PosApi/Create/Views";

export default class ExampleView extends Views.CustomViewControllerBase {
    constructor(context: Views.ICustomViewControllerContext) {
        let config: Views.ICustomViewControllerConfiguration = {
            title: context.resources.getString("string_0001"),
            commandBar: {
                commands: [
                    {
                        name: "Create",
                        label: context.resources.getString("string_2001"),
                        icon: Views.Icons.Add,
                        isVisible: true,
                        canExecute: true,
                        execute: (args: Views.CustomViewControllerExecuteCommandArgs): void => {
                            this.createExampleEntity();
                        }
                    }
                ]
            }
        };
        super(context, config);
    }

    public onReady(element: HTMLElement): void {
        // Render the view inside element
    }

    public dispose(): void {
        // Release resources
    }
}`,
      `// Enable/disable commands on selection change
this.dataList.addEventListener("SelectionChanged", (eventData: { items: Entities.ExampleEntity[] }) => {
    this.state.commandBar.commands.forEach((command) => {
        if (command.name === "Edit" || command.name === "Delete") {
            command.canExecute = eventData.items.length > 0;
        }
    });
});`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "hws-device-extension",
    title: "Integrate POS with a New Hardware Device and Generate Extension Installer",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension",
    category: "pos-extensions",
    tags: [
      "hardware-station", "HardwareStationDeviceActionRequest", "HardwareStationDeviceActionResponse",
      "IController", "RoutePrefix", "HttpPost", "MEF", "extension-installer",
      "hardware-device", "cash-dispenser", "MSR", "IHardwareStationController",
      "HardwareStation.Extension.config", "sealed-installer",
    ],
    summary:
      "How to integrate POS with a new hardware device via Hardware Station extension. POS sends HardwareStationDeviceActionRequest (device, action, actionData) and receives HardwareStationDeviceActionResponse. Hardware Station extension (SDK 10.0.11+) implements IController with [RoutePrefix] and [HttpPost] methods. The device parameter matches the RoutePrefix; the action parameter matches the method name. For sealed installers (10.0.18+), use Microsoft.Dynamics.Commerce.Sdk.Installers.HardwareStation to generate an independent extension installer.",
    content: `
## Hardware Station Extension for New Devices

Hardware Station (HWS) connects POS to peripherals. Extend it to add new devices or override existing device types.

### Two extension scenarios

- **New device** — device not supported out-of-box (e.g., cash dispenser). Add a new controller.
- **New device type** — device supported but need a custom implementation (e.g., Audio Jack MSR). Override existing controller.

### POS side — HardwareStationDeviceActionRequest

\`\`\`typescript
let request = new HardwareStationDeviceActionRequest<HardwareStationDeviceActionResponse>(
    "ISVEXTENSIONDEVICE",   // must match RoutePrefix on the C# controller
    "Sample",               // must match the C# method name
    customParameters        // passed to the C# method
);
return this.extensionContextRuntime.executeAsync(request);
\`\`\`

| Parameter | Description |
|---|---|
| device | Matches \`[RoutePrefix("...")]\` on the C# controller (all caps) |
| action | Matches the C# method name decorated with \`[HttpPost]\` |
| actionData | Any custom parameter/object passed to the method |

### Hardware Station side — IController (SDK 10.0.11+)

\`\`\`csharp
[RoutePrefix("ISVEXTENSIONDEVICE")]
public class ISVExtensionDeviceController : IController
{
    [HttpPost]
    public async Task<CustomResponse> Sample(CustomRequest request, IEndpointContext context)
    {
        return await Task.FromResult(new CustomResponse());
    }
}
\`\`\`

Required NuGet: **Microsoft.Dynamics.Commerce.Hosting.Contracts** (from RetailSDK\\pkgs).

### Deploy for local testing (Modern POS local HWS)

1. Copy the output DLL to \`C:\\Program Files (x86)\\Microsoft Dynamics 365\\70\\Retail Modern POS\\ClientBroker\\ext\`
2. In **HardwareStation.Extension.config** add:
   \`\`\`xml
   <add source="assembly" value="YourExtensionLibraryName" />
   \`\`\`
3. End the \`dllhost.exe\` task and restart Modern POS.

### Sealed Extension Installer (10.0.18+)

Use the sample **HardwareStation.Installer.csproj** which consumes **Microsoft.Dynamics.Commerce.Sdk.Installers.HardwareStation**. Add your HWS project as a reference and remove the sample reference. Build to generate the extension installer EXE.

\`\`\`
HardwareStation.Installer.exe install
HardwareStation.Installer.exe uninstall
\`\`\`

### Package HWS extension with Modern POS (local HWS)

For independent packaging SDK (10.0.22+): add a reference to the HWS project from the ModernPos JavaScript project (\`ModernPos.jsproj\`). The HWS extension is deployed as a UWP app extension.

### Retail SDK samples

- POS sample: \`\\RetailSDK\\POS\\Extensions\\FiscalRegisterSample\`
- HWS sample: \`\\RetailSDK\\SampleExtensions\\HardwareStation\\Extension.FiscalRegisterSample\`
`.trim(),
    codeBlocks: [
      `// POS: call Hardware Station extension
let request = new HardwareStationDeviceActionRequest<HardwareStationDeviceActionResponse>(
    "ISVEXTENSIONDEVICE",  // matches [RoutePrefix] on the C# controller
    "Sample",              // matches the [HttpPost] method name
    "Custom parameters or custom object"
);
return this.extensionContextRuntime.executeAsync(request);`,
      `// C# Hardware Station controller (SDK 10.0.11+)
using Microsoft.Dynamics.Commerce.Runtime.Hosting.Contracts;

[RoutePrefix("ISVEXTENSIONDEVICE")]
public class ISVExtensionDeviceController : IController
{
    [HttpPost]
    public async Task<CustomResponse> Sample(CustomRequest request, IEndpointContext context)
    {
        var response = new CustomResponse();
        return await Task.FromResult(response);
    }
}

public class CustomResponse
{
    public string sampleProp { get; set; }
    public CustomResponse() { this.sampleProp = "sampleValue"; }
}`,
      `<!-- HardwareStation.Extension.config — register the extension assembly -->
<hardwareStationExtension>
  <composition>
    <add source="assembly" value="Contoso.Commerce.HardwareStation.ISVExtensionDevice" />
  </composition>
</hardwareStationExtension>`,
      `# Run sealed Hardware Station extension installer
HardwareStation.Installer.exe install
HardwareStation.Installer.exe uninstall`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "payment-terminal-connector",
    title: "Create an End-to-End Payment Integration for a Payment Terminal",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/end-to-end-payment-extension",
    category: "payments",
    tags: [
      "payment-connector", "INamedRequestHandler", "IPaymentProcessor",
      "AuthorizePaymentTerminalDeviceRequest", "CapturePaymentTerminalDeviceRequest",
      "VoidPaymentTerminalDeviceRequest", "RefundPaymentTerminalDeviceRequest",
      "OpenPaymentTerminalDeviceRequest", "BeginTransactionPaymentTerminalDeviceRequest",
      "EndTransactionPaymentTerminalDeviceRequest", "PaymentSdkData",
      "GetMerchantAccountPropertyMetadata", "ValidateMerchantAccount",
      "LockPaymentTerminalDeviceRequest", "hardware-station", "payment-terminal",
    ],
    summary:
      "End-to-end guide for writing a payment terminal connector in Dynamics 365 Commerce. Payment connector = C# class implementing INamedRequestHandler in a Hardware Station extension. The HandlerName property links the connector to a POS hardware profile. Implement SupportedRequestTypes (full list: Lock, Open, BeginTransaction, UpdateLineItems, Authorize, Capture, Void, Refund, FetchToken, EndTransaction, Close, ExecuteTask, gift card requests, GetTransactionReference, GetTransactionByTransactionReference) and Execute to dispatch them. The Authorize response returns PaymentInfo with PaymentSdkData (XML property bag with ConnectorName + AuthorizationResponseProperties). Payment processor = separate class implementing IPaymentProcessor with GetMerchantAccountPropertyMetadata and ValidateMerchantAccount for HQ merchant property configuration.",
    content: `
## End-to-End Payment Terminal Integration

### Architecture

Flow: POS → Hardware Station → Payment Connector → Payment Terminal/Gateway.

Two libraries to write:
1. **Payment connector** — \`INamedRequestHandler\` in a HWS extension. Handles all payment requests.
2. **Payment processor** — \`IPaymentProcessor\` (Microsoft.Dynamics.Retail.PaymentSDK). Handles merchant property configuration in HQ.

### Payment Connector — INamedRequestHandler

\`\`\`csharp
public class PaymentDeviceSample : INamedRequestHandler
{
    private const string PaymentTerminalDevice = "MOCKPAYMENTTERMINAL";
    public string HandlerName => PaymentDeviceSample.PaymentTerminalDevice;

    public IEnumerable<Type> SupportedRequestTypes => new[]
    {
        typeof(LockPaymentTerminalDeviceRequest),
        typeof(OpenPaymentTerminalDeviceRequest),
        typeof(BeginTransactionPaymentTerminalDeviceRequest),
        typeof(EndTransactionPaymentTerminalDeviceRequest),
        typeof(UpdateLineItemsPaymentTerminalDeviceRequest),
        typeof(AuthorizePaymentTerminalDeviceRequest),
        typeof(CapturePaymentTerminalDeviceRequest),
        typeof(VoidPaymentTerminalDeviceRequest),
        typeof(RefundPaymentTerminalDeviceRequest),
        typeof(FetchTokenPaymentTerminalDeviceRequest),
        typeof(CancelOperationPaymentTerminalDeviceRequest),
        typeof(ExecuteTaskPaymentTerminalDeviceRequest),
        typeof(GetTransactionReferencePaymentTerminalDeviceRequest),
        typeof(GetTransactionByTransactionReferencePaymentTerminalDeviceRequest),
        // Gift card:
        typeof(ActivateGiftCardPaymentTerminalRequest),
        typeof(AddBalanceToGiftCardPaymentTerminalRequest),
        typeof(GetGiftCardBalancePaymentTerminalRequest),
        typeof(GetPrivateTenderPaymentTerminalDeviceRequest),
        typeof(CashoutGiftCardPaymentTerminalRequest),
    };

    public Response Execute(Request request)
    {
        if (request is AuthorizePaymentTerminalDeviceRequest authorizeReq)
            return this.AuthorizePayment(authorizeReq);
        // ... other types
        return new NullResponse();
    }
}
\`\`\`

### Authorization response — PaymentSdkData

The PaymentInfo returned by Authorize must include:
- **PaymentSdkData** — XML property bag (ConnectorName + AuthorizationResponse properties)
- **CardNumberMasked**, **CardType**, **ApprovedAmount**, **IsApproved**, **Errors**

\`\`\`csharp
List<PaymentProperty> props = new List<PaymentProperty>();
props.Add(new PaymentProperty(GenericNamespace.Connector, ConnectorProperties.ConnectorName, "TestConnector"));

List<PaymentProperty> authProps = new List<PaymentProperty>();
authProps.Add(new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.ApprovedAmount, 28.08m));
authProps.Add(new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.ApprovalCode, "Z123456"));
authProps.Add(new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.ProviderTransactionId, "123456789"));
authProps.Add(new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.AuthorizationResult, AuthorizationResult.Success.ToString()));
authProps.Add(new PaymentProperty(GenericNamespace.AuthorizationResponse, TransactionDataProperties.TerminalId, "000001"));

props.Add(new PaymentProperty(GenericNamespace.AuthorizationResponse, AuthorizationResponseProperties.Properties, authProps.ToArray()));
string paymentSdkData = PaymentProperty.ConvertPropertyArrayToXML(props.ToArray());
\`\`\`

### Payment receipt printing

If the terminal returns receipt data, include it in PaymentSdkData as ExternalReceipt:

\`\`\`xml
<ReceiptData>
  <Receipt Type='Customer'><Line>Line 1</Line></Receipt>
  <Receipt Type='Merchant'><Line>Line 1</Line></Receipt>
</ReceiptData>
\`\`\`

### Payment Processor — IPaymentProcessor

\`\`\`csharp
public class SampleConnector : IPaymentProcessor
{
    public Response GetMerchantAccountPropertyMetadata(Request request)
    {
        // Return list of merchant property definitions (shown in HQ hardware profile)
        List<PaymentProperty> properties = new List<PaymentProperty>();
        // Add property metadata...
        return response;
    }

    public Response ValidateMerchantAccount(Request request)
    {
        // Validate the merchant properties entered in HQ
        return response;
    }
}
\`\`\`

Required merchant properties in GetMerchantAccountPropertyMetadata:
- MerchantAccount / PortableAssemblyName
- MerchantAccount / ServiceAccountId
- MerchantAccount / SupportedCurrencies (e.g., "USD;EUR;GBP")
- MerchantAccount / SupportedTenderTypes (e.g., "Visa;MasterCard;Amex;Debit")

### Configure connector on POS hardware profile

Set the **HandlerName** string value in the **Device name** field on the **PIN pad** FastTab of the POS hardware profile page in HQ.

### Register in HardwareStation.Extension.config

\`\`\`xml
<add source="assembly" value="Contoso.Commerce.HardwareStation.PaymentSample" />
\`\`\`

### State management

Payment connectors can be hosted in-process (dllhost.exe) or IIS (w3wp.exe). Either process can terminate between requests. Design connectors to be stateless and recoverable — do not rely on in-memory state across request calls.
`.trim(),
    codeBlocks: [
      `// Implement INamedRequestHandler in Hardware Station
public class PaymentDeviceSample : INamedRequestHandler
{
    private const string PaymentTerminalDevice = "MOCKPAYMENTTERMINAL";
    public string HandlerName => PaymentDeviceSample.PaymentTerminalDevice;

    public IEnumerable<Type> SupportedRequestTypes => new[]
    {
        typeof(AuthorizePaymentTerminalDeviceRequest),
        typeof(CapturePaymentTerminalDeviceRequest),
        typeof(VoidPaymentTerminalDeviceRequest),
        typeof(RefundPaymentTerminalDeviceRequest),
        typeof(OpenPaymentTerminalDeviceRequest),
        typeof(BeginTransactionPaymentTerminalDeviceRequest),
        typeof(EndTransactionPaymentTerminalDeviceRequest),
        typeof(ClosePaymentTerminalDeviceRequest),
        typeof(LockPaymentTerminalDeviceRequest),
        typeof(GetTransactionReferencePaymentTerminalDeviceRequest),
        typeof(GetTransactionByTransactionReferencePaymentTerminalDeviceRequest),
    };

    public Response Execute(Request request)
    {
        if (request.GetType() == typeof(AuthorizePaymentTerminalDeviceRequest))
            return this.AuthorizePayment((AuthorizePaymentTerminalDeviceRequest)request);
        return new NullResponse();
    }
}`,
      `// Build PaymentSdkData for the authorization response
List<PaymentProperty> props = new List<PaymentProperty>();
props.Add(new PaymentProperty(GenericNamespace.Connector, ConnectorProperties.ConnectorName, "TestConnector"));

List<PaymentProperty> authProps = new List<PaymentProperty>();
authProps.Add(new PaymentProperty(GenericNamespace.AuthorizationResponse,
    AuthorizationResponseProperties.ApprovedAmount, 28.08m));
authProps.Add(new PaymentProperty(GenericNamespace.AuthorizationResponse,
    AuthorizationResponseProperties.AuthorizationResult, AuthorizationResult.Success.ToString()));
props.Add(new PaymentProperty(GenericNamespace.AuthorizationResponse,
    AuthorizationResponseProperties.Properties, authProps.ToArray()));

string paymentSdkData = PaymentProperty.ConvertPropertyArrayToXML(props.ToArray());`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "payment-custom-error-messages",
    title: "Create Custom Localized Error Messages for Payment Terminal Extensions",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/payment-custom-error-messages",
    category: "payments",
    tags: [
      "payment-error", "PaymentError", "isLocalized", "ResourceManager",
      "localized-error", "AuthorizePaymentTerminalDeviceResponse",
      "ErrorCode", "Decline", "custom-error", "satellite-assembly", "resx",
    ],
    summary:
      "How to surface custom error messages from a payment connector to the POS cashier. Set isLocalized=true on the PaymentError constructor to override the built-in decline message. For localization: create .resx resource files per locale (e.g., Messages.en-us.resx), include a culture-neutral fallback (Messages.resx), use ResourceManager at runtime to load the localized string using the locale from terminalSettings.Locale (retrieved during OpenPaymentTerminalDeviceRequest). Each resource file must have an identical set of keys.",
    content: `
## Custom Localized Payment Error Messages

### Custom (non-localized) error message

To display a custom error from the payment connector in POS, set \`isLocalized = true\` on the \`PaymentError\` object and add it to \`paymentInfo.Errors\`:

\`\`\`csharp
PaymentInfo paymentInfo = new PaymentInfo();
bool isLocalized = true;
string errorMessage = string.Format("The payment was declined. Reference number '{0}'.", referenceNumber);
PaymentError paymentError = new PaymentError(ErrorCode.Decline, errorMessage, isLocalized);
paymentInfo.Errors = new PaymentError[] { paymentError };
return new AuthorizePaymentTerminalDeviceResponse(paymentInfo);
\`\`\`

Without \`isLocalized = true\`, the POS shows its own built-in "payment declined" message and ignores the custom message.

### Localized error messages with .resx files

1. Create resource files in Visual Studio: \`Messages.resx\` (culture-neutral fallback), \`Messages.en-us.resx\`, etc.
2. Add culture-specific postfix to the filename to generate localized satellite assemblies.
3. Set **Build Action = Embedded Resource** and **Custom Tool = ResXFileCodeGenerator** on each file.
4. Define identical keys across all locale files (e.g., \`CustomPaymentConnector_Decline\`).

### Load the locale at runtime

Cache \`terminalSettings.Locale\` during \`OpenPaymentTerminalDeviceRequest\`, then use it to retrieve the correct string:

\`\`\`csharp
public class PaymentDeviceSample : INamedRequestHandler
{
    private SettingsInfo terminalSettings;
    private ResourceManager messagesResourceManager;

    public PaymentDeviceSample()
    {
        this.messagesResourceManager = new ResourceManager(
            "Contoso.Commerce.HardwareStation.PaymentSample.Resources.Messages",
            typeof(PaymentDeviceSample).GetTypeInfo().Assembly);
    }

    private Response Open(OpenPaymentTerminalDeviceRequest request)
    {
        this.terminalSettings = request.TerminalSettings; // cache locale
        return new NullResponse();
    }

    public AuthorizePaymentTerminalDeviceResponse AuthorizePayment(AuthorizePaymentTerminalDeviceRequest request)
    {
        CultureInfo cultureInfo = new CultureInfo(this.terminalSettings.Locale);
        string localizedString = this.messagesResourceManager.GetString("CustomPaymentConnector_Decline", cultureInfo);
        string errorMessage = string.Format(localizedString, referenceNumber);
        bool isLocalized = true;
        PaymentError paymentError = new PaymentError(ErrorCode.Decline, errorMessage, isLocalized);
        PaymentInfo paymentInfo = new PaymentInfo();
        paymentInfo.Errors = new PaymentError[] { paymentError };
        return new AuthorizePaymentTerminalDeviceResponse(paymentInfo);
    }
}
\`\`\`
`.trim(),
    codeBlocks: [
      `// Non-localized custom error: set isLocalized = true on PaymentError
PaymentInfo paymentInfo = new PaymentInfo();
bool isLocalized = true;
string errorMessage = string.Format("Payment declined. Ref: '{0}'.", referenceNumber);
PaymentError paymentError = new PaymentError(ErrorCode.Decline, errorMessage, isLocalized);
paymentInfo.Errors = new PaymentError[] { paymentError };
return new AuthorizePaymentTerminalDeviceResponse(paymentInfo);`,
      `// Localized error: cache locale in Open, use ResourceManager in Authorize
private SettingsInfo terminalSettings;
private ResourceManager messagesResourceManager;

public PaymentDeviceSample()
{
    this.messagesResourceManager = new ResourceManager(
        "Contoso.Commerce.HardwareStation.PaymentSample.Resources.Messages",
        typeof(PaymentDeviceSample).GetTypeInfo().Assembly);
}

private Response Open(OpenPaymentTerminalDeviceRequest request)
{
    this.terminalSettings = request.TerminalSettings;
    return new NullResponse();
}

public AuthorizePaymentTerminalDeviceResponse AuthorizePayment(AuthorizePaymentTerminalDeviceRequest request)
{
    CultureInfo cultureInfo = new CultureInfo(this.terminalSettings.Locale);
    string localizedString = this.messagesResourceManager.GetString("CustomPaymentConnector_Decline", cultureInfo);
    string errorMessage = string.Format(localizedString, referenceNumber);
    bool isLocalized = true;
    PaymentError paymentError = new PaymentError(ErrorCode.Decline, errorMessage, isLocalized);
    PaymentInfo paymentInfo = new PaymentInfo();
    paymentInfo.Errors = new PaymentError[] { paymentError };
    return new AuthorizePaymentTerminalDeviceResponse(paymentInfo);
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "duplicate-payments-protection",
    title: "Enable Duplicate Payment Protection for Payment Connector",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/duplicate-payments-protection",
    category: "payments",
    tags: [
      "duplicate-payment", "GetTransactionReferencePaymentTerminalDeviceRequest",
      "GetTransactionByTransactionReferencePaymentTerminalDeviceRequest",
      "PaymentTransactionReferenceData", "idempotency", "payment-recovery",
      "INamedRequestHandler", "correlation-id", "lockToken", "eftTerminalId",
    ],
    summary:
      "How to implement duplicate payment protection in a payment connector. POS calls GetTransactionReferencePaymentTerminalDeviceRequest before every Authorize to get a unique correlation ID from the payment gateway (IdFromConnector). POS then creates a PaymentTransactionReferenceData with that ID and stamps it on the AuthorizePaymentTerminalDeviceRequest. Before key operations (pay, void, suspend), POS calls GetTransactionByTransactionReferencePaymentTerminalDeviceRequest with the PaymentTransactionReferenceData to recover an already-processed payment if the POS crashed. The correlation ID must NOT be cached in the connector — it must survive app restarts; typically the payment gateway generates it.",
    content: `
## Duplicate Payment Protection

### Prerequisite

The payment terminal or gateway must support a **unique transaction scope** — a unique reference identifier generated before payment starts that survives POS restarts. This is typically generated by the payment gateway, not cached in the connector.

### How it works

1. Before Authorize, POS calls **GetTransactionReferencePaymentTerminalDeviceRequest** → connector returns a unique ID (IdFromConnector) from the gateway.
2. POS creates **PaymentTransactionReferenceData** with that ID, stamps it on **AuthorizePaymentTerminalDeviceRequest**.
3. Before key operations (Authorize, Void, Suspend), POS calls **GetTransactionByTransactionReferencePaymentTerminalDeviceRequest** with the PaymentTransactionReferenceData to check if the payment already completed.
4. If the connector finds a completed payment, it returns it — POS uses it without triggering a new payment.

This recovers from POS crashes that happen after the gateway processes a payment but before POS receives the response.

### Supported POS flows where recovery is triggered

- Cashier invokes card payment (any amount)
- Cashier invokes cash payment
- Cashier attempts to void a cart line
- Cashier attempts to void the transaction
- Cashier attempts to suspend the transaction

### Required request implementations

\`\`\`csharp
public IEnumerable<Type> SupportedRequestTypes => new[]
{
    typeof(GetTransactionReferencePaymentTerminalDeviceRequest),        // new
    typeof(GetTransactionByTransactionReferencePaymentTerminalDeviceRequest), // new
    typeof(AuthorizePaymentTerminalDeviceRequest),                      // extended
    // ... all other existing types
};
\`\`\`

### GetTransactionReferencePaymentTerminalDeviceRequest

Request: \`(string lockToken, string posTerminalId, string eftTerminalId)\`
Response: \`GetTransactionReferencePaymentTerminalDeviceResponse(string id)\` — the unique ID from the gateway.

Do NOT generate the ID in the connector; let the payment gateway generate it. The ID must survive connector restarts.

### PaymentTransactionReferenceData properties

| Property | Description |
|---|---|
| Command | Sale / Refund / Activate / Load |
| IdFromConnector | ID returned by GetTransactionReferencePaymentTerminalDeviceRequest |
| InitiatedDate | When the payment transaction started |
| UniqueTransactionId | Cart transaction ID (not payment-specific) |
| Amount | Payment amount |

### GetTransactionByTransactionReferencePaymentTerminalDeviceRequest

Request: \`(string lockToken, PaymentTransactionReferenceData transactionReferenceData)\`
Response: \`GetTransactionByTransactionReferencePaymentTerminalDeviceResponse(PaymentInfo paymentInfo)\`

Return the recovered PaymentInfo if found, otherwise return a response indicating no existing transaction.
`.trim(),
    codeBlocks: [
      `// Add to SupportedRequestTypes in INamedRequestHandler
public IEnumerable<Type> SupportedRequestTypes => new[]
{
    typeof(GetTransactionReferencePaymentTerminalDeviceRequest),
    typeof(GetTransactionByTransactionReferencePaymentTerminalDeviceRequest),
    typeof(AuthorizePaymentTerminalDeviceRequest),
    // ... existing types
};`,
      `// Dispatch in Execute
if (requestType == typeof(GetTransactionReferencePaymentTerminalDeviceRequest))
    return this.GetTransactionReference((GetTransactionReferencePaymentTerminalDeviceRequest)request);
else if (requestType == typeof(GetTransactionByTransactionReferencePaymentTerminalDeviceRequest))
    return this.GetTransactionByTransactionReference((GetTransactionByTransactionReferencePaymentTerminalDeviceRequest)request);`,
      `// GetTransactionReference: let the gateway generate the unique ID
private GetTransactionReferencePaymentTerminalDeviceResponse GetTransactionReference(
    GetTransactionReferencePaymentTerminalDeviceRequest request)
{
    // Call the gateway to get a unique correlation ID for this payment scope
    string uniqueId = this.paymentGateway.GetNewTransactionReference(request.EftTerminalId);
    return new GetTransactionReferencePaymentTerminalDeviceResponse(uniqueId);
}

// GetTransactionByTransactionReference: look up a previously completed payment
private GetTransactionByTransactionReferencePaymentTerminalDeviceResponse GetTransactionByTransactionReference(
    GetTransactionByTransactionReferencePaymentTerminalDeviceRequest request)
{
    PaymentInfo existingPayment = this.paymentGateway.FindTransaction(
        request.TransactionReferenceData.IdFromConnector);
    return new GetTransactionByTransactionReferencePaymentTerminalDeviceResponse(existingPayment);
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── POS Extend Existing Functionality ────────────────────────────────────────
// Source: store commerce - extend existing functionality batch

const POS_EXTEND_ENTRIES: DocEntry[] = [
  {
    id: "pos-view-extension",
    title: "Extend POS views to add custom columns and app bar buttons",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-view-extension",
    category: "pos-extensions",
    tags: ["pos", "view-extension", "custom-columns", "app-bar", "SearchView", "CustomerAddEdit", "extend"],
    summary: "Extend existing POS views such as CustomerAddEditView and SearchView to add custom columns, app bar buttons, custom controls, and custom filters. Uses PosApi/Extend/Views/* modules and manifest.json extend.views section.",
    content: `# Extend POS views to add custom columns and app bar buttons

Use the screen layout designer for the Transaction and Welcome screens. For all other POS views (CustomerAddEditView, SearchView, etc.) use the Retail SDK extension framework.

## Extension points supported
- Custom app bar buttons (CustomerSearchExtensionCommandBase)
- Custom column sets (ICustomerSearchColumn, customerListConfiguration)
- Custom controls (controlsConfig.customControls)
- Custom filters

## Views supporting extensions
CustomerAddEditView, CustomerDetailsView, SearchView, InventoryLookupView, ShowJournalView, SimpleProductDetailsView, AddressAddEditView, PaymentView, PriceCheckView, SearchOrdersView, FulfillmentLineView, ReturnTransactionView, PickingAndReceivingDetailsView, and more.

## Custom app bar button — SearchView example
Extend CustomerSearchExtensionCommandBase:
\`\`\`typescript
import * as SearchView from "PosApi/Extend/Views/SearchView";
import { IExtensionCommandContext } from "PosApi/Extend/Views/AppBarCommands";

export default class ViewCustomerSummaryCommand extends SearchView.CustomerSearchExtensionCommandBase {
    private _customerSearchResults: ProxyEntities.GlobalCustomer[];

    constructor(context: IExtensionCommandContext<SearchView.ICustomerSearchToExtensionCommandMessageTypeMap>) {
        super(context);
        this.id = "viewCustomerSummaryCommand";
        this.label = context.resources.getString("string_1");
        this.extraClass = "iconLightningBolt";
        this._customerSearchResults = [];

        this.searchResultsSelectedHandler = (data: SearchView.CustomerSearchSearchResultSelectedData): void => {
            this._customerSearchResults = data.customers;
            this.canExecute = true;
        };
        this.searchResultSelectionClearedHandler = (): void => {
            this._customerSearchResults = [];
            this.canExecute = false;
        };
    }

    protected init(state: SearchView.ICustomerSearchExtensionCommandState): void {
        this.isVisible = true;
    }

    protected execute(): void {
        let customer = ArrayExtensions.firstOrUndefined(this._customerSearchResults);
        if (!ObjectExtensions.isNullOrUndefined(customer)) {
            let message = "Customer Account: " + customer.AccountNumber;
            MessageDialog.show(this.context, message);
        }
    }
}
\`\`\`

## Custom column set — SearchView example
\`\`\`typescript
import { ICustomerSearchColumn } from "PosApi/Extend/Views/SearchView";
import { ICustomColumnsContext } from "PosApi/Extend/Views/CustomListColumns";
import { ProxyEntities } from "PosApi/Entities";

export default (context: ICustomColumnsContext): ICustomerSearchColumn[] => {
    return [
        {
            title: context.resources.getString("string_2"),
            computeValue: (row: ProxyEntities.GlobalCustomer): string => { return row.AccountNumber; },
            ratio: 15,
            collapseOrder: 5,
            minWidth: 120
        },
        {
            title: context.resources.getString("string_3"),
            computeValue: (row: ProxyEntities.GlobalCustomer): string => { return row.FullName; },
            ratio: 20,
            collapseOrder: 4,
            minWidth: 200
        }
    ];
};
\`\`\`

## manifest.json registration
\`\`\`json
{
    "components": {
        "extend": {
            "views": {
                "SearchView": {
                    "customerAppBarCommands": [ { "modulePath": "ViewExtensions/Search/ViewCustomerSummaryCommand" } ],
                    "customerListConfiguration": { "modulePath": "ViewExtensions/Search/CustomCustomerSearchColumns" }
                }
            }
        }
    }
}
\`\`\`

## Access static resources in extensions
Use context.extensionPackageInfo.baseUrl to build paths to static resources (audio, images) bundled with the extension package.`,
    codeBlocks: [
      `export default class ViewCustomerSummaryCommand extends SearchView.CustomerSearchExtensionCommandBase {
    constructor(context) {
        super(context);
        this.searchResultsSelectedHandler = (data) => { this._customerSearchResults = data.customers; this.canExecute = true; };
    }
    protected init(state) { this.isVisible = true; }
    protected execute() { /* show dialog with customer details */ }
}`,
      `export default (context: ICustomColumnsContext): ICustomerSearchColumn[] => [
    { title: "ACCOUNT NUMBER", computeValue: (row) => row.AccountNumber, ratio: 15, collapseOrder: 5, minWidth: 120 },
    { title: "NAME", computeValue: (row) => row.FullName, ratio: 20, collapseOrder: 4, minWidth: 200 }
];`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-control-non-screen",
    title: "Add custom controls to nonscreen designer-based POS views",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-control-non-screen",
    category: "pos-extensions",
    tags: ["pos", "custom-control", "SimpleProductDetails", "CustomerDetails", "non-screen", "extend", "HTML"],
    summary: "Add custom controls (HTML+TypeScript pairs) to POS views that are NOT managed by the screen layout designer: CustomerAddEditView, AddressAddEditView, CustomerDetailsView, SimpleProductDetailsView, PriceCheckView. Extend the view-specific CustomControlBase class and implement onReady() to bind KnockoutJS template.",
    content: `# Add custom controls to nonscreen designer-based POS views

## Views supporting custom controls (non-screen-designer)
| POS view | Supports custom controls |
|---|---|
| Customer Add/Edit view | Yes (multiple) |
| Address Add/Edit view | Yes (multiple) |
| Customer details view | Yes (multiple) |
| Product details view (SimpleProductDetailsView) | Yes (multiple) |
| Price check view | Yes (multiple) |
| Cart view (screen layout designer) | Yes (10 max) |

## Pattern
1. Create an HTML file with a KnockoutJS template script block.
2. Create a TypeScript file extending the view-specific base class (e.g., SimpleProductDetailsCustomControlBase).
3. Implement onReady(element) to bind the template, and init(state) to load data.

## Example: Product availability panel in SimpleProductDetailsView
\`\`\`typescript
import {
    SimpleProductDetailsCustomControlBase,
    ISimpleProductDetailsCustomControlState,
    ISimpleProductDetailsCustomControlContext
} from "PosApi/Extend/Views/SimpleProductDetailsView";
import { InventoryLookupOperationRequest, InventoryLookupOperationResponse } from "PosApi/Consume/OrgUnits";
import { DataList, SelectionMode } from "PosUISdk/Controls/DataList";
import { ProxyEntities } from "PosApi/Entities";

export default class ProductAvailabilityPanel extends SimpleProductDetailsCustomControlBase {
    private static readonly TEMPLATE_ID = "Microsot_Pos_Extensibility_Samples_ProductAvailabilityPanel";
    public readonly orgUnitAvailabilities: ObservableArray<ProxyEntities.OrgUnitAvailability>;
    public readonly dataList: DataList<ProxyEntities.OrgUnitAvailability>;
    public readonly title: Observable<string>;

    constructor(id: string, context: ISimpleProductDetailsCustomControlContext) {
        super(id, context);
        this.orgUnitAvailabilities = ko.observableArray([]);
        this.title = ko.observable("Product Availability");
        this.dataList = new DataList<ProxyEntities.OrgUnitAvailability>({
            columns: [
                { title: "Location", ratio: 31, collapseOrder: 4, minWidth: 100,
                  computeValue: (v: ProxyEntities.OrgUnitAvailability) => v.OrgUnitLocation.OrgUnitName },
                { title: "Inventory", ratio: 23, collapseOrder: 3, minWidth: 60,
                  computeValue: (v) => ArrayExtensions.hasElements(v.ItemAvailabilities)
                    ? v.ItemAvailabilities[0].AvailableQuantity.toString() : "0" },
            ],
            itemDataSource: this.orgUnitAvailabilities,
            selectionMode: SelectionMode.None
        });
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindingsToNode(element, {
            template: { name: ProductAvailabilityPanel.TEMPLATE_ID, data: this }
        });
    }

    public init(state: ISimpleProductDetailsCustomControlState): void {
        if (!state.isSelectionMode) {
            this.isVisible = true;
            let request = new InventoryLookupOperationRequest<InventoryLookupOperationResponse>(
                state.product.RecordId, this.context.logger.getNewCorrelationId());
            this.context.runtime.executeAsync(request).then((result) => {
                if (!result.canceled) {
                    this.orgUnitAvailabilities(result.data.orgUnitAvailability);
                }
            });
        }
    }
}
\`\`\`

## HTML template file (ProductAvailabilityPanel.html)
\`\`\`html
<script id="Microsot_Pos_Extensibility_Samples_ProductAvailabilityPanel" type="text/html">
    <h2 data-bind="text: title"></h2>
    <div id="panel_DataList" data-bind="msPosDataList: dataList"></div>
</script>
\`\`\`

## manifest.json registration
\`\`\`json
{
    "components": {
        "extend": {
            "views": {
                "SimpleProductDetailsView": {
                    "controlsConfig": {
                        "customControls": [
                            {
                                "controlName": "productAvailabilityPanel",
                                "htmlPath": "ViewExtensions/SimpleProductDetails/ProductAvailabilityPanel.html",
                                "modulePath": "ViewExtensions/SimpleProductDetails/ProductAvailabilityPanel"
                            }
                        ]
                    }
                }
            }
        }
    }
}
\`\`\`

Note: Position of custom controls in non-screen-designer views is fixed at runtime (cannot be placed in a specific location).`,
    codeBlocks: [
      `export default class ProductAvailabilityPanel extends SimpleProductDetailsCustomControlBase {
    public onReady(element: HTMLElement): void {
        ko.applyBindingsToNode(element, { template: { name: TEMPLATE_ID, data: this } });
    }
    public init(state: ISimpleProductDetailsCustomControlState): void {
        if (!state.isSelectionMode) {
            this.isVisible = true;
            // execute InventoryLookupOperationRequest and populate orgUnitAvailabilities
        }
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-header-bar",
    title: "Add custom buttons to the POS header bar",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-header-bar",
    category: "pos-extensions",
    tags: ["pos", "header-bar", "CustomPackingItem", "customPackingItems", "cartChangedHandler", "extend"],
    summary: "Add custom buttons/items to the POS application header bar by extending CustomPackingItem from PosApi/Extend/Header. The class handles packed and unpacked states via onReady(packedElement, unpackedElement), reacts to cart changes via cartChangedHandler, and is registered in manifest.json under components.extend.header.customPackingItems.",
    content: `# Add custom buttons to the POS header bar

Custom header bar items extend the **CustomPackingItem** class from \`PosApi/Extend/Header\`. Each item has two visual states: packed (compact, icon-only) and unpacked (full label shown).

## CustomPackingItem key members
| Member | Description |
|---|---|
| CustomPackingItemPosition | Position relative to built-in header items (Before / After) |
| cartChangedHandler | Event fired when cart is updated |
| onReady(packedElement, unpackedElement) | Called when DOM elements are ready — bind both templates here |
| init(state) | Initialize the control |
| dispose() | Release subscriptions |

## Example: Amount-due header button
\`\`\`typescript
import {
    CustomPackingItem, ICustomPackingItemContext,
    CustomPackingItemPosition, ICustomPackingItemState, CartChangedData
} from "PosApi/Extend/Header";
import { CurrencyFormatter } from "PosApi/Consume/Formatters";

export default class CartAmountDuePackingItem extends CustomPackingItem {
    public readonly position: CustomPackingItemPosition = CustomPackingItemPosition.After;
    public amountDueLabel: Observable<string>;
    private _currentAmountDue: Observable<number>;
    private _amountDueSubscription: IDisposable;

    constructor(id: string, context: ICustomPackingItemContext) {
        super(id, context);
        this.amountDueLabel = ko.observable("");
        this._currentAmountDue = ko.observable(0);
        this._amountDueSubscription = this._currentAmountDue.subscribe((newValue: number) => {
            if (newValue > 0) {
                this.amountDueLabel(CurrencyFormatter.toCurrency(newValue));
                this.visible = true;
            } else {
                this.visible = false;
            }
        });
        this.cartChangedHandler = this._cartChangedHandler.bind(this);
    }

    public onReady(packedElement: HTMLElement, unpackedElement: HTMLElement): void {
        ko.applyBindingsToNode(unpackedElement, {
            template: { name: "Microsoft_Pos_Extensibility_Samples_UnpackedCartAmountDueItem", data: this }
        });
        ko.applyBindingsToNode(packedElement, {
            template: { name: "Microsoft_Pos_Extensibility_Samples_PackedCartAmountDueItem", data: this }
        });
    }

    public init(state: ICustomPackingItemState): void { return; }

    public dispose(): void {
        this._amountDueSubscription.dispose();
        super.dispose();
    }

    public onItemClickedHandler(): void {
        const correlationId = this.context.logger.getNewCorrelationId();
        let cartViewOptions = new ClientEntities.CartViewNavigationParameters(correlationId);
        this.context.navigator.navigateToPOSView("CartView", cartViewOptions);
    }

    private _cartChangedHandler(data: CartChangedData): void {
        this._currentAmountDue(data.cart.AmountDue);
    }
}
\`\`\`

## manifest.json registration
\`\`\`json
{
    "components": {
        "extend": {
            "header": {
                "customPackingItems": [
                    {
                        "name": "CartAmountDuePackingItem",
                        "description": "Shows amount due in header.",
                        "modulePath": "CartAmountDuePackingItem",
                        "htmlPath": "CartAmountDuePackingItem.html"
                    }
                ]
            }
        }
    }
}
\`\`\``,
    codeBlocks: [
      `export default class CartAmountDuePackingItem extends CustomPackingItem {
    public readonly position = CustomPackingItemPosition.After;
    constructor(id: string, context: ICustomPackingItemContext) {
        super(id, context);
        this.cartChangedHandler = (data: CartChangedData) => {
            this._currentAmountDue(data.cart.AmountDue);
        };
    }
    public onReady(packedElement: HTMLElement, unpackedElement: HTMLElement): void {
        ko.applyBindingsToNode(unpackedElement, { template: { name: "UnpackedTemplate", data: this } });
        ko.applyBindingsToNode(packedElement, { template: { name: "PackedTemplate", data: this } });
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-notification-extension",
    title: "Show custom notifications in the POS",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extend-pos-notification",
    category: "pos-extensions",
    tags: ["pos", "notification", "GetNotificationsExtensionServiceRequest", "NotificationDetailCollection", "CRT", "scheduler"],
    summary: "Extend the POS notification framework to display custom notifications. Requires: (1) CRT extension overriding GetNotificationsExtensionServiceRequest returning GetNotificationsExtensionServiceResponse with NotificationDetailCollection, (2) a POS operation handler for the matching operation ID (>5000), (3) configuring the notification scheduler in HQ.",
    content: `# Show custom notifications in the POS

The POS notification framework runs periodically. POS calls the CRT notification service which returns notification details. When the user clicks the notification tile, the corresponding POS operation handler executes.

## How it works
1. POS notification scheduler runs at configured intervals
2. CRT's GetNotificationsExtensionServiceRequest is called per configured operation
3. CRT returns GetNotificationsExtensionServiceResponse with NotificationDetailCollection
4. POS displays the notification; on click, runs the linked POS operation handler

## Required steps
1. In HQ: create a POS operation with ID > 5000 (Retail and Commerce > Channel Setup > POS Setup > POS > POS operations)
2. CRT: override GetNotificationsExtensionServiceRequest
3. POS: create an operation handler for the same operation ID
4. HQ: configure notification scheduler for the custom operation

## CRT extension
Override **GetNotificationsExtensionServiceRequest**, return **GetNotificationsExtensionServiceResponse**:

\`\`\`csharp
public class NotificationExtensionService : SingleRequestHandler<GetNotificationsExtensionServiceRequest, GetNotificationsExtensionServiceResponse>
{
    protected override GetNotificationsExtensionServiceResponse Process(GetNotificationsExtensionServiceRequest request)
    {
        ThrowIf.Null(request, "request");
        NotificationDetailCollection details = new NotificationDetailCollection();
        string myOperationId = "5000";

        if (request.SubscribedOperation.ToString() == myOperationId)
        {
            NotificationDetail detail = new NotificationDetail()
            {
                DisplayText = "Custom notification",
                ItemCount = 1,
                LastUpdatedDateTime = DateTimeOffset.Now,
                IsSuccess = true,
                ActionProperty = "1"  // sent to POS operation as parameter
            };
            details.Add(detail);
        }
        return new GetNotificationsExtensionServiceResponse(details);
    }
}
\`\`\`

## NotificationDetail properties
| Property | Description |
|---|---|
| ActionProperty | Custom parameter passed to the POS operation handler |
| DisplayText | Text shown in the notification |
| ItemCount | Number of notifications |
| IsNew | Whether notification is new |
| IsSuccess | Whether retrieval succeeded |
| LastUpdatedDateTime | Timestamp for freshness |

## Deploying CRT extension
- Build and drop output assembly to \\RetailServer\\webroot\\bin\\Ext
- Register in CommerceRuntime.Ext.config under \`<composition>\`

## POS operation handler
When notification is clicked, POS calls the operation handler matching the operation ID. Write business logic there (e.g., show pending pickup orders).`,
    codeBlocks: [
      `public class NotificationExtensionService : SingleRequestHandler<GetNotificationsExtensionServiceRequest, GetNotificationsExtensionServiceResponse>
{
    protected override GetNotificationsExtensionServiceResponse Process(GetNotificationsExtensionServiceRequest request)
    {
        NotificationDetailCollection details = new NotificationDetailCollection();
        if (request.SubscribedOperation.ToString() == "5000")
        {
            details.Add(new NotificationDetail() {
                DisplayText = "Custom notification",
                ItemCount = 1,
                LastUpdatedDateTime = DateTimeOffset.Now,
                IsSuccess = true,
                ActionProperty = "1"
            });
        }
        return new GetNotificationsExtensionServiceResponse(details);
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-request-handler-override",
    title: "Override POS request handlers",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-handler",
    category: "pos-extensions",
    tags: ["pos", "request-handler", "override", "GetSerialNumberClientRequestHandler", "defaultExecuteAsync", "executeAsync", "PosApi/Extend/RequestHandlers"],
    summary: "Override existing POS business logic by extending a request handler class from PosApi/Extend/RequestHandlers/*. Implement executeAsync() with custom logic; call defaultExecuteAsync() to fall back to standard behavior. Register the override in manifest.json under components.extend.requestHandlers. Used to automate serial numbers, custom payment flows, etc.",
    content: `# Override POS request handlers

Extend the standard POS business logic by overriding request handlers. Extend the handler class, implement executeAsync(), and optionally call defaultExecuteAsync() for standard behavior.

## Pattern
1. Create a class extending the target handler from \`PosApi/Extend/RequestHandlers/*\`
2. Implement \`executeAsync(request)\` with custom logic
3. Call \`this.defaultExecuteAsync(request)\` to invoke standard behavior when needed
4. Register in manifest.json under \`components.extend.requestHandlers\`

## Example: Override GetSerialNumberClientRequestHandler to auto-assign serial number
\`\`\`typescript
import { GetSerialNumberClientRequestHandler } from "PosApi/Extend/RequestHandlers/ProductsRequestHandlers";
import { GetSerialNumberClientRequest, GetSerialNumberClientResponse } from "PosApi/Consume/Products";
import { ClientEntities } from "PosApi/Entities";

export default class GetSerialNumberClientRequestHandlerExt extends GetSerialNumberClientRequestHandler {
    public executeAsync(request: GetSerialNumberClientRequest<GetSerialNumberClientResponse>):
        Promise<ClientEntities.ICancelableDataResult<GetSerialNumberClientResponse>> {

        // Auto-assign serial number for item 82001 without showing dialog
        if (request.product.ItemId === "82001") {
            let response = new GetSerialNumberClientResponse("112233");
            return Promise.resolve<ClientEntities.ICancelableDataResult<GetSerialNumberClientResponse>>({
                canceled: false,
                data: response
            });
        }
        // For all other items, use standard dialog behavior
        return this.defaultExecuteAsync(request);
    }
}
\`\`\`

## manifest.json
\`\`\`json
{
    "components": {
        "extend": {
            "requestHandlers": [
                {
                    "modulePath": "Handlers/GetSerialNumberClientRequestHandlerExt"
                }
            ]
        }
    }
}
\`\`\`

## Available overridable handlers (selection)

### Cart handlers
- AddTenderLineToCartClientRequestHandler
- GetKeyedInPriceClientRequestHandler
- GetPickupDateClientRequestHandler
- ShowChangeDueClientRequestHandler
- GetReceiptEmailAddressClientRequestHandler
- DepositOverrideOperationRequestHandler

### Payment handlers
- GetGiftCardByIdServiceRequestHandler
- GetPaymentCardTypeByBinRangeClientRequestHandler

### Peripherals handlers
- CardPaymentAuthorizePaymentRequestHandler
- CardPaymentCapturePaymentRequestHandler
- CardPaymentVoidPaymentRequestHandler
- PaymentTerminalAuthorizePaymentActivityRequestHandler
- CashDrawerOpenRequestHandler

### Scan handler
- GetScanResultClientRequestHandler

### Store operations handlers
- CreateTenderRemovalTransactionClientRequestHandler
- SelectZipCodeInfoClientRequestHandler
- LoyaltyCardPointsBalanceOperationRequestHandler

### Sales orders handlers
- GetGiftReceiptsClientRequestHandler
- SelectCustomerOrderTypeClientRequestHandler

Note: Not all request handler logic is exposed for overriding. Check Pos.api.d.ts in the Retail SDK for the current full list. If a needed handler is not overridable, create a support ticket or log a request in LCS extensibility tool.`,
    codeBlocks: [
      `export default class GetSerialNumberClientRequestHandlerExt extends GetSerialNumberClientRequestHandler {
    public executeAsync(request: GetSerialNumberClientRequest<GetSerialNumberClientResponse>):
        Promise<ClientEntities.ICancelableDataResult<GetSerialNumberClientResponse>> {
        if (request.product.ItemId === "82001") {
            return Promise.resolve({ canceled: false, data: new GetSerialNumberClientResponse("112233") });
        }
        return this.defaultExecuteAsync(request);
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-trigger-printing",
    title: "Store Commerce app triggers and printing",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-trigger-printing",
    category: "pos-extensions",
    tags: ["pos", "triggers", "printing", "PostSuspendTransactionTrigger", "PreOperationTrigger", "PostOperationTrigger", "CustomReceipt7", "GetReceiptsClientRequest"],
    summary: "POS triggers capture events before/after Store Commerce operations. Pre-triggers are cancelable; post-triggers are not. Printing scenario: implement PostSuspendTransactionTrigger to retrieve receipt data via GetReceiptsClientRequest (ReceiptType.CustomReceipt7) and print via PrinterPrintRequest. CRT extension overrides GetCustomReceiptsRequest to generate the receipt content.",
    content: `# Store Commerce app triggers and printing

Triggers capture events before or after POS operations. Pre-triggers can cancel the operation; post-triggers cannot. Register triggers in manifest.json under \`components.extend.triggers\`.

## Generic triggers (any operation)
- **PreOperationTrigger** (Cancelable) — runs before any POS operation
- **PostOperationTrigger** (Noncancelable) — runs after any POS operation
- **PreOperationValidationTrigger** (Cancelable)
- **OperationFailureTrigger** (Noncancelable)

## Key trigger categories

### Transaction triggers
- BeginTransactionTrigger | PreEndTransactionTrigger | PostEndTransactionTrigger
- PreSuspendTransactionTrigger | **PostSuspendTransactionTrigger**
- PreVoidTransactionTrigger | PostVoidTransactionTrigger
- PreRecallTransactionTrigger | PostRecallTransactionTrigger

### Product triggers
- PreProductSaleTrigger | PostProductSaleTrigger
- PostGetSerialNumberTrigger
- PrePriceOverrideTrigger | PostPriceOverrideTrigger
- PreVoidProductsTrigger | PostVoidProductsTrigger

### Payment triggers
- PrePaymentTrigger | PostPaymentTrigger
- PreAddTenderLineTrigger | PreVoidPaymentTrigger
- PreTenderPaymentTrigger (10.0.21)

### Printing triggers
- PrePrintReceiptCopyTrigger (Cancelable)
- PostReceiptPromptTrigger (Noncancelable)

### Application triggers
- ApplicationStartTrigger | ApplicationSuspendTrigger
- PreLogOnTriggerTrigger | PostLogOnTriggerTrigger
- PreLockTerminalTrigger | PostLockTerminalTrigger

## Business scenario: Print custom receipt on transaction suspend

### POS trigger implementation
\`\`\`typescript
import * as Triggers from "PosApi/Extend/Triggers/TransactionTriggers";
import { PrinterPrintRequest, PrinterPrintResponse } from "PosApi/Consume/Peripherals";
import { GetHardwareProfileClientRequest, GetHardwareProfileClientResponse } from "PosApi/Consume/Device";
import { GetReceiptsClientRequest, GetReceiptsClientResponse } from "PosApi/Consume/SalesOrders";
import { ProxyEntities } from "PosApi/Entities";

export default class PostSuspendTransactionTrigger extends Triggers.PostSuspendTransactionTrigger {
    public execute(options: Triggers.IPostSuspendTransactionTriggerOptions): Promise<void> {
        return this.context.runtime.executeAsync(new GetHardwareProfileClientRequest())
            .then((response) => {
                let hardwareProfile: ProxyEntities.HardwareProfile = response.data.result;
                let receiptCriteria: ProxyEntities.ReceiptRetrievalCriteria = {
                    IsCopy: false,
                    IsRemoteTransaction: false,
                    IsPreview: false,
                    QueryBySalesId: true,
                    ReceiptTypeValue: ProxyEntities.ReceiptType.CustomReceipt7,
                    HardwareProfileId: hardwareProfile.ProfileId
                };
                return this.context.runtime.executeAsync(
                    new GetReceiptsClientRequest(options.cart.Id, receiptCriteria));
            })
            .then((response) => {
                return this.context.runtime.executeAsync(
                    new PrinterPrintRequest(response.data.result));
            })
            .then(() => Promise.resolve())
            .catch((reason) => {
                this.context.logger.logError("PostSuspendTransactionTrigger error: " + JSON.stringify(reason));
                return Promise.resolve();
            });
    }
}
\`\`\`

## manifest.json registration
\`\`\`json
{
    "components": {
        "extend": {
            "triggers": [
                {
                    "triggerType": "PostSuspendTransaction",
                    "modulePath": "TriggersHandlers/PostSuspendTransactionTrigger"
                }
            ]
        }
    }
}
\`\`\`

## CRT extension — generate receipt data
Override GetCustomReceiptsRequest in CRT. Use GetCartRequest to fetch suspended transaction (it's still in cart table), convert to SalesOrder via CopyFrom<SalesTransaction>, then call GetReceiptServiceRequest with ReceiptType.CustomReceipt7.

## HQ setup
1. Create receipt format (Receipts formats) with type CustomReceiptType7
2. Add to receipt profile (Receipt profiles)
3. Run distribution job 1090`,
    codeBlocks: [
      `export default class PostSuspendTransactionTrigger extends Triggers.PostSuspendTransactionTrigger {
    public execute(options: Triggers.IPostSuspendTransactionTriggerOptions): Promise<void> {
        return this.context.runtime.executeAsync(new GetHardwareProfileClientRequest())
            .then(response => this.context.runtime.executeAsync(new GetReceiptsClientRequest(options.cart.Id, {
                IsCopy: false, IsRemoteTransaction: false, IsPreview: false, QueryBySalesId: true,
                ReceiptTypeValue: ProxyEntities.ReceiptType.CustomReceipt7,
                HardwareProfileId: response.data.result.ProfileId
            })))
            .then(response => this.context.runtime.executeAsync(new PrinterPrintRequest(response.data.result)))
            .then(() => Promise.resolve())
            .catch(reason => { this.context.logger.logError(JSON.stringify(reason)); return Promise.resolve(); });
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-cart-view-handlers",
    title: "POS Cart view events and handlers",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cart-view-handlers",
    category: "pos-extensions",
    tags: ["pos", "cart-view", "CartExtensionViewControllerBase", "cartLineSelectedHandler", "CartViewCustomControlBase", "CustomLinesGridColumnBase", "CartViewTotalsPanelCustomFieldBase"],
    summary: "The POS Cart view exposes event handlers via CartExtensionViewControllerBase: cartLineSelectedHandler, cartLineSelectionClearedHandler, tenderLineSelectedHandler, cartChangedHandler, processingAddItemOrCustomerChangedHandler. Use the same handlers in CartViewCustomControlBase (custom controls), CartViewTotalsPanelCustomFieldBase (totals panel), CustomLinesGridColumnBase (lines grid), CustomPaymentsGridColumnBase, and CustomDeliveryGridColumnBase.",
    content: `# POS Cart view events and handlers

The Cart view exposes events/handlers for extensions to react to user interactions. Use the base class CartExtensionViewControllerBase as the extension controller.

## CartExtensionViewControllerBase event handlers
| Handler | Description |
|---|---|
| cartLineSelectedHandler(data: CartLineSelectedData) | Cart line selected |
| cartLineSelectionClearedHandler() | Cart line selection cleared |
| tenderLineSelectedHandler(data: TenderLineSelectedData) | Tender line selected |
| tenderLineSelectionClearedHandler() | Tender line selection cleared |
| cartChangedHandler(data: CartChangedData) | Cart data changed |
| processingAddItemOrCustomerChangedHandler(processing: boolean) | Item/customer processing state changed |
| setSelectedCartLines(data: SetSelectedCartLinesData) | Select specific cart lines programmatically |

## Example: CartViewController consuming events
\`\`\`typescript
import { IExtensionCartViewControllerContext } from "PosApi/Extend/Views/CartView";
import * as CartView from "PosApi/Extend/Views/CartView";

export default class CartViewController extends CartView.CartExtensionViewControllerBase {
    public static selectedCartLineId: string = "";
    private _selectedCartLines: ProxyEntities.CartLine[];
    private _isProcessingAddItemOrCustomer: boolean;

    constructor(context: IExtensionCartViewControllerContext) {
        super(context);

        this.cartLineSelectedHandler = (data: CartView.CartLineSelectedData): void => {
            this._selectedCartLines = data.cartLines;
            if (ArrayExtensions.hasElements(this._selectedCartLines)) {
                CartViewController.selectedCartLineId = this._selectedCartLines[0].LineId;
            }
        };

        this.cartLineSelectionClearedHandler = (): void => {
            this._selectedCartLines = undefined;
            CartViewController.selectedCartLineId = null;
        };

        this.tenderLineSelectedHandler = (data: CartView.TenderLineSelectedData): void => {
            this._selectedTenderLines = data.tenderLines;
        };

        this.processingAddItemOrCustomerChangedHandler = (processing: boolean): void => {
            this._isProcessingAddItemOrCustomer = processing;
        };
    }
}
\`\`\`

## Base classes for Cart view UI extensions

### CartViewCustomControlBase (custom controls on Cart view)
Supports same handlers as CartExtensionViewControllerBase: cartLineSelectedHandler, tenderLineSelectedHandler, cartChangedHandler, processingAddItemOrCustomerChangedHandler, setSelectedCartLines.

### CartViewTotalsPanelCustomFieldBase (custom fields in Totals pane)
\`\`\`typescript
public computeValue(cart: ProxyEntities.Cart): string {
    // Compute and return the display value for this custom field
}
\`\`\`

### CustomLinesGridColumnBase (custom columns in Lines grid)
\`\`\`typescript
public title(): string { return "Column Title"; }
public computeValue(cartLine: ProxyEntities.CartLine): string { return cartLine.LineNumber.toString(); }
public alignment(): CustomGridColumnAlignment { return CustomGridColumnAlignment.Right; }
\`\`\`

### CustomPaymentsGridColumnBase (custom columns in Payment grid)
Same interface as CustomLinesGridColumnBase but for payment lines.

### CustomDeliveryGridColumnBase (custom columns in Delivery grid)
Same interface as CustomLinesGridColumnBase but for delivery lines.`,
    codeBlocks: [
      `export default class CartViewController extends CartView.CartExtensionViewControllerBase {
    constructor(context: IExtensionCartViewControllerContext) {
        super(context);
        this.cartLineSelectedHandler = (data) => { this._selectedCartLines = data.cartLines; };
        this.cartLineSelectionClearedHandler = () => { this._selectedCartLines = undefined; };
        this.cartChangedHandler = (data) => { /* react to cart updates */ };
        this.processingAddItemOrCustomerChangedHandler = (processing) => { this._isProcessing = processing; };
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-custom-totals-field",
    title: "Add custom fields to the POS Totals panel",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/custom-field-pos-totals",
    category: "pos-extensions",
    tags: ["pos", "totals-panel", "CartViewTotalsPanelCustomFieldBase", "computeValue", "custom-field", "Language text", "screen-layout"],
    summary: "Add custom calculated fields to the POS Totals panel. HQ configuration: Language text (text ID) + Custom fields page (Type=Totals area, Caption text ID) + screen layout designer drag-and-drop + distribution job 1090. POS extension: extend CartViewTotalsPanelCustomFieldBase and implement computeValue(cart). Register in manifest.json under views.CartView.totalsPanel.customFields with fieldName matching HQ name.",
    content: `# Add custom fields to the POS Totals panel

## HQ configuration (required first)
1. **Language text** (Retail and Commerce > Channel setup > POS setup > POS profiles > Language text): Add text entries per language for the field label (same text ID across languages).
2. **Custom fields** (Retail and Commerce > Channel setup > POS setup > POS profiles > Custom fields): Add field with Type = "Totals area", Caption text ID matching step 1.
3. **Screen layout designer**: Open layout > Totals panel > Customize > move custom field to left/right column.
4. **Distribution schedule**: Run Registers (1090) job.

## POS extension
Extend **CartViewTotalsPanelCustomFieldBase** from \`PosApi/Extend/Views/CartView\`:
\`\`\`typescript
import { CartViewTotalsPanelCustomFieldBase } from "PosApi/Extend/Views/CartView";
import { ProxyEntities } from "PosApi/Entities";

export default class SampleCustomField extends CartViewTotalsPanelCustomFieldBase {
    public computeValue(cart: ProxyEntities.Cart): string {
        // Show 10% of total amount
        if (isNaN(cart.TotalAmount) || cart.TotalAmount <= 0) {
            return "$0.00";
        }
        return "$" + (cart.TotalAmount * 0.1).toFixed(2).toString();
    }
}
\`\`\`

## manifest.json registration
The **fieldName** must exactly match the name configured in HQ Custom fields:
\`\`\`json
{
    "components": {
        "extend": {
            "views": {
                "CartView": {
                    "totalsPanel": {
                        "customFields": [
                            {
                                "fieldName": "Sample",
                                "modulePath": "Cart/SampleCustomField"
                            }
                        ]
                    }
                }
            }
        }
    }
}
\`\`\`

## Multiple custom fields
Add separate TypeScript files for each, each extending CartViewTotalsPanelCustomFieldBase, and list all in the customFields array:
\`\`\`json
"customFields": [
    { "fieldName": "Sample1", "modulePath": "Cart/SampleCustomField1" },
    { "fieldName": "Sample2", "modulePath": "Cart/SampleCustomField2" }
]
\`\`\`

Sample code: \`..\\RetailSDK\\POS\\Extensions\\SampleExtensions\\ViewExtensions\\Cart\\TipsCustomField.ts\``,
    codeBlocks: [
      `export default class SampleCustomField extends CartViewTotalsPanelCustomFieldBase {
    public computeValue(cart: ProxyEntities.Cart): string {
        if (isNaN(cart.TotalAmount) || cart.TotalAmount <= 0) { return "$0.00"; }
        return "$" + (cart.TotalAmount * 0.1).toFixed(2).toString();
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-custom-transaction-column",
    title: "Add custom columns to the POS transaction grid",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-transaction-column",
    category: "pos-extensions",
    tags: ["pos", "custom-column", "transaction-grid", "CustomLinesGridColumnBase", "linesGrid", "CustomGridColumnAlignment", "screen-layout"],
    summary: "Add custom columns to the POS transaction (cart) lines, payment, or delivery grids. HQ: screen layout designer adds custom column slots (up to 10 per layout) then run job 1090. POS extension: extend CustomLinesGridColumnBase from PosApi/Extend/Views/CartView, implement title(), computeValue(), alignment(). Register in manifest under views.CartView.linesGrid.customColumn1.",
    content: `# Add custom columns to the POS transaction grid

## HQ configuration
1. Sign in to Commerce > Retail and Commerce > Channel setup > POS setup > POS > Screen layouts
2. Select layout (e.g., F3MGR) > Designer > 1440x960 Full > Layout designer
3. Right-click transaction grid > Customize > select "lines" pivot > move "Custom column 1" to Selected columns
4. Similarly for Payment or Delivery tabs
5. Run distribution job Registers (1090)

The layout supports up to **10 custom columns** (customColumn1 through customColumn10).

## POS extension
Extend **CustomLinesGridColumnBase** from \`PosApi/Extend/Views/CartView\`:
\`\`\`typescript
import {
    ICustomLinesGridColumnContext,
    CustomLinesGridColumnBase
} from "PosApi/Extend/Views/CartView";
import { CustomGridColumnAlignment } from "PosApi/Extend/Views/CustomGridColumns";
import { ProxyEntities } from "PosApi/Entities";

export default class LinesCustomGridColumn1 extends CustomLinesGridColumnBase {
    constructor(context: ICustomLinesGridColumnContext) {
        super(context);
    }

    public title(): string {
        return "Line number";
    }

    public computeValue(cartLine: ProxyEntities.CartLine): string {
        return cartLine.LineNumber.toString();
    }

    public alignment(): CustomGridColumnAlignment {
        return CustomGridColumnAlignment.Right;
    }
}
\`\`\`

## manifest.json registration
\`\`\`json
{
    "components": {
        "extend": {
            "views": {
                "CartView": {
                    "linesGrid": {
                        "customColumn1": { "modulePath": "Cart/LinesGrid/CustomColumn1Configuration" }
                    }
                }
            }
        }
    }
}
\`\`\`

For payment or delivery grids:
\`\`\`json
"paymentsGrid": {
    "customColumn1": { "modulePath": "Cart/PaymentsGrid/CustomColumn1Configuration" }
},
"deliveryGrid": {
    "customColumn1": { "modulePath": "Cart/DeliveryGrid/CustomColumn1Configuration" }
}
\`\`\`

## CustomGridColumnAlignment values
- CustomGridColumnAlignment.Left = 0
- CustomGridColumnAlignment.Right = 1`,
    codeBlocks: [
      `export default class LinesCustomGridColumn1 extends CustomLinesGridColumnBase {
    constructor(context: ICustomLinesGridColumnContext) { super(context); }
    public title(): string { return "Line number"; }
    public computeValue(cartLine: ProxyEntities.CartLine): string { return cartLine.LineNumber.toString(); }
    public alignment(): CustomGridColumnAlignment { return CustomGridColumnAlignment.Right; }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-custom-transaction-control",
    title: "Add custom controls to POS transaction pages (Cart view)",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-transaction",
    category: "pos-extensions",
    tags: ["pos", "cart-view", "custom-control", "CartViewCustomControlBase", "CartExtensionViewControllerBase", "viewController", "screen-layout-designer"],
    summary: "Add HTML+TypeScript custom controls to the POS Cart/transaction page. HQ: screen layout designer drag-and-drop with Control Name, Package Name, Publisher Name matching manifest then run job 1090. POS: extend CartViewCustomControlBase (HTML+TS control) and CartExtensionViewControllerBase (view controller). Register under views.CartView.viewController and views.CartView.controlsConfig.customControls.",
    content: `# Add custom controls to POS transaction pages (Cart view)

## HQ configuration
1. Screen Layouts > Designer > drag custom control from left pane onto page
2. Right-click custom control > Customize:
   - **Control Name**: lineDetails (must match controlName in manifest)
   - **Package Name**: Pos_Extensibility_Samples (must match manifest name)
   - **Publisher Name**: Contoso (must match manifest publisher)
3. Run Registers (1090) distribution job

## POS extension — view controller (CartExtensionViewControllerBase)
\`\`\`typescript
import * as CartView from "PosApi/Extend/Views/CartView";

export default class CartViewController extends CartView.CartExtensionViewControllerBase {
    private _selectedCartLines: ProxyEntities.CartLine[];

    constructor(context: IExtensionCartViewControllerContext) {
        super(context);
        this.cartLineSelectedHandler = (data: CartView.CartLineSelectedData): void => {
            this._selectedCartLines = data.cartLines;
        };
        this.cartLineSelectionClearedHandler = (): void => {
            this._selectedCartLines = undefined;
        };
    }
}
\`\`\`

## POS extension — custom control (CartViewCustomControlBase)
\`\`\`typescript
import {
    CartViewCustomControlBase, ICartViewCustomControlState,
    ICartViewCustomControlContext, CartLineSelectedData
} from "PosApi/Extend/Views/CartView";
import { ProxyEntities } from "PosApi/Entities";

export default class LineDetailsCustomControl extends CartViewCustomControlBase {
    private static readonly TEMPLATE_ID = "Microsoft_Pos_Extensibility_Samples_LineDetails";
    public readonly cartLineItemId: Computed<string>;
    public readonly cartLineDescription: Computed<string>;
    public readonly isCartLineSelected: Computed<boolean>;
    private readonly _cartLine: Observable<ProxyEntities.CartLine>;

    constructor(id: string, context: ICartViewCustomControlContext) {
        super(id, context);
        this._cartLine = ko.observable(null);
        this.cartLineItemId = ko.computed(() => {
            let cartLine = this._cartLine();
            return !ObjectExtensions.isNullOrUndefined(cartLine) ? cartLine.ItemId : "";
        });
        this.cartLineDescription = ko.computed(() => {
            let cartLine = this._cartLine();
            return !ObjectExtensions.isNullOrUndefined(cartLine) ? cartLine.Description : "";
        });
        this.isCartLineSelected = ko.computed(() => !ObjectExtensions.isNullOrUndefined(this._cartLine()));
        this.cartLineSelectedHandler = (data: CartLineSelectedData) => {
            if (ArrayExtensions.hasElements(data.cartLines)) {
                this._cartLine(data.cartLines[0]);
            }
        };
        this.cartLineSelectionClearedHandler = () => { this._cartLine(null); };
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindingsToNode(element, {
            template: { name: LineDetailsCustomControl.TEMPLATE_ID, data: this }
        });
    }

    public init(state: ICartViewCustomControlState): void {
        this._state = state;
    }
}
\`\`\`

## manifest.json
\`\`\`json
{
    "name": "Pos_Extensibility_Samples",
    "publisher": "Contoso",
    "components": {
        "extend": {
            "views": {
                "CartView": {
                    "viewController": { "modulePath": "Cart/CartViewController" },
                    "controlsConfig": {
                        "customControls": [
                            {
                                "controlName": "lineDetails",
                                "htmlPath": "Cart/LineDetailsCustomControl.html",
                                "modulePath": "Cart/LineDetailsCustomControl"
                            }
                        ]
                    }
                }
            }
        }
    }
}
\`\`\``,
    codeBlocks: [
      `export default class LineDetailsCustomControl extends CartViewCustomControlBase {
    constructor(id: string, context: ICartViewCustomControlContext) {
        super(id, context);
        this._cartLine = ko.observable(null);
        this.cartLineItemId = ko.computed(() => this._cartLine()?.ItemId ?? "");
        this.cartLineSelectedHandler = (data) => { if (data.cartLines.length) this._cartLine(data.cartLines[0]); };
        this.cartLineSelectionClearedHandler = () => { this._cartLine(null); };
    }
    public onReady(element: HTMLElement): void {
        ko.applyBindingsToNode(element, { template: { name: TEMPLATE_ID, data: this } });
    }
    public init(state: ICartViewCustomControlState): void { this._state = state; }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-custom-control-views",
    title: "Add custom controls to POS views (general pattern)",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-custom-control",
    category: "pos-extensions",
    tags: ["pos", "custom-control", "SimpleProductDetailsView", "msPosDataList", "extensionPackageInfo", "screen-layout-designer", "HTML-template"],
    summary: "General guide for adding HTML+TypeScript custom controls to POS views. Cart view supports screen layout designer for positioning; all other views (CustomerDetails, ProductDetails, CustomerAddEdit, AddressAddEdit) use fixed positions via the extension manifest. Pattern: HTML file with KnockoutJS template + TypeScript class extending the view-specific CustomControlBase. Reference static resources via context.extensionPackageInfo.baseUrl.",
    content: `# Add custom controls to POS views (general pattern)

Custom controls are HTML+TypeScript pairs added to existing POS views via the extension framework.

## View support matrix
| POS view | Custom controls | Screen layout designer |
|---|---|---|
| Cart view / Transaction page | Yes | Yes (drag-and-drop positioning) |
| Customer details view | Yes | No (fixed position) |
| Product details view (SimpleProductDetailsView) | Yes | No (fixed position) |
| Customer Add/Edit view | Yes | No (fixed position) |
| Address Add/Edit view | Yes | No (fixed position) |

For Cart view, use the screen layout designer to set position, height, and width. For other views, the control appears at a fixed position at runtime.

## Pattern for SimpleProductDetailsView
1. Create HTML file with a \`<script type="text/html">\` KnockoutJS template containing \`msPosDataList\` or other bindings.
2. Create TypeScript file extending SimpleProductDetailsCustomControlBase.
3. In constructor: initialize observables and data list columns.
4. In \`onReady(element)\`: call ko.applyBindingsToNode() to bind the template.
5. In \`init(state)\`: load data (e.g., inventory availability via InventoryLookupOperationRequest).

## HTML template using msPosDataList
\`\`\`html
<script id="Microsot_Pos_Extensibility_Samples_ProductAvailabilityPanel" type="text/html">
    <h2 data-bind="text: title"></h2>
    <div data-bind="msPosDataList: dataList"></div>
</script>
\`\`\`

## manifest.json structure
\`\`\`json
{
    "name": "Pos_Extensibility_Samples",
    "publisher": "Microsoft",
    "components": {
        "extend": {
            "views": {
                "SimpleProductDetailsView": {
                    "controlsConfig": {
                        "customControls": [
                            {
                                "controlName": "productAvailabilityPanel",
                                "htmlPath": "ViewExtensions/SimpleProductDetails/ProductAvailabilityPanel.html",
                                "modulePath": "ViewExtensions/SimpleProductDetails/ProductAvailabilityPanel"
                            }
                        ]
                    }
                }
            }
        }
    }
}
\`\`\`

## Accessing static resources (audio, images, etc.)
\`\`\`typescript
export default class BeepSoundPostProductSaleTrigger extends PostProductSaleTrigger {
    public execute(options: IPostProductSaleTriggerOptions): Promise<void> {
        let resourcePath = "/Resources/audio/beep.wav";
        let filePath = this.context.extensionPackageInfo.baseUrl + resourcePath;
        let beeper = new Audio(filePath);
        beeper.play();
        return Promise.resolve();
    }
}
\`\`\`

Use \`context.extensionPackageInfo.baseUrl\` to build full paths to bundled static resources.

## Key manifest fields
- **Extend** → inform POS of extension for existing feature
- **Views** → specify which existing view is extended
- **controlsConfig.customControls** → array of {controlName, htmlPath, modulePath}
- controlName must match name used in HQ designer (for Cart view)

Sample code: \`RetailSDK\\Code\\POS\\Extensions\\SampleExtensions\\ViewExtensions\\SimpleProductDetails\\\``,
    codeBlocks: [
      `// Accessing static resources
let filePath = this.context.extensionPackageInfo.baseUrl + "/Resources/audio/beep.wav";
new Audio(filePath).play();`,
      `// manifest.json custom control registration
"controlsConfig": {
    "customControls": [{
        "controlName": "productAvailabilityPanel",
        "htmlPath": "ViewExtensions/SimpleProductDetails/ProductAvailabilityPanel.html",
        "modulePath": "ViewExtensions/SimpleProductDetails/ProductAvailabilityPanel"
    }]
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "pos-payment-request-handler",
    title: "POS payment extension — override payment request handlers",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-payment-extension",
    category: "pos-extensions",
    tags: ["pos", "payment", "PaymentTerminalAuthorizePaymentRequestHandler", "PaymentTerminalCapturePaymentRequestHandler", "defaultExecuteAsync", "extensionTransactionProperties", "PeripheralsRequestHandlers"],
    summary: "Override POS payment request handlers to customize payment flows: add extension properties, show custom messages, capture cashier input, show processing dialogs. Extend the target handler from PosApi/Extend/RequestHandlers/PeripheralsRequestHandlers, implement executeAsync(), enrich the request, then call defaultExecuteAsync(). POS manages the standard workflow (adding/voiding payment lines).",
    content: `# POS payment extension — override payment request handlers

Override POS payment request handlers to intercept the payment flow. Use cases: pass extra extension properties to connectors, show custom dialogs, require cashier input, show processing messages.

## Overridable payment request handlers
- PaymentTerminalAuthorizePaymentRequestHandler
- PaymentTerminalCapturePaymentRequestHandler
- PaymentTerminalExecuteTaskRequestHandler
- PaymentTerminalRefundPaymentRequestHandler
- PaymentTerminalVoidPaymentRequestHandler
- PaymentTerminalCancelOperationRequest
- PaymentTerminalEnquireGiftCardBalancePeripheralRequest
- PaymentTerminalAddBalanceToGiftCardPeripheralRequest
- PaymentTerminalActivateGiftCardPeripheralRequest
- PaymentTerminalBeginTransactionRequest

POS manages the standard workflow after your handler returns — you do NOT need to add/void payment lines yourself.

## Example: Override Authorize to pass cart extension properties
\`\`\`typescript
import { PaymentTerminalAuthorizePaymentRequestHandler } from "PosApi/Extend/RequestHandlers/PeripheralsRequestHandlers";
import { PaymentTerminalAuthorizePaymentRequest, PaymentTerminalAuthorizePaymentResponse } from "PosApi/Consume/Peripherals";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";

export default class PaymentTerminalAuthorizePaymentRequestHandlerExt extends PaymentTerminalAuthorizePaymentRequestHandler {
    public executeAsync(request: PaymentTerminalAuthorizePaymentRequest<PaymentTerminalAuthorizePaymentResponse>):
        Promise<ClientEntities.ICancelableDataResult<PaymentTerminalAuthorizePaymentResponse>> {

        let cart: ProxyEntities.Cart = null;
        return this.context.runtime.executeAsync(new GetCurrentCartClientRequest())
            .then((result) => {
                if (!result.canceled && !ObjectExtensions.isNullOrUndefined(result.data)) {
                    cart = result.data.result;
                }
            })
            .then(() => {
                let newRequest = new PaymentTerminalAuthorizePaymentRequest<PaymentTerminalAuthorizePaymentResponse>(
                    request.paymentConnectorId,
                    request.amount,
                    request.tenderInfo,
                    request.voiceAuthorization,
                    request.isManualEntry,
                    PaymentHandlerHelper.FillExtensionProperties(cart, request.extensionTransactionProperties));
                return this.defaultExecuteAsync(newRequest);
            });
    }
}
\`\`\`

## PaymentHandlerHelper — build extension properties from cart
\`\`\`typescript
export class PaymentHandlerHelper {
    public static FillExtensionProperties(
        cart: ProxyEntities.Cart,
        extensionProperties: ClientEntities.IExtensionTransaction): ClientEntities.IExtensionTransaction {

        if (!ObjectExtensions.isNullOrUndefined(cart)) {
            let extraProperties: ClientEntities.IExtensionTransaction = {
                ExtensionProperties: [
                    { Key: "CartId", Value: { StringValue: cart.Id } },
                    { Key: "ChannelId", Value: { StringValue: cart.ChannelId?.toString() ?? "" } },
                    { Key: "TerminalId", Value: { StringValue: cart.TerminalId } },
                    { Key: "StaffId", Value: { StringValue: cart.StaffId } },
                    { Key: "CustomerId", Value: { StringValue: cart.CustomerId ?? "" } }
                ]
            };
            if (ObjectExtensions.isNullOrUndefined(extensionProperties)) {
                return extraProperties;
            }
            extraProperties.ExtensionProperties.forEach(p => extensionProperties.ExtensionProperties.push(p));
        }
        return extensionProperties;
    }
}
\`\`\`

## manifest.json — register multiple overrides
\`\`\`json
{
    "components": {
        "extend": {
            "requestHandlers": [
                { "modulePath": "Peripherals/Handlers/PaymentTerminalAuthorizePaymentRequestHandlerExt" },
                { "modulePath": "Peripherals/Handlers/PaymentTerminalCapturePaymentRequestHandlerExt" },
                { "modulePath": "Peripherals/Handlers/PaymentTerminalExecuteTaskRequestHandlerExt" }
            ]
        }
    }
}
\`\`\`

## Example: Override Capture handler
Same pattern — extend PaymentTerminalCapturePaymentRequestHandler, get cart, enrich extensionTransactionProperties, call defaultExecuteAsync(newRequest).

Full samples: \`RetailSDK\\Code\\POS\\Extensions\\PaymentSample\``,
    codeBlocks: [
      `export default class PaymentTerminalAuthorizePaymentRequestHandlerExt extends PaymentTerminalAuthorizePaymentRequestHandler {
    public executeAsync(request: PaymentTerminalAuthorizePaymentRequest<PaymentTerminalAuthorizePaymentResponse>):
        Promise<ClientEntities.ICancelableDataResult<PaymentTerminalAuthorizePaymentResponse>> {
        return this.context.runtime.executeAsync(new GetCurrentCartClientRequest())
            .then((result) => { cart = result.data.result; })
            .then(() => {
                let newRequest = new PaymentTerminalAuthorizePaymentRequest(
                    request.paymentConnectorId, request.amount, request.tenderInfo,
                    request.voiceAuthorization, request.isManualEntry,
                    PaymentHandlerHelper.FillExtensionProperties(cart, request.extensionTransactionProperties));
                return this.defaultExecuteAsync(newRequest);
            });
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── POS Packaging and Deployment ─────────────────────────────────────────────
// Source: store commerce - packaging and deployment batch

const POS_PACKAGING_ENTRIES: DocEntry[] = [
  {
    id: "mpos-extension-packaging",
    title: "Create a Modern POS (MPOS) extension package",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/mpos-extension-packaging",
    category: "pos-extensions",
    tags: ["mpos", "packaging", "installer", "ModernPos.Installer", "appx", "msix", "Microsoft.Dynamics.Commerce.Sdk.Installers.ModernPos"],
    summary: "Create an MPOS extension installer using the Microsoft.Dynamics.Commerce.Sdk.Installers.ModernPos NuGet package. Project targets net461, has no Program.cs, references the ModernPos extension project with ReferenceOutputAssembly=false. Run .exe install / uninstall from PowerShell. Requires sealed MPOS to be installed first.",
    content: `# Create a Modern POS (MPOS) extension package

> Important: Retail SDK support ended October 2023. Use the Commerce SDK (sdk-github).

## Steps to create the MPOS extension installer

1. Create a new .NET Core console app project named **ModernPos.Installer** in Visual Studio 2017.
2. Edit the .proj file — change TargetFramework to **net461**:
\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net461</TargetFramework>
    </PropertyGroup>
</Project>
\`\`\`
3. Delete the generated **Program.cs** file.
4. Add the **Microsoft.Dynamics.Commerce.Sdk.Installers.ModernPos** NuGet package (match your go-live version).
5. Add a project reference to the Modern POS extension project. After adding, edit the .csproj and add:
\`\`\`xml
<ReferenceOutputAssembly>false</ReferenceOutputAssembly>
\`\`\`
6. (For offline channel DB extension only) Add a reference from the Modern POS project to the channel database project.
7. Compile and build. Output contains the MPOS extension installer (.appx is included).

## Install / uninstall
Open Windows PowerShell as administrator:
\`\`\`powershell
# Install
PS C:\\ModernPos.Installer\\bin\\Debug\\net461> .\\ModernPos.Installer.exe install

# Uninstall
PS C:\\ModernPos.Installer\\bin\\Debug\\net461> .\\ModernPos.Installer.exe uninstall
\`\`\`

> Before installing the extension, install the sealed Modern POS first.
> After install, close MPOS and reopen using the "Install/Update Modern POS" desktop icon to load the extension.

The installer copies the extension .appx file and other files to the correct MPOS location.`,
    codeBlocks: [
      `<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net461</TargetFramework>
    </PropertyGroup>
</Project>`,
      `.\\ModernPos.Installer.exe install`,
      `.\\ModernPos.Installer.exe uninstall`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "mpos-extension-signing",
    title: "Code signing a Modern POS (MSIX) extension package",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/mpos-extension-signing",
    category: "pos-extensions",
    tags: ["mpos", "code-signing", "certificate", "pfx", "PackageCertificateKeyFile", "msix", "appx", "UWP"],
    summary: "All MPOS extension .appx (MSIX/UWP) packages must be signed with a code signing certificate. Set PackageCertificateKeyFile in the .proj file pointing to the .pfx. For production use a trusted CA certificate. For development use a self-signed certificate (must be added to trusted root on the device). Azure Sign Tool / Trusted Signing recommended for CI/CD pipelines.",
    content: `# Code signing a Modern POS (MSIX) extension package

Applies to: Commerce SDK 10.0.18 and later.

> Note: MPOS is deprecated (October 2023). Migrate to Store Commerce app. For Store Commerce, code signing is recommended but not strictly required.

## Why signing is required
All .appx files for MPOS extensions **must** be signed with a code signing certificate. MSIX/UWP packages will not install without a valid signature trusted by the machine.

## Add certificate reference to the .proj file
Edit the Modern POS JavaScript project file (.proj) and add:
\`\`\`xml
<PackageCertificateKeyFile Condition="Exists('.\\MPOS_Extension_Certificate.pfx')">MPOS_Extension_Certificate.pfx</PackageCertificateKeyFile>
\`\`\`

## Certificate types
- **Production**: Use a certificate from a trusted certificate authority (CA). See [Create a certificate for package signing](/windows/msix/package/create-certificate-package-signing).
- **Development (self-signed)**: Generate a self-signed test certificate. You must manually add it to the machine's Trusted Root certificate store before the extension package can be installed.

## GitHub sample test certificate
The Commerce SDK GitHub sample generates a self-signed test certificate during build:
- Default location: **bld\\x86\\Debug\\MPOS_Extension_Certificate.pfx**
- You **must** manually trust this certificate before installing the extension package on the development machine.
- Only works with a domain account. For non-domain accounts, provide your own certificate.

## CI/CD pipeline signing
- Visual Studio 2017 does NOT support password-protected certificates in the project file.
- The Azure Sign Tool in the build pipeline supports password-protected certificates.
- Use the [Trusted Signing Visual Studio Marketplace task](https://marketplace.visualstudio.com/items?itemName=VisualStudioClient.TrustedSigning) for Azure Pipelines.

## References
- [Configure the Build solution build task](/windows/uwp/packaging/auto-build-package-uwp-apps)
- [Create a certificate for package signing](/windows/msix/package/create-certificate-package-signing)`,
    codeBlocks: [
      `<PackageCertificateKeyFile Condition="Exists('.\\MPOS_Extension_Certificate.pfx')">MPOS_Extension_Certificate.pfx</PackageCertificateKeyFile>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "cpos-extension-package",
    title: "Create a Cloud POS (CPOS) extension package",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension/cpos-extension-package",
    category: "pos-extensions",
    tags: ["cpos", "cloud-pos", "packaging", "ScaleUnit", "Microsoft.Dynamics.Commerce.Sdk.ScaleUnit", "Microsoft.Dynamics.Commerce.Sdk.Installers.ScaleUnit", "CSU", "Extension.Config"],
    summary: "Cloud POS extension packaging has two paths: (1) CSU (cloud-hosted): use Microsoft.Dynamics.Commerce.Sdk.ScaleUnit NuGet in a .NET Standard 2.0 class library — outputs a zip deployment package. (2) CSU self-hosted: use Microsoft.Dynamics.Commerce.Sdk.Installers.ScaleUnit NuGet in a net461 console app — outputs a .exe installer. Both require adding the POS.Extension project as a reference with ReferenceOutputAssembly=false.",
    content: `# Create a Cloud POS (CPOS) extension package

CPOS extension packaging depends on the deployment topology: CSU (cloud) or CSU – Self-hosted.

## Option 1: CSU cloud-hosted CPOS package
Use **Microsoft.Dynamics.Commerce.Sdk.ScaleUnit** NuGet package.

1. Create a new C# class library project with **Target framework: .NET Standard 2.0**. Name it **ScaleUnit**.
2. Delete the generated **Class1.cs** file.
3. Add the **Microsoft.Dynamics.Commerce.Sdk.ScaleUnit** NuGet package.
   - NuGet source: \`https://pkgs.dev.azure.com/commerce-partner/Registry/_packaging/dynamics365-commerce/nuget/v3/index.json\`
   - Add the source to nuget.config under your extension project.
   - Select version matching your SDK/application version.
4. Add the **POS.Extension** project as a project reference to the ScaleUnit project.
5. Compile and build. Output contains the CSU deployment package as a **zip file**.

> If you have CRT, Retail Server, or database extensions — add all extension projects to ScaleUnit as references. This generates a combined deployment package.

Deploy: follow steps in [Deploy the package to CSU](../retail-sdk/retail-sdk-packaging#deploy-the-package-to-csu).

## Option 2: CSU self-hosted CPOS package
Use **Microsoft.Dynamics.Commerce.Sdk.Installers.ScaleUnit** NuGet package.

1. Create a new .NET Core console app named **ScaleUnit.Installer** in Visual Studio 2017.
2. Edit the .proj file — change TargetFramework to **net461**:
\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net461</TargetFramework>
    </PropertyGroup>
</Project>
\`\`\`
3. Delete **Program.cs**.
4. Add the **Microsoft.Dynamics.Commerce.Sdk.Installers.ScaleUnit** NuGet package (match go-live version).
5. Add project reference to the **POS.Extension** project.
6. Add **Extension.Config** file (Application Configuration File):
\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<commerceRuntimeExtensions>
    <composition>
        <add source="assembly" value="CommerceRuntime" />
    </composition>
</commerceRuntimeExtensions>
\`\`\`
   (Leave composition empty if no CRT extensions.)
7. Compile and build. Output is the **ScaleUnit.Installer.exe**.

## Install / uninstall (self-hosted)
\`\`\`powershell
# Install
PS C:\\ModernPos.Installer\\bin\\Debug\\net461> .\\ScaleUnit.Installer.exe install

# Uninstall
PS C:\\ModernPos.Installer\\bin\\Debug\\net461> .\\ScaleUnit.Installer.exe uninstall
\`\`\`

> Install the sealed ScaleUnit package before the extension installer.
> You can create multiple ScaleUnit installers and manage them separately — no need to combine all extensions in one package.`,
    codeBlocks: [
      `<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net461</TargetFramework>
    </PropertyGroup>
</Project>`,
      `<?xml version="1.0" encoding="utf-8"?>
<commerceRuntimeExtensions>
    <composition>
        <add source="assembly" value="CommerceRuntime" />
    </composition>
</commerceRuntimeExtensions>`,
      `.\\ScaleUnit.Installer.exe install`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "store-commerce-extension-installer",
    title: "Create a Store Commerce extension installer package",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/store-comm-extension-installer",
    category: "pos-extensions",
    tags: ["store-commerce", "installer", "packaging", "Microsoft.Dynamics.Commerce.Sdk.Installers.StoreCommerce", "net472", "CommerceRuntimeExtensionSettings", "StoreCommerce.ExtInstaller"],
    summary: "Create a Store Commerce extension installer using the Microsoft.Dynamics.Commerce.Sdk.Installers.StoreCommerce NuGet package. Project is a net472 console app (no Program.cs). Add ProjectReference entries with ReferenceOutputAssembly=false for POS, CRT, and DB script projects. Use CommerceRuntimeExtensionSettings items to inject CRT config values. Run .exe install/uninstall from PowerShell. F5 auto-deploys during development.",
    content: `# Create a Store Commerce extension installer package

Sample code: [Store Commerce Extension samples GitHub repo](https://github.com/microsoft/Dynamics365Commerce.InStore)

## Steps

1. Create a new .NET console application project named **StoreCommerce.ExtInstaller** in Visual Studio 2022. Framework: **.NET 7.0**.
2. Edit the .proj file — change TargetFramework to **net472**:
\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net472</TargetFramework>
    </PropertyGroup>
</Project>
\`\`\`
3. Delete the generated **Program.cs** file.
4. Add the **Microsoft.Dynamics.Commerce.Sdk.Installers.StoreCommerce** NuGet package (match your go-live version).
5. Add project references to your Store Commerce extension project, CRT project, and database script project. Set **ReferenceOutputAssembly=false** for each.
6. Compile and build. Pressing **F5** builds and auto-deploys the installer.

## Install / uninstall
\`\`\`powershell
# Install
PS C:\\StoreCommerce.ExtInstaller\\bin\\Debug\\net472> .\\ StoreCommerce.ExtInstaller.exe install

# Uninstall
PS C:\\StoreCommerce.ExtInstaller\\bin\\Debug\\net472> .\\ StoreCommerce.ExtInstaller.exe uninstall
\`\`\`
> Install the Store Commerce app before running the extension installer.
> After install, close Store Commerce and reopen via the desktop shortcut.

## Sample .csproj
\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">
    <Import Project="..\\CustomizationPackage.props " />
    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net472</TargetFramework>
    </PropertyGroup>
    <ItemGroup>
        <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Installers.StoreCommerce"
                          Version="\$(CommerceSdkPackagesVersion)" />
    </ItemGroup>
    <ItemGroup>
        <ProjectReference Include="..\\CommerceRuntime\\Contoso.GasStationSample.CommerceRuntime.csproj">
            <ReferenceOutputAssembly>false</ReferenceOutputAssembly>
        </ProjectReference>
        <ProjectReference Include="..\\Pos\\Contoso.GasStationSample.Pos.csproj">
            <ReferenceOutputAssembly>false</ReferenceOutputAssembly>
        </ProjectReference>
    </ItemGroup>
    <ItemGroup>
        <!-- Settings added to CommerceRuntime config file; available at runtime in CRT extensions -->
        <CommerceRuntimeExtensionSettings Include="ext.Contoso.GasolineItemId">
            <Value>gasoline</Value>
        </CommerceRuntimeExtensionSettings>
    </ItemGroup>
</Project>
\`\`\`

## Code signing note
Code signing is not strictly required for the Store Commerce extension installer (unlike MPOS). However, Microsoft recommends signing to verify authenticity. Use the [Trusted Signing Visual Studio Marketplace task](https://marketplace.visualstudio.com/items?itemName=VisualStudioClient.TrustedSigning) for Azure Pipelines.`,
    codeBlocks: [
      `<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputType>Exe</OutputType>
        <TargetFramework>net472</TargetFramework>
    </PropertyGroup>
    <ItemGroup>
        <PackageReference Include="Microsoft.Dynamics.Commerce.Sdk.Installers.StoreCommerce"
                          Version="$(CommerceSdkPackagesVersion)" />
    </ItemGroup>
    <ItemGroup>
        <ProjectReference Include="..\\CommerceRuntime\\Contoso.csproj">
            <ReferenceOutputAssembly>false</ReferenceOutputAssembly>
        </ProjectReference>
        <ProjectReference Include="..\\Pos\\Contoso.Pos.csproj">
            <ReferenceOutputAssembly>false</ReferenceOutputAssembly>
        </ProjectReference>
    </ItemGroup>
    <ItemGroup>
        <CommerceRuntimeExtensionSettings Include="ext.Contoso.GasolineItemId">
            <Value>gasoline</Value>
        </CommerceRuntimeExtensionSettings>
    </ItemGroup>
</Project>`,
      `StoreCommerce.ExtInstaller.exe install`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "store-commerce-android-ios-ext",
    title: "Store Commerce Hardware station extensibility for Android and iOS",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/store-comm-android-ios-ext",
    category: "pos-extensions",
    tags: ["store-commerce", "android", "ios", "mobile", "hardware-station", "MAUI", "net8.0-android", "net8.0-ios", "APK", "IPA", "fiscal-printer"],
    summary: "Store Commerce mobile apps for Android (10.0.41+) and iOS (10.0.44+) support Hardware station extensibility. Build using the Store Commerce mobile SDK (downloaded from LCS Shared Asset Library — Store Commerce for Android package which includes both Android and iOS). Uses .NET MAUI (Visual Studio 2022 MAUI workload). Outputs custom APK (Android) or IPA (iOS) distributed via app stores or internal channels.",
    content: `# Store Commerce Hardware station extensibility for Android and iOS

## Version support
- **Android**: Hardware station extensibility available from Commerce **10.0.41**
- **iOS**: Hardware station extensibility available from Commerce **10.0.44**

## Capabilities enabled
- Build extensions for custom Hardware station requirements
- Support fiscal integration with Android mobile devices and fiscal printers
- Create custom APK (Android Application Package) or IPA (iOS App Store Package)
- Distribute via app stores or internal channels

## Prerequisites
- Install the **.NET Multi-platform App UI (MAUI)** workload in Visual Studio 2022

## Steps to build Store Commerce for Android/iOS with extensions

1. Navigate to [Microsoft Lifecycle Services Shared Asset Library](https://lcs.dynamics.com/V2/SharedAssetLibrary).
2. Under **Retail Self-service package**, download the latest **Store Commerce for Android package** (10.0.41+ for Android, 10.0.44+ for iOS).
   > Note: The **Store Commerce for Android package** contains **both Android and iOS dependencies**. There is no separate iOS package.
3. Unzip the package and copy the \`packages\` folder to your repository root.
4. Update **nuget.config** — add the \`packages\` folder as a package source:
\`\`\`xml
<packageSources>
    <add key="Dynamics365Commerce-Mobile-Dependencies" value="./packages" />
</packageSources>
\`\`\`
5. Set the **ApplicationTitle** value in the mobile app project to customize the app name shown in the Android launcher or iOS home screen.
6. Set the **ApplicationId** value to customize the package name.
7. Build the mobile samples solution.

## Platform-specific configuration

### Android
- Start debugging directly from Visual Studio 2022 if an Android emulator is configured.
- To exclude Android: comment out \`<TargetFramework>net8.0-android</TargetFramework>\` in the mobile app project.

### iOS
- Developing on Windows requires pairing a Mac ([Pair to Mac for iOS development](/dotnet/maui/ios/pair-to-mac)).
- To exclude iOS: comment out \`<TargetFramework>net8.0-ios</TargetFramework>\` in the mobile app project.`,
    codeBlocks: [
      `<!-- nuget.config -->
<packageSources>
    <add key="Dynamics365Commerce-Mobile-Dependencies" value="./packages" />
</packageSources>`,
      `<!-- mobile app project — target frameworks -->
<TargetFramework>net8.0-android</TargetFramework>
<TargetFramework>net8.0-ios</TargetFramework>`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "customer-cdx-package-extension",
    title: "Extend the customer CDX package to add custom data",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/extend-customer-cdx-package",
    category: "extensibility",
    tags: ["CDX", "customer", "data-sync", "RetailTransactionServiceCustomerExtensions", "addAdditionalCustomerDataToPackage", "RetailCdxDataPackageSerializationHelper", "X++", "headquarters"],
    summary: "Extend the Commerce Data Exchange (CDX) customer package to include custom data (loyalty, affiliations, extension tables) synced to the channel database. X++ extension: add [ExtensionOf(classStr(RetailTransactionServiceCustomerExtensions))] and override addAdditionalCustomerDataToPackage(RetailCdxDataPackageSerializationHelper serializer, CustTable customerRecord). Use serializer.writeRecord() for each table record to include in the package.",
    content: `# Extend the customer CDX package to add custom data

When POS calls the Commerce Customer Search API and the customer is not found locally, HQ performs a real-time call and generates a **customer CDX package** to synchronize data to the channel database.

To include custom data (Loyalty, Affiliation, extension tables) in this CDX package, use **X++** to extend the **RetailTransactionServiceCustomerExtensions** class in Commerce headquarters.

## How it works
1. POS searches for customer → not found in channel DB → real-time call to HQ
2. HQ finds customer → generates CDX package via RetailTransactionServiceCustomerExtensions
3. Extension's **addAdditionalCustomerDataToPackage** is called → adds custom table data via serializer.writeRecord()
4. Package is synchronized to channel database

## Prerequisites
- Extend CDX to synchronize the custom table/fields (see [Enable custom CDX sync via extension](cdx-extensibility))
- If using extension tables: add a CRT extension to read the extension table data
- Maintain data integrity between CustTable and additional data
- Extension/synchronization tables must have write permissions for the CDX framework

## X++ extension steps

1. Create a model in Visual Studio (Dynamics 365 > Model Management > Create model):
   - Model name: e.g., **Contoso** (or your ISV prefix)
   - Select existing package: **Application Suite**
2. Create a class named e.g. **RetailTransactionServiceCustomerExtensions_Sample_Extension**
3. Add the **[ExtensionOf]** attribute targeting **RetailTransactionServiceCustomerExtensions**
4. Override **addAdditionalCustomerDataToPackage**

## Example: Include loyalty cards and extension table data
\`\`\`x++
[ExtensionOf(classStr(RetailTransactionServiceCustomerExtensions))]
public final class RetailTransactionServiceCustomerExtensions_Sample_Extension
{
    public static void addAdditionalCustomerDataToPackage(
        RetailCdxDataPackageSerializationHelper serializer,
        CustTable customerRecord)
    {
        RetailLoyaltyCard loyaltyCard;
        RetailLoyaltyCardTier loyaltyCardTier;
        ContosoRetailCustPreferredContactHours contactHoursTable;

        while select loyaltyCard
            where loyaltyCard.Party == customerRecord.Party
        {
            serializer.writeRecord(loyaltyCard);

            while select loyaltyCardTier
                where loyaltyCardTier.LoyaltyCard == loyaltyCard.RecId
            {
                serializer.writeRecord(loyaltyCardTier);
            }
        }

        while select contactHoursTable
        {
            serializer.writeRecord(contactHoursTable);
        }
    }
}
\`\`\`

## Key APIs
- **RetailCdxDataPackageSerializationHelper.writeRecord(record)** — adds a table record to the CDX package
- **RetailTransactionServiceCustomerExtensions** — the base class to extend
- **addAdditionalCustomerDataToPackage** — the method to override`,
    codeBlocks: [
      `[ExtensionOf(classStr(RetailTransactionServiceCustomerExtensions))]
public final class RetailTransactionServiceCustomerExtensions_Sample_Extension
{
    public static void addAdditionalCustomerDataToPackage(
        RetailCdxDataPackageSerializationHelper serializer,
        CustTable customerRecord)
    {
        RetailLoyaltyCard loyaltyCard;
        while select loyaltyCard where loyaltyCard.Party == customerRecord.Party
        {
            serializer.writeRecord(loyaltyCard);
        }
    }
}`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
  {
    id: "payment-connector-package",
    title: "Create Commerce payment packaging for finance and operations deployment",
    sourceUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/payment-connector-package",
    category: "payments",
    tags: ["payment-connector", "packaging", "AOS", "RetailPaymentConnectors", "deployable-package", "LCS", "all-in-one", "finance-operations"],
    summary: "From Commerce 10.0.10+, AOS payment connector packages are created via Visual Studio Dynamics 365 packaging (not the Retail SDK). Model name must start with 'RetailPaymentConnectors' prefix. Add payment connector DLLs as references (all must be portable). Create the deployable package via Dynamics 365 > Deploy > Create Deployment Package, upload to LCS Asset Library. A separate Commerce channel package is still needed from the Commerce SDK.",
    content: `# Create Commerce payment packaging for finance and operations deployment

## Background
- **Before 10.0.10**: Use Commerce (Retail) SDK to create a single payment package for both AOS and Commerce channel.
- **10.0.10 and later**: Two separate packages are required:
  1. **AOS package** — created with the Dynamics 365 packaging model in Visual Studio (NOT the Retail SDK)
  2. **Commerce channel package** — still created with the Commerce SDK (see [Create and deploy connector](deploy-payment-connector))

The previous approach of using the Commerce SDK for AOS payment packaging is **deprecated** as of 10.0.10.

## Create an AOS payment package (10.0.10+)

1. In Visual Studio, go to **Dynamics 365 > Model Management > Create model**.
2. Enter model details:
   - **Model name**: Must start with **RetailPaymentConnectors** prefix (e.g., **RetailPaymentConnectorsCustomConnector**)
   - Only models with this prefix appear in Commerce payment connector options
3. Select **Create new package**, then select required referenced packages.
4. In Solution Explorer, right-click **References** in the project and select **Add Reference**.
5. Add all payment connector assemblies and their dependencies.
   > **Important**: All payment connector DLLs must be **portable**. Having both portable and non-portable DLLs causes loading failures.
6. (Optional) Add HTML and CSS resource files if needed for the payment acceptance UI:
   - HTML files deploy to: \`AosService\\WebRoot\\Resources\\Html\`
   - CSS files deploy to: \`AosService\\WebRoot\\Resources\\Styles\`
   - Access URLs: \`https://AOSUrl/resources/html/Myhtml.html\` and \`https://AOSUrl/resources/styles/Mycss.css\`
   - Only HTML and CSS formats are copied; other formats must be hosted externally.
   - Update GetPaymentAcceptPoint to return the appropriate URL.
7. Build the solution.
8. Create the deployable package: **Dynamics 365 > Deploy > Create Deployment Package**.
9. Select the model, specify output location, select **Create**.
10. Sign in to **LCS (Lifecycle Services)**, go to your LCS project, select **Asset Library**, upload the deployable package.

## Deploy / remove
- Deploy: [Apply updates to cloud environments](../../fin-ops-core/dev-itpro/deployment/apply-deployable-package-system)
- Remove: [Uninstall a package](../../fin-ops-core/dev-itpro/deployment/uninstall-deployable-package)

## Combining packages
If you have other extension packages, combine them into one **all-in-one deployable package** — otherwise this package overrides others. See [All-in-one deployable packages](../../fin-ops-core/dev-itpro/dev-tools/aio-deployable-packages).`,
    codeBlocks: [
      `// Model name must start with RetailPaymentConnectors prefix
// Example: RetailPaymentConnectorsCustomConnector`,
      `// HTML/CSS resource URLs
https://AOSUrl/resources/html/Myhtml.html
https://AOSUrl/resources/styles/Mycss.css`,
    ],
    retrievedAt: RETRIEVED_AT,
  },
];

// ─── Catalog Assembly ─────────────────────────────────────────────────────────

export const DOCS_CATALOG: DocEntry[] = [
  ...SDK_GITHUB_ENTRIES,
  ...MIGRATE_SDK_ENTRIES,
  ...CSU_HEALTH_CHECK_ENTRIES,
  ...OBSOLETE_APIS_ENTRIES,
  ...LOCAL_DEV_ENV_ENTRIES,
  ...INSTALL_CSU_DEV_ENTRIES,
  ...BUILD_PIPELINE_ENTRIES,
  ...DEPLOY_PAYMENT_CONNECTOR_ENTRIES,
  ...PAYMENT_DATA_FIELDS_ENTRIES,
  ...TIPPING_ENTRIES,
  ...INCREMENTAL_CAPTURE_ENTRIES,
  ...LOCALIZATION_ENTRIES,
  ...CSU_CORE_ENTRIES,
  ...HEADLESS_INTEGRATION_ENTRIES,
  ...API_REFERENCE_ENTRIES,
  ...EXTENSIBILITY_ENTRIES,
  ...EXTEND_EXISTING_ENTRIES,
  ...SAMPLES_ENTRIES,
  ...DEPLOYMENT_ENTRIES,
  ...LOCAL_STORE_COMMERCE_DEV_ENTRIES,
  ...POS_API_REFERENCE_ENTRIES,
  ...POS_EXTENSION_ENTRIES,
  ...POS_CREATE_ENTRIES,
  ...POS_EXTEND_ENTRIES,
  ...POS_PACKAGING_ENTRIES,
];

// ─── Search ───────────────────────────────────────────────────────────────────

export interface DocSearchResult extends DocEntry {
  score: number;
  matchedTerms: string[];
}

/**
 * Simple keyword search across the embedded docs catalog.
 * Scores by: tag match (3pts), title match (2pts), content match (1pt).
 */
export function searchDocs(query: string, maxResults = 5): DocSearchResult[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (terms.length === 0) return DOCS_CATALOG.slice(0, maxResults).map((e) => ({ ...e, score: 0, matchedTerms: [] }));

  const results: DocSearchResult[] = [];

  for (const entry of DOCS_CATALOG) {
    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    const tagsJoined = entry.tags.join(" ").toLowerCase();
    const summaryLower = entry.summary.toLowerCase();

    let score = 0;
    const matchedTerms: string[] = [];

    for (const term of terms) {
      let termScore = 0;
      if (tagsJoined.includes(term)) termScore += 3;
      if (titleLower.includes(term)) termScore += 2;
      if (summaryLower.includes(term)) termScore += 2;
      if (contentLower.includes(term)) termScore += 1;
      if (termScore > 0) {
        score += termScore;
        matchedTerms.push(term);
      }
    }

    if (score > 0) {
      results.push({ ...entry, score, matchedTerms });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

/** Returns the catalog index (without full content) for resource listing. */
export function getCatalogIndex(): Array<{
  id: string;
  title: string;
  category: DocCategory;
  tags: string[];
  summary: string;
  sourceUrl: string;
  retrievedAt: string;
}> {
  return DOCS_CATALOG.map(({ id, title, category, tags, summary, sourceUrl, retrievedAt }) => ({
    id,
    title,
    category,
    tags,
    summary,
    sourceUrl,
    retrievedAt,
  }));
}
