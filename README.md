# commerce-engineering-mcp

MCP (Model Context Protocol) server for **Dynamics 365 Commerce / Store Commerce** development.
It gives Claude Desktop, Claude Code, and any MCP-compatible client version-aware, hallucination-guarded
assistance for building POS, Commerce Runtime (CRT), Retail Server (CSU), and Hardware Station extensions.

## What it does

- **Scaffolds** full Commerce SDK solutions (repo.props, CustomizationPackage.props, .sln, CRT/POS/ScaleUnit/
  installers/ChannelDatabase projects) matching the official `Dynamics365Commerce.Solutions` structure,
  including the real-world MSBuild workarounds the sealed SDK needs.
- **Generates POS artifacts** — triggers, custom operations, dialogs, views, controls, grid columns,
  totals fields, localization, manifests — validated against the official SDK for the *detected* Commerce
  version before any code is produced (`PatternValidator` + anti-hallucination guard).
- **Builds locally** — compiles extension projects and installer packages with `dotnet build`, returning
  structured MSBuild diagnostics instead of raw logs.
- **Indexes your workspace** — detects existing operations, triggers, CRT request/response contracts,
  Retail Server controllers, and exposes them as MCP resources.
- **Answers from official sources** — embedded Microsoft Learn catalog (~90 articles, offline),
  live GitHub search over `microsoft/Dynamics365Commerce.Solutions` scoped to your release branch,
  and CDX/HQ integration guides.

## Requirements

- Node.js >= 20
- .NET SDK 8.x on `PATH` (only for the `BuildExtension` / `PackageInstaller` tools)
- Optional: a GitHub token for code search (unauthenticated calls are rate-limited to 60 req/hour)

## Installation

```powershell
cd C:\AMSourceControl\Tools\commerce-engineering-mcp
npm install
npm run build
```

Verify:

```powershell
npm test          # 6 test files — includes an E2E suite that speaks JSON-RPC over stdio
npm run typecheck
```

## Client configuration

### Claude Desktop (`claude_desktop_config.json`) / Claude Code (`.mcp.json`)

```json
{
  "mcpServers": {
    "commerce-engineering-mcp": {
      "command": "node",
      "args": ["C:\\AMSourceControl\\Tools\\commerce-engineering-mcp\\dist\\server.js"],
      "env": {
        "LOG_LEVEL": "info",
        "NODE_ENV": "production",
        "GITHUB_TOKEN": "",
        "COMMERCE_WORKSPACE_PATH": "C:\\AMSourceControl\\Projects",
        "COMMERCE_ALLOWED_ROOTS": "C:\\AMSourceControl"
      }
    }
  }
}
```

A ready-to-copy template lives in [mcp.json](mcp.json).

### Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `LOG_LEVEL` | pino log level (`debug`, `info`, `warn`, `error`). Logs go to **stderr** — never stdout, which carries the JSON-RPC stream. | `info` |
| `GITHUB_TOKEN` | Enables GitHub Code Search over the official samples repo. **Never commit a real token** — leave it empty in versioned files and inject it from your client config or OS environment. | unset |
| `COMMERCE_WORKSPACE_PATH` | Default workspace used by the `commerce://*` resources when a tool hasn't been called yet. | last workspace used, else `cwd` |
| `COMMERCE_ALLOWED_ROOTS` | Semicolon-separated list of directory roots tools may read, index, or build (e.g. `C:\AMSourceControl;C:\Projects`). When set, any tool call with a path outside these roots is rejected with a clean error. When empty, all paths are allowed. | unset (guard disabled) |

## Tools (38)

| Category | Tools | Notes |
|---|---|---|
| Workspace | `AnalyzeWorkspace`, `DetectCommerceVersion`, `RefreshWorkspaceIndex` | Index is written to `<workspace>\.mcp\` |
| Search | `SearchMicrosoftLearn`, `SearchOfficialSamples`, `SearchSDK`, `SearchPOSApi`, `SearchCRTApi`, `SearchRetailServer`, `SearchHardwareStation`, `SearchDocumentation`, `SearchSamplesByVersion`, `GetOfficialPattern`, `GetHQIntegrationGuide` | Read-only; some call GitHub / Microsoft Learn with 10–15 s timeouts |
| Add (POS artifacts) | `AddTrigger`, `AddOperation`, `AddDialog`, `AddView`, `AddControl`, `AddCustomColumn`, `AddTotalsField`, `AddLocalization`, `AddManifest` | Generated files are **returned as content** — the client writes them under its own permission model; the server never writes into your project |
| Create (scaffolding) | `CreateStoreCommerceProject`, `CreateCRTProject`, `CreateRetailServerExtension`, `CreateHardwareStationExtension` | Same return-as-content model |
| Validate | `PatternValidator`, `ArchitectureReview`, `GenerateSolution`, `ValidateManifest` | `ValidateManifest` checks an existing manifest.json (required fields, semver, components structure, modulePath existence) |
| Build | `BuildExtension`, `PackageInstaller` | Run `dotnet build` via `execFile` (no shell), with hard timeout, bounded output, and structured `error CSxxxx` / `MSBxxxx` diagnostics. Build failures never crash the server |

All tools declare MCP **annotations** (`readOnlyHint`, `destructiveHint`, `openWorldHint`) so client
permission UIs can auto-approve read-only calls.

## Resources (7)

`commerce://workspace`, `commerce://operations`, `commerce://triggers`, `commerce://requests`,
`commerce://sdk`, `commerce://architecture`, `commerce://docs` — all `application/json`, all safe to
read at any time (they degrade to a hint payload when the workspace hasn't been indexed yet).

## Prompts (3)

- `architect-mode` — design a Commerce feature across POS/CRT/RetailServer/HardwareStation layers
- `implement-mode` — implement a task in an existing workspace
- `e2e-solution` — end-to-end scenario across selected components

## Development

```powershell
npm run dev            # tsx watch mode
npm test               # vitest (unit + stdio E2E)
npm run test:coverage
npm run lint
```

Architecture notes:

- **Transport:** stdio only (`StdioServerTransport`). All logging goes to stderr via pino.
- **Version awareness:** `VersionResolver` maps app versions (10.0.40–10.0.46) to SDK branches
  (release/9.50–9.56); generation is validated against the matching branch.
- **Trust model:** local, single-user. Harden with `COMMERCE_ALLOWED_ROOTS` when the server may
  receive paths you don't fully control.
