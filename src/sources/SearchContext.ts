import path from "path";
import os from "os";
import { VersionResolver } from "../core/VersionResolver.js";
import { GitHubClient } from "./GitHubClient.js";
import { MicrosoftLearnClient } from "./MicrosoftLearnClient.js";
import { SDKCache } from "./SDKCache.js";
import type { CommerceVersion } from "../types/commerce.js";

// Default .mcp dir used when no workspace is provided (global tool cache)
const GLOBAL_MCP_DIR = path.join(os.homedir(), ".commerce-engineering-mcp");

export interface SearchContext {
  version: CommerceVersion;
  branch: string;
  github: GitHubClient;
  learn: MicrosoftLearnClient;
  sdk: SDKCache;
  mcpDir: string;
}

const versionResolver = new VersionResolver();
const githubClient = new GitHubClient(); // singleton — shares rate limiter

export async function buildSearchContext(
  workspacePath?: string,
  explicitVersion?: string
): Promise<SearchContext> {
  const mcpDir = workspacePath ? path.join(workspacePath, ".mcp") : GLOBAL_MCP_DIR;

  let version: CommerceVersion;

  if (explicitVersion) {
    version = {
      version: explicitVersion,
      branch: `release/${explicitVersion}`,
      sdkPackageVersion: null,
      confidence: "HIGH",
      detectedFrom: "explicit",
    };
  } else if (workspacePath) {
    version = await versionResolver.resolve(workspacePath);
  } else {
    version = {
      version: "UNKNOWN",
      branch: "main",
      sdkPackageVersion: null,
      confidence: "UNKNOWN",
      detectedFrom: null,
    };
  }

  return {
    version,
    branch: version.branch === "UNKNOWN" ? "main" : version.branch,
    github: githubClient,
    learn: new MicrosoftLearnClient(mcpDir),
    sdk: new SDKCache(mcpDir),
    mcpDir,
  };
}
