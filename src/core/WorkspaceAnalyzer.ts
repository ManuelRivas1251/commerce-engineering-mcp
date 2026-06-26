import { promises as fs } from "fs";
import path from "path";
import fg from "fast-glob";
import type { CommerceArtifact, CommerceArea, CommerceArtifactType, WorkspaceIndex } from "../types/commerce.js";
import { VersionResolver } from "./VersionResolver.js";
import { IndexManager } from "./IndexManager.js";
import { logger } from "./Logger.js";

// ── Pattern definitions ───────────────────────────────────────────────────────

interface ArtifactPattern {
  type: CommerceArtifactType;
  area: CommerceArea;
  // Regex applied to file content to detect the artifact
  contentPattern: RegExp;
  // Regex to extract the artifact name from the matched line
  namePattern: RegExp;
}

const ARTIFACT_PATTERNS: ArtifactPattern[] = [
  // ── POS Operations ──────────────────────────────────────────────────────────
  {
    type: "Operation",
    area: "POS",
    contentPattern: /implements\s+IOperationHandler|extends\s+OperationHandlerBase/,
    namePattern: /class\s+(\w+)/,
  },
  {
    type: "Operation",
    area: "POS",
    contentPattern: /operationId\s*[:=]\s*\d{4,}/,
    namePattern: /class\s+(\w+)|const\s+(\w+)/,
  },

  // ── POS Triggers ───────────────────────────────────────────────────────────
  {
    type: "Trigger",
    area: "POS",
    contentPattern: /implements\s+I(?:Pre|Post|Cancel)Trigger|extends\s+(?:Pre|Post|Cancel)TriggerBase/,
    namePattern: /class\s+(\w+)/,
  },
  {
    type: "Trigger",
    area: "POS",
    contentPattern: /ITrigger|IApplicationTrigger/,
    namePattern: /class\s+(\w+)/,
  },

  // ── POS Dialogs ────────────────────────────────────────────────────────────
  {
    type: "Dialog",
    area: "POS",
    contentPattern: /extends\s+(?:DialogBase|ShowDialogClientRequest|SimpleExtensionDialog)|ShowDialogClientRequest/,
    namePattern: /class\s+(\w+)/,
  },

  // ── POS Views ─────────────────────────────────────────────────────────────
  {
    type: "View",
    area: "POS",
    contentPattern: /extends\s+(?:CustomViewControllerBase|ExtensionViewControllerBase)|ICustomViewControllerContext/,
    namePattern: /class\s+(\w+)/,
  },

  // ── POS Controls ──────────────────────────────────────────────────────────
  {
    type: "Control",
    area: "POS",
    contentPattern: /extends\s+(?:CustomControl|ExtensionControl)|ICustomControl/,
    namePattern: /class\s+(\w+)/,
  },

  // ── CRT Requests ──────────────────────────────────────────────────────────
  {
    type: "Request",
    area: "CRT",
    contentPattern: /:\s*Request\b|extends\s+CommerceRuntimeRequest|:\s*Request(?:Handler)?</,
    namePattern: /class\s+(\w+)/,
  },

  // ── CRT Responses ─────────────────────────────────────────────────────────
  {
    type: "Response",
    area: "CRT",
    contentPattern: /:\s*Response\b|extends\s+CommerceRuntimeResponse/,
    namePattern: /class\s+(\w+)/,
  },

  // ── CRT Service Handlers ──────────────────────────────────────────────────
  {
    type: "CRTService",
    area: "CRT",
    contentPattern: /IRequestHandler|INamedRequestHandler|IRequestHandlerAsync|SingleAsyncRequestHandler/,
    namePattern: /class\s+(\w+)/,
  },

  // ── Retail Server API ─────────────────────────────────────────────────────
  {
    type: "RetailServerAPI",
    area: "RetailServer",
    contentPattern: /IController|CommerceController|BindEntity|BindEntitySet/,
    namePattern: /class\s+(\w+)/,
  },

  // ── Hardware Station ──────────────────────────────────────────────────────
  {
    type: "HardwareStationExtension",
    area: "HardwareStation",
    contentPattern: /IHardwareStationController|HardwareStationDeviceActionRequest|IHardwareStation/,
    namePattern: /class\s+(\w+)/,
  },
];

// File extension → areas to scan
const AREA_EXTENSIONS: Record<string, string[]> = {
  ".ts": ["POS"],
  ".tsx": ["POS"],
  ".cs": ["CRT", "RetailServer", "HardwareStation"],
};

// ── WorkspaceAnalyzer ─────────────────────────────────────────────────────────

export interface AnalyzeResult {
  index: WorkspaceIndex;
  fromCache: boolean;
}

export class WorkspaceAnalyzer {
  private readonly versionResolver = new VersionResolver();

  async analyze(workspacePath: string, force = false): Promise<AnalyzeResult> {
    const manager = new IndexManager(workspacePath);

    // Return cached index if fresh and not forced
    if (!force && !(await manager.isStale())) {
      const cached = await manager.load();
      if (cached) {
        logger.info({ workspacePath }, "Returning cached workspace index");
        return { index: cached, fromCache: true };
      }
    }

    logger.info({ workspacePath }, "Starting workspace analysis");

    // 1. Detect version
    const version = await this.versionResolver.resolve(workspacePath);

    // 2. Build empty index
    const index = manager.buildEmpty(version);

    // 3. Collect all relevant source files
    const files = await fg(["**/*.ts", "**/*.tsx", "**/*.cs"], {
      cwd: workspacePath,
      absolute: true,
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/bin/**",
        "**/obj/**",
        "**/.mcp/**",
        "**/*.d.ts",
        "**/*.spec.ts",
        "**/*.test.ts",
      ],
    });

