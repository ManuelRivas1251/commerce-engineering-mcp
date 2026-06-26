import type { Resource } from "@modelcontextprotocol/sdk/types.js";

export const WORKSPACE_RESOURCES: Resource[] = [
  {
    uri: "commerce://workspace",
    name: "Workspace Analysis",
    description: "Full workspace-analysis.json: version, SDK, extensions detected",
    mimeType: "application/json",
  },
  {
    uri: "commerce://operations",
    name: "Existing Operations",
    description: "All custom POS operations detected in the workspace",
    mimeType: "application/json",
  },
  {
    uri: "commerce://triggers",
    name: "Existing Triggers",
    description: "All POS triggers detected in the workspace",
    mimeType: "application/json",
  },
  {
    uri: "commerce://requests",
    name: "Existing Requests",
    description: "All custom Requests detected in the workspace",
    mimeType: "application/json",
  },
  {
    uri: "commerce://sdk",
    name: "SDK Info",
    description: "SDK version, branch, download date, and indexed areas",
    mimeType: "application/json",
  },
  {
    uri: "commerce://architecture",
    name: "Architecture Map",
    description: "Architecture map of the Commerce project",
    mimeType: "application/json",
  },
];
