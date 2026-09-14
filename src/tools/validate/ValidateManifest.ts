import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { fileExists } from "../../core/PathGuard.js";

export const ValidateManifestSchema = z.object({
  manifestPath: z
    .string()
    .min(1)
    .describe("Absolute path to the POS extension manifest.json to validate"),
  checkModulePaths: z
    .boolean()
    .default(true)
    .describe("Verify that every modulePath referenced in the manifest exists on disk (.ts or .js)"),
});

type ValidateManifestInput = z.infer<typeof ValidateManifestSchema>;

interface Finding {
  severity: "error" | "warning";
  path: string;
  message: string;
}

const SEMVER_RE = /^\d+\.\d+\.\d+(\.\d+)?$/;
const KNOWN_TOP_LEVEL = new Set([
  "$schema", "name", "publisher", "version", "minimumPosVersion",
  "description", "dependencies", "components",
]);
const KNOWN_EXTEND_KEYS = new Set([
  "triggers", "requestHandlers", "views", "peripherals",
  "transactionGridColumns", "customLinesGridColumns", "totalsPanel", "receipts",
]);
const KNOWN_CREATE_KEYS = new Set([
  "operations", "templatedDialogs", "views", "dialogs", "customControls",
]);

// Fields the POS manifest schema requires on every customControls[] entry.
const CUSTOM_CONTROL_REQUIRED_FIELDS = ["controlName", "htmlPath", "modulePath", "name", "description"] as const;

// Collect every object bearing a modulePath so we can existence-check them.
function collectModulePaths(node: unknown, jsonPath: string, out: { jsonPath: string; modulePath: string }[]): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectModulePaths(item, `${jsonPath}[${i}]`, out));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "modulePath" && typeof value === "string") {
        out.push({ jsonPath: `${jsonPath}.modulePath`, modulePath: value });
      } else {
        collectModulePaths(value, `${jsonPath}.${key}`, out);
      }
    }
  }
}

// Collect every customControls[] entry (under any view or the create section) for registration checks.
function collectCustomControls(node: unknown, jsonPath: string, out: { jsonPath: string; entry: Record<string, unknown> }[]): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectCustomControls(item, `${jsonPath}[${i}]`, out));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "customControls" && Array.isArray(value)) {
        value.forEach((entry, i) => {
          if (entry && typeof entry === "object" && !Array.isArray(entry)) {
            out.push({ jsonPath: `${jsonPath}.customControls[${i}]`, entry: entry as Record<string, unknown> });
          }
        });
      } else {
        collectCustomControls(value, `${jsonPath}.${key}`, out);
      }
    }
  }
}