    logger.info({ fileCount: files.length }, "Files to analyze");

    // 4. Classify each file
    for (const filePath of files) {
      const ext = path.extname(filePath).toLowerCase();
      const areas = AREA_EXTENSIONS[ext];
      if (!areas) continue;

      try {
        const content = await fs.readFile(filePath, "utf-8");
        const relativePath = path.relative(workspacePath, filePath);

        const artifacts = this.extractArtifacts(content, relativePath, areas);
        this.mergeIntoIndex(index, artifacts);
      } catch {
        // Unreadable file — skip silently
      }
    }

    logger.info(
      {
        operations: index.operations.length,
        triggers: index.triggers.length,
        requests: index.requests.length,
        responses: index.responses.length,
        dialogs: index.dialogs.length,
        views: index.views.length,
        controls: index.controls.length,
        crt: index.crt.length,
        retailServer: index.retailServer.length,
        hardwareStation: index.hardwareStation.length,
      },
      "Workspace analysis complete"
    );

    // 5. Persist
    await manager.save(index);
    await this.persistSlices(manager, index);

    return { index, fromCache: false };
  }

  private extractArtifacts(
    content: string,
    filePath: string,
    _areas: string[]
  ): CommerceArtifact[] {
    const found: CommerceArtifact[] = [];
    const lines = content.split("\n");
    // Proximity window: search for the class/const name this many lines
    // before and after the line that matched the contentPattern.
    const WINDOW = 15;

    for (const pattern of ARTIFACT_PATTERNS) {
      // Find every line index where the contentPattern matches (line-level).
      const matchIndices: number[] = [];
      for (let i = 0; i < lines.length; i++) {
        if (pattern.contentPattern.test(lines[i])) {
          matchIndices.push(i);
        }
      }
      if (matchIndices.length === 0) continue;

      // For each match, look for the namePattern only within the proximity window.
      let artifactFound = false;
      for (const matchIdx of matchIndices) {
        if (artifactFound) break;
        const start = Math.max(0, matchIdx - WINDOW);
        const end = Math.min(lines.length - 1, matchIdx + WINDOW);

        for (let i = start; i <= end; i++) {
          const nameMatch = lines[i].match(pattern.namePattern);
          if (!nameMatch) continue;

          const name = nameMatch[1] ?? nameMatch[2];
          // Require at least 3 chars to avoid matching keywords like "If"
          if (!name || name.length < 3) continue;

          // Avoid duplicates within the same file
          const already = found.some((f) => f.name === name && f.type === pattern.type);
          if (already) continue;

          // Extract namespace from C# files
          const namespace = this.extractNamespace(content);

          found.push({
            name,
            type: pattern.type,
            area: pattern.area,
            filePath,
            ...(namespace ? { namespace } : {}),
          });
          artifactFound = true;
          break;
        }
      }
    }

    return found;
  }

  private extractNamespace(content: string): string | null {
    const m = content.match(/namespace\s+([\w.]+)/);
    return m ? m[1] : null;
  }

  private mergeIntoIndex(index: WorkspaceIndex, artifacts: CommerceArtifact[]): void {
    for (const artifact of artifacts) {
      const key = artifact.type;

      switch (key) {
        case "Operation":
          index.operations.push(artifact);
          break;
        case "Trigger":
          index.triggers.push(artifact);
          break;
        case "Request":
          index.requests.push(artifact);
          break;
        case "Response":
          index.responses.push(artifact);
          break;
        case "Dialog":
          index.dialogs.push(artifact);
          break;
        case "View":
          index.views.push(artifact);
          break;
        case "Control":
          index.controls.push(artifact);
          break;
        case "CRTService":
          index.crt.push(artifact);
          break;
        case "RetailServerAPI":
          index.retailServer.push(artifact);
          break;
        case "HardwareStationExtension":
          index.hardwareStation.push(artifact);
          break;
        case "Handler":
          index.crt.push(artifact);
          break;
      }
    }
  }

  private async persistSlices(manager: IndexManager, index: WorkspaceIndex): Promise<void> {
    await Promise.all([
      manager.saveSlice("operations", index.operations),
      manager.saveSlice("triggers", index.triggers),
      manager.saveSlice("requests", index.requests),
      manager.saveSlice("responses", index.responses),
      manager.saveSlice("dialogs", index.dialogs),
      manager.saveSlice("views", index.views),
      manager.saveSlice("controls", index.controls),
      manager.saveSlice("crt", index.crt),
      manager.saveSlice("retail-server", index.retailServer),
      manager.saveSlice("hardware-station", index.hardwareStation),
      manager.saveSlice("architecture", {
        version: index.version,
        workspacePath: index.workspacePath,
        lastUpdated: index.lastUpdated,
        summary: {
          operations: index.operations.length,
          triggers: index.triggers.length,
          requests: index.requests.length,
          responses: index.responses.length,
          dialogs: index.dialogs.length,
          views: index.views.length,
          controls: index.controls.length,
          crtServices: index.crt.length,
          retailServerApis: index.retailServer.length,
          hardwareStationExtensions: index.hardwareStation.length,
        },
      }),
    ]);
  }
}
