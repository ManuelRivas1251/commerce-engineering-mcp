import type { CommerceArea, CommerceArtifactType } from "./commerce.js";

export interface ToolContext {
  workspacePath: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  sources?: string[];
}

// Input schemas (mirrored from Zod for typing)
export interface AnalyzeWorkspaceInput {
  workspacePath: string;
}

export interface SearchInput {
  query: string;
  version?: string;
  maxResults?: number;
}

export interface AddArtifactInput {
  workspacePath: string;
  name: string;
  area?: CommerceArea;
  targetFile?: string;
}

export interface PatternValidatorInput {
  pattern: string;
  commerceArea: CommerceArea;
  artifactType: CommerceArtifactType;
  version?: string;
}

export interface CreateProjectInput {
  workspacePath: string;
  projectName: string;
  targetPath: string;
}

export interface GenerateSolutionInput {
  workspacePath: string;
  scenario: string;
  components: CommerceArea[];
}

export interface ListArtifactsInput {
  workspacePath: string;
}
