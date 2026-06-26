/**
 * D365FOBridge — guidance for integrating D365 Commerce extensions with
 * Dynamics 365 Finance & Operations (HQ) via CDX and channel database.
 *
 * This module provides STATIC reference knowledge (no network calls needed).
 * All information is grounded in official Microsoft documentation.
 *
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/channel-db-extensions
 * CDX: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cdx-extensibility
 * AX:  https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility-data
 */

export type CDXDirection = "HQToChannel" | "ChannelToHQ" | "Both";
export type HQExtensionArea = "Table" | "View" | "CDXJob" | "SyncSubjob" | "RetailChannelTable" | "Form";

export interface CDXGuide {
  title: string;
  direction: CDXDirection;
  overview: string;
  steps: string[];
  codeSnippets: { label: string; code: string; language: "csharp" | "xml" | "sql" }[];
  risks: string[];
  docsUrl: string;
}

export interface HQExtensionGuide {
  area: HQExtensionArea;
  title: string;
  overview: string;
  steps: string[];
  docsUrl: string;
}

export interface ChannelDbExtensionGuide {
  title: string;
  overview: string;
  steps: string[];
  codeSnippets: { label: string; code: string; language: "sql" | "xml" | "csharp" }[];
  docsUrl: string;
}

// ─── CDX Guides ───────────────────────────────────────────────────────────

const CDX_GUIDES: Record<string, CDXGuide> = {
  "hq-to-channel": {
    title: "Sync data from HQ to Channel Database (CDX Download)",
    direction: "HQToChannel",
    overview:
      "CDX (Commerce Data Exchange) download jobs sync data from D365 Finance & Operations (HQ) " +
      "to the channel database. Extensions that add new HQ tables must configure a CDX subjob " +
      "to include the new data in the sync.",
    steps: [
      "1. Create the HQ extension table in X++ extending an existing RetailTable (e.g. RetailChannelTable).",
      "2. Add the table to a CDX Resource group: Retail and Commerce > IT > Distribution schedule > 1xxx job.",
      "3. Define a CDX subjob: Retail > IT > Distribution schedule > Subjobs tab → Add new subjob pointing to your table.",
      "4. Configure the channel database side: add corresponding columns in the channel DB table via SQL scripts packaged with your extension.",
      "5. Map the subjob fields: source field → destination field in the channel DB table.",
      "6. Run the distribution schedule job to verify data flows to the channel.",
    ],
    codeSnippets: [
      {
        label: "Channel DB SQL: Add extension column",
        language: "sql",
        code: `-- Channel DB extension script
-- Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/channel-db-extensions
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('ax.RETAILCHANNELTABLE')
    AND name = 'CONTOSOFIELD'
)
BEGIN
    ALTER TABLE [ax].[RETAILCHANNELTABLE]
    ADD [CONTOSOFIELD] NVARCHAR(50) NOT NULL DEFAULT '';
END`,
      },
      {
        label: "HQ X++: Extend RetailChannelTable",
        language: "csharp",
        code: `// X++ table extension — in D365 F&O AOT
// File: ContosoRetailChannelTable.xpp
[ExtensionOf(tableStr(RetailChannelTable))]
final class ContosoRetailChannelTable_Extension
{
    // Add extension field directly via EDT in AOT properties
    // or via table extension object in D365 F&O Visual Studio
}`,
      },
    ],
    risks: [
      "CDX schema changes require a full CDX download job run after deployment.",
      "Column name conflicts: prefix all extension columns (e.g. CONTOSO_MYFIELD, not MYFIELD).",
      "Always add columns as nullable or with a default value to avoid breaking existing data.",
      "CDX subjob must be included in the deployment package and imported in each environment.",
    ],
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cdx-extensibility",
  },

  "channel-to-hq": {
    title: "Sync data from Channel to HQ (CDX Upload / P-job)",
    direction: "ChannelToHQ",
    overview:
      "P-jobs (Pull jobs) upload data from the channel database back to HQ. " +
      "Common uses: uploading sales transactions, custom data captured at POS, " +
      "or device usage logs. The CRT writes to channel DB; the P-job pushes to HQ.",
    steps: [
      "1. Create a channel DB table for the data to upload (prefixed with ext.CONTOSO_).",
      "2. Write data from the CRT extension to the channel table using a DataService request.",
      "3. In HQ, create an X++ table to receive the uploaded data.",
      "4. Configure a P-job (Distribution schedule) to upload from channel to HQ.",
      "5. Map fields in the CDX subjob: channel table field → HQ table field.",
      "6. In HQ, process the uploaded data via a RetailTransactionServiceEx class if needed.",
    ],
    codeSnippets: [
      {
        label: "CRT: Write to channel extension table",
        language: "csharp",
        code: `// CRT — write to extension table in channel DB
// Use CreateOrUpdateEntityDataServiceRequest to insert/update
var saveRequest = new CreateOrUpdateEntityDataServiceRequest<ContosoExtensionEntity>(entity);
await context.ExecuteAsync<NullResponse>(saveRequest);`,
      },
      {
        label: "Channel DB: Create extension table",
        language: "sql",
        code: `-- Channel DB upload table (prefix with ext.)
CREATE TABLE [ext].[CONTOSO_CUSTOMDATA] (
    [ID]          BIGINT IDENTITY(1,1) NOT NULL,
    [CHANNELID]   BIGINT NOT NULL,
    [TERMINALID]  NVARCHAR(10) NOT NULL,
    [CREATEDDATETIME] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [CUSTOMFIELD] NVARCHAR(200) NOT NULL DEFAULT '',
    CONSTRAINT [PK_CONTOSO_CUSTOMDATA] PRIMARY KEY CLUSTERED ([ID])
);`,
      },
    ],
    risks: [
      "P-jobs upload ALL rows since the last upload. Ensure your table has a proper datetime/sequence column for incremental uploads.",
      "HQ staging tables fill up if not processed. Implement a periodic batch job to process and clear staging data.",
      "Validate data types match between channel DB (SQL) and HQ (X++ EDTs) exactly.",
    ],
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cdx-extensibility",
  },
};

