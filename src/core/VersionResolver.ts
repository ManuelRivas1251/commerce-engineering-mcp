import { promises as fs } from "fs";
import path from "path";
import fg from "fast-glob";
import type { CommerceVersion } from "../types/commerce.js";
import { logger } from "./Logger.js";

/**
 * Maps a D365 Commerce app version (10.0.X) to its GitHub branch name.
 *
 * The Dynamics365Commerce.Solutions repo uses release/9.Y branches where
 *   Y = X - (some offset). Known mapping verified against the repo:
 *   10.0.40 → release/9.50
 *   10.0.41 → release/9.51
 *   10.0.42 → release/9.52
 *   10.0.43 → release/9.53
 *   10.0.44 → release/9.54
 *   10.0.45 → release/9.55
 *   10.0.46 → release/9.56   ← confirmed present in GitHub
 *
 * Formula: sdkMinor = appMinor + 10  (i.e. 10.0.46 → 9.(46+10) = 9.56)
 * Source: https://github.com/microsoft/Dynamics365Commerce.Solutions/branches
 */
function buildBranch(version: string): string {
  const m = version.match(/^10\.0\.(\d+)/);
  if (m) {
    const appMinor = parseInt(m[1], 10);
    const sdkMinor = appMinor + 10;
    return `release/9.${sdkMinor}`;
  }
  // npm-style "9.56.x" → already in release/9.56 format
  const m2 = version.match(/^9\.(\d+)/);
  if (m2) return `release/9.${m2[1]}`;

  return `release/9.56`; // fallback to latest known branch
}

// Extracts a version string from text using common D365 Commerce patterns.
function extractVersion(text: string): string | null {
  const patterns = [
    // 10.0.46 style
    /(\d{1,2}\.\d{1,3}\.\d{1,4})/,
    // npm package version like "9.46.22019.3" - map to "10.0.46"
    /[^0-9]9\.(\d{2,3})\.\d/,
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1] ?? m[0];
  }
  return null;
}

// Normalises an npm "9.46.x" version to "10.0.46"
function normaliseNpmVersion(raw: string): string | null {
  // "@dynamics365/commerce-sdk-retail": "9.46.22019.3" → 10.0.46
  const m = raw.match(/^9\.(\d{2,3})\./);
  if (m) return `10.0.${m[1]}`;
  // Direct "10.0.46.x" or "10.0.46"
  const m2 = raw.match(/^(10\.\d+\.\d+)/);
  if (m2) return m2[1];
  return null;
}

interface DetectionStep {
  file: string;
  confidence: CommerceVersion["confidence"];
  extract: (content: string, filePath: string) => string | null;
}