export const ValidateManifestTool: RegisteredTool = {
  definition: {
    name: "ValidateManifest",
    description:
      "Validates an existing Store Commerce POS extension manifest.json: JSON well-formedness, " +
      "required fields (name, publisher, version), semver format, minimumPosVersion, components " +
      "structure (extend/create), unknown keys, custom control registrations (required fields and the " +
      "controlName-must-match-HQ-layout rule), and — optionally — that every referenced modulePath and " +
      "htmlPath exists on disk. Returns errors and warnings; never throws on invalid input.",
  },
  schema: ValidateManifestSchema,
  handler: async (input: unknown) => {
    const p = input as ValidateManifestInput;
    const findings: Finding[] = [];

    if (!(await fileExists(p.manifestPath))) {
      return {
        valid: false,
        manifestPath: p.manifestPath,
        findings: [{ severity: "error", path: "", message: `Manifest file not found: ${p.manifestPath}` }],
      };
    }

    const raw = await fs.readFile(p.manifestPath, "utf-8");
    let manifest: Record<string, unknown>;
    try {
      manifest = JSON.parse(raw) as Record<string, unknown>;
    } catch (err) {
      return {
        valid: false,
        manifestPath: p.manifestPath,
        findings: [{
          severity: "error",
          path: "",
          message: `Manifest is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
        }],
      };
    }

    // ── Required fields ──────────────────────────────────────────────────
    for (const field of ["name", "publisher", "version"] as const) {
      const value = manifest[field];
      if (typeof value !== "string" || value.length === 0) {
        findings.push({ severity: "error", path: field, message: `Required field "${field}" is missing or empty.` });
      }
    }

    const name = manifest["name"];
    if (typeof name === "string" && !/^[A-Za-z][A-Za-z0-9._-]*$/.test(name)) {
      findings.push({
        severity: "error",
        path: "name",
        message: `Extension name "${name}" contains invalid characters. Use letters, digits, '.', '_' or '-'.`,
      });
    }

    const version = manifest["version"];
    if (typeof version === "string" && !SEMVER_RE.test(version)) {
      findings.push({ severity: "error", path: "version", message: `"${version}" is not a valid version (expected e.g. 1.0.0).` });
    }

    const minPos = manifest["minimumPosVersion"];
    if (minPos === undefined) {
      findings.push({
        severity: "warning",
        path: "minimumPosVersion",
        message: "minimumPosVersion is not set — the extension will load on any POS version, including unsupported ones.",
      });
    } else if (typeof minPos !== "string" || !SEMVER_RE.test(minPos)) {
      findings.push({ severity: "error", path: "minimumPosVersion", message: `"${String(minPos)}" is not a valid POS version (expected e.g. 9.29.0.0).` });
    }

    // ── Unknown top-level keys ───────────────────────────────────────────
    for (const key of Object.keys(manifest)) {
      if (!KNOWN_TOP_LEVEL.has(key)) {
        findings.push({ severity: "warning", path: key, message: `Unknown top-level key "${key}" — POS ignores unrecognized keys.` });
      }
    }

    // ── components structure ─────────────────────────────────────────────
    const components = manifest["components"];
    if (components === undefined) {
      findings.push({ severity: "warning", path: "components", message: "Manifest has no components — the extension contributes nothing to POS." });
    } else if (typeof components !== "object" || components === null || Array.isArray(components)) {
      findings.push({ severity: "error", path: "components", message: "components must be an object with optional extend/create sections." });
    } else {
      const comp = components as Record<string, unknown>;
      for (const [section, knownKeys] of [["extend", KNOWN_EXTEND_KEYS], ["create", KNOWN_CREATE_KEYS]] as const) {
        const sectionValue = comp[section];
        if (sectionValue === undefined) continue;
        if (typeof sectionValue !== "object" || sectionValue === null || Array.isArray(sectionValue)) {
          findings.push({ severity: "error", path: `components.${section}`, message: `components.${section} must be an object.` });
          continue;
        }
        for (const key of Object.keys(sectionValue)) {
          if (!knownKeys.has(key)) {
            findings.push({
              severity: "warning",
              path: `components.${section}.${key}`,
              message: `Unknown key "${key}" in components.${section}.`,
            });
          }
        }
      }
      for (const key of Object.keys(comp)) {
        if (key !== "extend" && key !== "create") {
          findings.push({ severity: "warning", path: `components.${key}`, message: `Unknown components section "${key}" (expected extend or create).` });
        }
      }
    }

    // ── modulePath existence ─────────────────────────────────────────────
    const modulePaths: { jsonPath: string; modulePath: string }[] = [];
    collectModulePaths(manifest["components"], "components", modulePaths);

    if (p.checkModulePaths) {
      const manifestDir = path.dirname(p.manifestPath);
      for (const { jsonPath, modulePath } of modulePaths) {
        const base = path.join(manifestDir, modulePath);
        const exists = (await fileExists(`${base}.ts`)) || (await fileExists(`${base}.js`)) || (await fileExists(base));
        if (!exists) {
          findings.push({
            severity: "error",
            path: jsonPath,
            message: `modulePath "${modulePath}" does not resolve to a .ts or .js file relative to the manifest.`,
          });
        }
      }
    }

    // ── custom control registrations ────────────────────────────────────
    const customControls: { jsonPath: string; entry: Record<string, unknown> }[] = [];
    collectCustomControls(manifest["components"], "components", customControls);

    const manifestDir = path.dirname(p.manifestPath);
    const controlNames: string[] = [];
    for (const { jsonPath, entry } of customControls) {
      for (const field of CUSTOM_CONTROL_REQUIRED_FIELDS) {
        const value = entry[field];
        if (typeof value !== "string" || value.length === 0) {
          findings.push({
            severity: "error",
            path: `${jsonPath}.${field}`,
            message: `Custom control is missing required field "${field}" (POS won't register the control without it).`,
          });
        }
      }

      const htmlPath = entry["htmlPath"];
      if (typeof htmlPath === "string" && htmlPath.length > 0) {
        if (!htmlPath.toLowerCase().endsWith(".html")) {
          findings.push({
            severity: "error",
            path: `${jsonPath}.htmlPath`,
            message: `htmlPath "${htmlPath}" must point to a .html file.`,
          });
        } else if (p.checkModulePaths && !(await fileExists(path.join(manifestDir, htmlPath)))) {
          findings.push({
            severity: "error",
            path: `${jsonPath}.htmlPath`,
            message: `htmlPath "${htmlPath}" does not resolve to a file relative to the manifest.`,
          });
        }
      }

      const controlName = entry["controlName"];
      if (typeof controlName === "string" && controlName.length > 0) {
        controlNames.push(controlName);
      }
    }

    // The "Control name" configured in the HQ Screen Layout Designer must match controlName
    // exactly, or the POS logs "Control is not configured" and the control never renders.
    if (controlNames.length > 0) {
      findings.push({
        severity: "warning",
        path: "components.*.views.*.controlsConfig.customControls",
        message:
          `Custom control(s) [${controlNames.join(", ")}] must be placed in the HQ Screen Layout Designer ` +
          `with a "Control name" that matches the controlName exactly (case-sensitive), along with the ` +
          `matching publisher and package name. A mismatch logs "Control is not configured" at runtime.`,
      });
    }

    const errors = findings.filter((f) => f.severity === "error");
    return {
      valid: errors.length === 0,
      manifestPath: p.manifestPath,
      errorCount: errors.length,
      warningCount: findings.length - errors.length,
      modulePathsChecked: p.checkModulePaths ? modulePaths.length : 0,
      customControlsChecked: customControls.length,
      findings,
    };
  },
};