// ─── HQ Extension Guides ───────────────────────────────────────────────────

const HQ_GUIDES: Record<HQExtensionArea, HQExtensionGuide> = {
  Table: {
    area: "Table",
    title: "Extend a D365 Finance & Operations table for Commerce",
    overview: "Add custom fields to existing RetailChannelTable, RetailChannelTableExt, or custom Commerce HQ tables. Use table extension objects (not overlay) to be upgrade-safe.",
    steps: [
      "1. In Visual Studio (D365 F&O), create a new Extension project.",
      "2. Add a Table Extension object: AOT → Data Model → Tables → [TableName] → right-click → Create extension.",
      "3. Add fields to the extension. Prefix field names (e.g. ContosoMyField).",
      "4. If the field needs to sync to channel DB: add to CDX subjob mapping.",
      "5. Build and sync the database.",
      "6. Deploy: include the AOT package in the deployable package.",
    ],
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/finance/dev-itpro/extensibility/extensibility-overview",
  },
  View: {
    area: "View",
    title: "Create a Commerce HQ form extension",
    overview: "Extend existing HQ forms (e.g. RetailChannelForm) to show custom fields added via table extensions. Use form extension objects.",
    steps: [
      "1. Create a Form Extension object in your AOT project.",
      "2. Add controls for the custom fields.",
      "3. Override form methods (init, run, etc.) if needed via event handler classes.",
      "4. Test in a sandbox environment before deploying.",
    ],
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/finance/dev-itpro/extensibility/add-field-extension",
  },
  CDXJob: {
    area: "CDXJob",
    title: "Create or extend a CDX Distribution Schedule job",
    overview: "Distribution schedule jobs define what data syncs between HQ and channel. Job 1090 = registers, 1060 = prices, 1030 = customers, etc. Custom data requires a new subjob added to an appropriate parent job.",
    steps: [
      "1. Navigate to: Retail and Commerce > IT > Distribution schedule.",
      "2. Select the appropriate parent job (e.g. 1090 for register-related data).",
      "3. Click 'Subjobs' → New subjob.",
      "4. Set: Table name = your HQ table, Channel table name = your channel DB table.",
      "5. Map fields in the Field mapping tab.",
      "6. Run the job to verify sync.",
    ],
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cdx-extensibility",
  },
  SyncSubjob: {
    area: "SyncSubjob",
    title: "Configure CDX Subjob for extension table sync",
    overview: "A CDX subjob maps rows from an HQ table to a channel database table. Each field must be explicitly mapped.",
    steps: [
      "1. Ensure the HQ table and channel DB table both exist with matching fields.",
      "2. In the CDX subjob, map each field: Source field (HQ) → Destination field (channel DB).",
      "3. Include subjob configuration in a deployable package for automated environment setup.",
      "4. Use RetailCDXSeedDataBase class to include the subjob in automated seed data if shipping a product.",
    ],
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cdx-extensibility",
  },
  RetailChannelTable: {
    area: "RetailChannelTable",
    title: "Extend RetailChannelTable for store/channel configuration",
    overview: "RetailChannelTable holds channel-level configuration. Extending it allows custom per-store settings to flow from HQ to the channel DB and be read by CRT extensions.",
    steps: [
      "1. Create a Table Extension on RetailChannelTable in your AOT project.",
      "2. Add custom configuration fields (prefixed with your publisher name).",
      "3. Configure CDX to sync the new fields to the channel DB (ax.RETAILCHANNELTABLE).",
      "4. In CRT: read via GetChannelConfigurationServiceRequest → ChannelConfiguration.ExtensionProperties.",
    ],
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/channel-db-extensions",
  },
  Form: {
    area: "Form",
    title: "Add custom UI to Commerce HQ forms",
    overview: "Extend HQ forms (Channel setup, Product catalog, etc.) to expose custom fields added via table extensions.",
    steps: [
      "1. Create a Form Extension object targeting the HQ form (e.g. RetailChannel).",
      "2. Add controls for custom fields using the form designer.",
      "3. Implement event handlers for data source events (modified, validateField).",
      "4. Build and test in a sandbox environment.",
    ],
    docsUrl: "https://learn.microsoft.com/en-us/dynamics365/finance/dev-itpro/extensibility/add-field-extension",
  },
};