const DETECTION_STEPS: DetectionStep[] = [
  {
    file: "CustomizationPackage.props",
    confidence: "HIGH",
    extract: (content) => {
      const m = content.match(/<MicrosoftDynamicsCommerceVersion>(.*?)<\/MicrosoftDynamicsCommerceVersion>/);
      return m ? extractVersion(m[1]) : null;
    },
  },
  {
    // Official Microsoft repo.props pattern — MajorVersion is the SDK version (e.g. 9.56)
    // which maps to app version 10.0.(sdkMinor) via: appMinor = sdkMinor - 10
    file: "repo.props",
    confidence: "HIGH",
    extract: (content) => {
      const m = content.match(/<MajorVersion[^>]*>(9\.\d+)<\/MajorVersion>/);
      if (m) {
        const sdkMinor = parseInt(m[1].split(".")[1], 10);
        return `10.0.${sdkMinor - 10}`; // 9.56 → 10.0.46
      }
      // Also check CommerceSdkPackagesVersion range like [9.56.*-*,9.57)
      const m2 = content.match(/CommerceSdkPackagesVersion[^>]*>\[9\.(\d+)\./);
      if (m2) {
        const sdkMinor = parseInt(m2[1], 10);
        return `10.0.${sdkMinor - 10}`;
      }
      return null;
    },
  },
  {
    file: "package.json",
    confidence: "HIGH",
    extract: (content) => {
      try {
        const pkg = JSON.parse(content) as Record<string, unknown>;
        const deps = {
          ...((pkg["dependencies"] ?? {}) as Record<string, string>),
          ...((pkg["devDependencies"] ?? {}) as Record<string, string>),
          ...((pkg["peerDependencies"] ?? {}) as Record<string, string>),
        };

        const commerceKeys = [
          "@dynamics365/commerce-sdk-retail",
          "@msdyn365-commerce/core",
          "@msdyn365-commerce-modules/retail-proxy",
        ];

        for (const key of commerceKeys) {
          const ver = deps[key];
          if (ver) {
            const normalised = normaliseNpmVersion(ver.replace(/[\^~>=<]/g, ""));
            if (normalised) return normalised;
          }
        }
      } catch {
        // not valid JSON
      }
      return null;
    },
  },
  {
    file: "manifest.json",
    confidence: "MEDIUM",
    extract: (content) => {
      try {
        const manifest = JSON.parse(content) as Record<string, unknown>;
        const pv = manifest["platformVersion"] ?? manifest["minPlatformVersion"];
        if (typeof pv === "string") return extractVersion(pv);
      } catch {
        // not valid JSON
      }
      return null;
    },
  },
  {
    file: "CommerceRuntime.config",
    confidence: "MEDIUM",
    extract: (content) => extractVersion(content),
  },
  {
    file: "CommerceRuntime.Ext.config",
    confidence: "MEDIUM",
    extract: (content) => extractVersion(content),
  },
];

export class VersionResolver {
  async resolve(workspacePath: string): Promise<CommerceVersion> {
    // 1. Try fixed-name files in order of confidence
    for (const step of DETECTION_STEPS) {
      const result = await this.tryFile(workspacePath, step);
      if (result) {
        logger.info({ version: result.version, from: result.detectedFrom }, "Version detected");
        return result;
      }
    }

    // 2. Glob for *.csproj / *.props files that reference Commerce packages
    const csprojResult = await this.tryCsproj(workspacePath);
    if (csprojResult) {
      logger.info({ version: csprojResult.version, from: csprojResult.detectedFrom }, "Version detected via csproj");
      return csprojResult;
    }

    // 3. Search lock files as last resort
    const lockResult = await this.tryLockFile(workspacePath);
    if (lockResult) {
      logger.info({ version: lockResult.version, from: lockResult.detectedFrom }, "Version detected via lock file");
      return lockResult;
    }

    logger.warn({ workspacePath }, "Commerce version could not be determined");
    return {
      version: "UNKNOWN",
      branch: "UNKNOWN",
      sdkPackageVersion: null,
      confidence: "UNKNOWN",
      detectedFrom: null,
    };
  }

  private async tryFile(
    workspacePath: string,
    step: DetectionStep
  ): Promise<CommerceVersion | null> {
    // Search up to 3 directory levels deep to handle mono-repo layouts
    const matches = await fg([`**/${step.file}`, step.file], {
      cwd: workspacePath,
      deep: 4,
      absolute: true,
      ignore: ["**/node_modules/**", "**/dist/**", "**/.mcp/**"],
    });

    for (const filePath of matches) {
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const version = step.extract(content, filePath);
        if (version) {
          return {
            version,
            branch: buildBranch(version),
            sdkPackageVersion: this.extractSdkPackageVersion(content),
            confidence: step.confidence,
            detectedFrom: path.relative(workspacePath, filePath),
          };
        }
      } catch {
        // file unreadable – continue
      }
    }
    return null;
  }

  private async tryCsproj(workspacePath: string): Promise<CommerceVersion | null> {
    const files = await fg(["**/*.csproj", "**/*.props"], {
      cwd: workspacePath,
      deep: 5,
      absolute: true,
      ignore: ["**/node_modules/**", "**/dist/**", "**/.mcp/**"],
    });

    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, "utf-8");
        // Look for Microsoft.Dynamics.Commerce.* PackageReference
        const m = content.match(
          /Microsoft\.Dynamics\.Commerce\.[^"'<]*[^"'<]*Version[^"'>]*["']([^"']+)["']/i
        );
        if (m) {
          const version = extractVersion(m[1]);
          if (version) {
            return {
              version,
              branch: buildBranch(version),
              sdkPackageVersion: version,
              confidence: "MEDIUM",
              detectedFrom: path.relative(workspacePath, filePath),
            };
          }
        }
      } catch {
        // continue
      }
    }
    return null;
  }

  private async tryLockFile(workspacePath: string): Promise<CommerceVersion | null> {
    const lockFiles = ["package-lock.json", "yarn.lock"];

    for (const lockFile of lockFiles) {
      const filePath = path.join(workspacePath, lockFile);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        // Find resolved version of the Commerce SDK in the lock file
        const m = content.match(
          /@dynamics365\/commerce-sdk-retail@[^:\n]*[:\n]\s*version[^:]*:\s*["']?([^"'\n,]+)/
        );
        if (m) {
          const version = normaliseNpmVersion(m[1].trim());
          if (version) {
            return {
              version,
              branch: buildBranch(version),
              sdkPackageVersion: m[1].trim(),
              confidence: "LOW",
              detectedFrom: lockFile,
            };
          }
        }
      } catch {
        // file doesn't exist – continue
      }
    }
    return null;
  }

  private extractSdkPackageVersion(content: string): string | null {
    const commerceKeys = [
      "@dynamics365/commerce-sdk-retail",
      "@msdyn365-commerce/core",
    ];
    for (const key of commerceKeys) {
      const escaped = key.replace("/", "\\/");
      const m = content.match(new RegExp(`["']${escaped}["']\\s*:\\s*["']([^"']+)["']`));
      if (m) return m[1];
    }
    return null;
  }
}
