import type { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const E2ESolutionPrompt: Prompt = {
  name: "e2e-solution",
  description:
    "Generates a complete End-to-End Dynamics 365 Commerce solution: architecture design first, then full code generation across all required layers.",
  arguments: [
    { name: "scenario", description: "The E2E scenario to implement e.g. 'QR code product lookup and cart add'", required: true },
    { name: "workspacePath", description: "Path to the workspace", required: true },
    { name: "components", description: "Comma-separated Commerce areas: POS,CRT,RetailServer,HardwareStation (auto-detected if omitted)", required: false },
  ],
};

export function buildE2ESolutionMessage(scenario: string, workspacePath: string, components?: string): string {
  const componentList = components
    ? components.split(",").map(c => c.trim()).filter(Boolean)
    : null;

  const componentHint = componentList
    ? `Requested components: ${componentList.join(", ")}`
    : "Components will be auto-detected from the scenario description.";

  return `You are executing an **End-to-End Solution** generation for Dynamics 365 Commerce.

## Scenario
${scenario}

## Workspace
${workspacePath}

## ${componentHint}

## Execution plan
Run the following tools IN ORDER:

### Step 1 — Architecture Design
Call \`architecture_review\` with:
- workspacePath: "${workspacePath}"
- scenario: "${scenario}"
${componentList ? `- components: ${JSON.stringify(componentList)}` : ""}

Present the architecture plan to the user and confirm before proceeding to code generation.

### Step 2 — Version Detection
Call \`detect_commerce_version\` with workspacePath="${workspacePath}"
This ensures all generated code references the correct SDK version.

### Step 3 — Full Solution Generation
Call \`generate_solution\` with:
- workspacePath: "${workspacePath}"
- scenario: "${scenario}"
- components: (from architecture_review result or: ${componentList ? JSON.stringify(componentList) : "auto-detected"})
- solutionName: (derive from scenario)

### Step 4 — HQ Integration (if needed)
If the solution requires data to flow from/to D365 Finance & Operations HQ, call:
\`get_hq_integration_guide\` with topic="integration-map" and scenario="${scenario}"

### Step 5 — Present results
Show the user:
1. List of all generated files with their relative paths
2. Registration steps (manifest.json, CommerceRuntime.Ext.config, etc.)
3. Deployment checklist
4. Testing recommendations

## Anti-hallucination contract
- All generated code is pre-validated by PatternValidator before being returned
- If GenerateSolution returns \`success: false\`, report the blocked patterns and do NOT attempt to generate code manually
- Never write Commerce extension code outside the generator tools
- Official SDK: https://github.com/microsoft/Dynamics365Commerce.Solutions`;
}