// ─── Channel DB Extension Guide ────────────────────────────────────────────

export const CHANNEL_DB_GUIDE: ChannelDbExtensionGuide = {
  title: "Channel Database Extension Guide",
  overview:
    "The channel database (SQL Server) stores Commerce data locally at the store. " +
    "Extensions must add columns to existing tables in the [ext] schema (never modify [ax] schema directly). " +
    "All extension SQL scripts must be idempotent (safe to run multiple times).",
  steps: [
    "1. Create SQL extension scripts targeting the [ext] schema.",
    "2. Add columns to existing ax.* tables via ALTER TABLE with IF NOT EXISTS checks.",
    "3. Package scripts in the Retail Server extension ZIP for automated deployment.",
    "4. In CRT: read extension columns via SqlPagedQuery with ExtensionProperties.",
    "5. Never drop columns or modify existing columns — backward compatibility is required.",
  ],
  codeSnippets: [
    {
      label: "Extension column script (idempotent)",
      language: "sql",
      code: `-- Add extension column — safe to run multiple times
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[ax].[RETAILCHANNELTABLE]')
    AND name = N'CONTOSO_CUSTOMFIELD'
)
BEGIN
    ALTER TABLE [ax].[RETAILCHANNELTABLE]
    ADD [CONTOSO_CUSTOMFIELD] NVARCHAR(100) NOT NULL CONSTRAINT [DF_CONTOSO_CUSTOMFIELD] DEFAULT (N'');
END
GO`,
    },
    {
      label: "CRT: Read extension property from channel DB",
      language: "csharp",
      code: `// Read extension column in CRT via GetChannelConfigurationServiceRequest
var channelRequest = new GetChannelConfigurationServiceRequest();
var channelResponse = await context.ExecuteAsync<GetChannelConfigurationServiceResponse>(channelRequest);

// Extension properties flow through the CDX sync from HQ
var customValue = channelResponse.ChannelConfiguration.ExtensionProperties
    .GetPropertyValue<string>("CONTOSO_CUSTOMFIELD", string.Empty);`,
    },
  ],
  docsUrl: "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/channel-db-extensions",
};

// ─── Public API ────────────────────────────────────────────────────────────

export class D365FOBridge {
  getCDXGuide(topic: "hq-to-channel" | "channel-to-hq"): CDXGuide {
    return CDX_GUIDES[topic]!;
  }

  getHQExtensionGuide(area: HQExtensionArea): HQExtensionGuide {
    return HQ_GUIDES[area];
  }

