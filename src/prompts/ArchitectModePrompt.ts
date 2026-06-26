import type { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const ArchitectModePrompt: Prompt = {
  name: "architect-mode",
  description:
    "Activates Architect Mode: delivers a complete architecture design for the given D365 Commerce scenario " +
    "(objective, layers, data flow, risks, testing plan, deployment notes). Does NOT generate code.",
  arguments: [
    { name: "scenario", description: "The Commerce scenario or feature to design", required: true },
    { name: "workspacePath", description: "Path to the workspace (for version detection)", required: false },
  ],
};

export function buildArchitectModeMessage(scenario: string, workspacePath?: string): string {
  const wsHint = workspacePath
    ? `Workspace: ${workspacePath} — use architecture_review to detect the Commerce version and analyse the scenario.`
    : "No workspace path provided. Call architecture_review with the scenario; version detection will use defaults.";

  return `You are now in **Architect Mode** for Dynamics 365 Commerce.

## Your role
Design the architecture for the following scenario WITHOUT generating any code.
Deliver only: objective, required Commerce layers, artifact recommendations, data flow, risks, testing plan, and deployment notes.

## Scenario
${scenario}

## Instructions
1. Call \`architecture_review\` with workspacePath and scenario to get the full architecture plan.
2. Present the plan as a structured document with clear sections.
3. Highlight HIGH-severity risks prominently.
4. Recommend which tools to call next (e.g. \`generate_solution\`, \`add_trigger\`).
5. Do NOT write any TypeScript or C# code in this mode.

## Workspace
${wsHint}

## Anti-hallucination rules
- Only reference patterns that exist in the official SDK: https://github.com/microsoft/Dynamics365Commerce.Solutions
- If uncertain about a pattern, call \`pattern_validator\` before recommending it.
- Never reference deprecated patterns: NgModule, RetailProxy (replaced by PosApi imports).`;
}
