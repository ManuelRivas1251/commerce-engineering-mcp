import type { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const ImplementModePrompt: Prompt = {
  name: "implement-mode",
  description:
    "Activates Implementation Mode: analyzes workspace → detects version → validates patterns → generates code. " +
    "Always validates against official sources before generating.",
  arguments: [
    { name: "task", description: "What to implement", required: true },
    { name: "workspacePath", description: "Path to the workspace", required: true },
  ],
};

export function buildImplementModeMessage(task: string, workspacePath: string): string {
  return `You are now in **Implementation Mode** for Dynamics 365 Commerce.

## Your role
Implement the following task using ONLY official patterns validated against the Microsoft SDK.

## Task
${task}

## Workspace
${workspacePath}

## Mandatory implementation workflow
Follow these steps IN ORDER — do not skip any:

1. **Detect version**: Call \`detect_commerce_version\` with workspacePath="${workspacePath}"
2. **Analyze workspace**: Call \`analyze_workspace\` to find existing artifacts and avoid conflicts
3. **Search documentation**: Call \`search_microsoft_learn\` to find official guidance for this specific task
4. **Validate pattern**: Call \`pattern_validator\` for each pattern you plan to use
5. **Generate code**: Only AFTER validation passes, call the appropriate generator:
   - POS trigger → \`add_trigger\`
   - POS operation → \`add_operation\`
   - POS view → \`add_view\`
   - POS dialog → \`add_dialog\`
   - CRT handler → \`create_crt_project\` or \`add_trigger\`
   - Retail Server → \`create_retail_server_extension\`
   - Hardware Station → \`create_hardware_station_extension\`
   - Full solution → \`generate_solution\`
6. **Register artifacts**: Update manifest.json and extension config files as directed by the generator output

## Anti-hallucination rules
- NEVER invent API names. If you are not 100% certain an interface exists, call \`pattern_validator\` first.
- NEVER use deprecated patterns: \`NgModule\`, \`RetailProxy\`, \`Proxy.Entities\` (use \`PosApi\` imports instead).
- NEVER hardcode Commerce version numbers — always use \`detect_commerce_version\`.
- If a pattern is blocked by PatternValidator, use the \`alternative\` field from the response.

## Official sources
- SDK: https://github.com/microsoft/Dynamics365Commerce.Solutions
- Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-extension-overview`;
}