  getChannelDbGuide(): ChannelDbExtensionGuide {
    return CHANNEL_DB_GUIDE;
  }

  getIntegrationMap(scenario: string): {
    hqSide: string[];
    cdxJobs: string[];
    channelDbSide: string[];
    crtSide: string[];
    posSide: string[];
    docsUrls: string[];
  } {
    const lower = scenario.toLowerCase();
    const hqSide: string[] = [];
    const cdxJobs: string[] = [];
    const channelDbSide: string[] = [];
    const crtSide: string[] = [];
    const posSide: string[] = [];

    if (lower.includes("channel") || lower.includes("store config") || lower.includes("configuration")) {
      hqSide.push("Extend RetailChannelTable with custom config fields");
      cdxJobs.push("Add CDX subjob to job 1070 (Channel configuration)");
      channelDbSide.push("Add columns to ax.RETAILCHANNELTABLE");
      crtSide.push("Read via GetChannelConfigurationServiceRequest");
    }
    if (lower.includes("product") || lower.includes("catalog") || lower.includes("item")) {
      hqSide.push("Extend EcoResProduct / RetailProduct table");
      cdxJobs.push("Add CDX subjob to job 1040 (Products)");
      channelDbSide.push("Add columns to ax.INVENTTABLE or ax.ECORESPRODUCTTRANSLATION");
      crtSide.push("Read via GetProductsServiceRequest with ExtensionProperties");
    }
    if (lower.includes("customer") || lower.includes("loyalty")) {
      hqSide.push("Extend CustTable / RetailLoyaltyCard");
      cdxJobs.push("Add CDX subjob to job 1010 (Customers) or 1030 (Prices/Discounts)");
      channelDbSide.push("Add columns to ax.CUSTTABLE or ax.RETAILLOYALTYCARD");
      crtSide.push("Read via GetCustomersServiceRequest");
    }
    if (lower.includes("transaction") || lower.includes("sale") || lower.includes("upload")) {
      hqSide.push("Create HQ staging table for uploaded transaction data");
      cdxJobs.push("Configure P-job (P-0001) for channel-to-HQ upload");
      channelDbSide.push("Create ext.CONTOSO_CUSTOMTRANSACTIONDATA upload table");
      crtSide.push("Write to upload table via DataService in CRT");
      posSide.push("Trigger upload via Post trigger on TransactionPosted");
    }
    if (lower.includes("price") || lower.includes("discount")) {
      hqSide.push("Configure price groups and trade agreements in HQ");
      cdxJobs.push("Job 1020 (Prices and discounts) — no extension needed unless adding custom price fields");
      channelDbSide.push("Pricing data is read-only in channel DB — do not modify ax.PRICEDISCTABLE");
      crtSide.push("Override GetIndependentPriceDiscountServiceRequest to apply custom pricing logic");
    }

    if (hqSide.length === 0) {
      hqSide.push("Review HQ data model to identify tables that need extending for this scenario");
      cdxJobs.push("Identify which CDX job covers the affected HQ tables");
      channelDbSide.push("Add extension columns in [ext] schema with idempotent ALTER TABLE scripts");
      crtSide.push("Read extension data via appropriate CRT service request");
    }

    return {
      hqSide,
      cdxJobs,
      channelDbSide,
      crtSide,
      posSide,
      docsUrls: [
        "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/channel-db-extensions",
        "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/cdx-extensibility",
        "https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/commerce-runtime-extensibility-data",
      ],
    };
  }

  listAllTopics(): { topic: string; description: string }[] {
    return [
      { topic: "hq-to-channel", description: "Sync data from HQ to channel DB via CDX download jobs" },
      { topic: "channel-to-hq", description: "Upload data from channel DB to HQ via P-jobs" },
      { topic: "channel-db-extension", description: "Extend the channel database with custom tables/columns" },
      { topic: "hq-table-extension", description: "Extend HQ tables in D365 F&O for Commerce" },
      { topic: "hq-cdx-job", description: "Configure CDX distribution schedule jobs" },
      { topic: "hq-sync-subjob", description: "Configure CDX subjobs for field mapping" },
      { topic: "retail-channel-table", description: "Extend RetailChannelTable for per-store configuration" },
      { topic: "hq-form-extension", description: "Extend HQ forms to expose custom fields" },
    ];
  }
}
