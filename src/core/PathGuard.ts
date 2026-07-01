/**
 * PathGuard — restricts which filesystem paths tools may read, index, or build.
 *
 * Configured via the COMMERCE_ALLOWED_ROOTS environment variable: a
 * semicolon-separated list of directory roots, e.g.
 *   COMMERCE_ALLOWED_ROOTS=C:\AMSourceControl;C:\Projects
 *
 * When the variable is unset or empty the guard is disabled (any path is
 * allowed) so existing setups keep working. When set, every path-bearing
 * tool input (workspacePath, targetPath, projectPath, manifestPath) must
 * resolve inside one of the roots or the tool call is rejected with a
 * clean MCP error — the server never crashes on a rejected path.
 */

import { promises as fs } from "fs";
import path from "path";

const IS_WINDOWS = process.platform === "win32";

function normalizeForCompare(p: string): string {
  const resolved = path.resolve(p);
  return IS_WINDOWS ? resolved.toLowerCase() : resolved;
}

export function getAllowedRoots(): string[] {
  const raw = process.env["COMMERCE_ALLOWED_ROOTS"];
  if (!raw) return [];
  return raw
    .split(";")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
}

export function isPathAllowed(candidate: string): boolean {
  const roots = getAllowedRoots();
  if (roots.length === 0) return true; // guard disabled

  const target = normalizeForCompare(candidate);
  return roots.some((root) => {
    const normalizedRoot = normalizeForCompare(root);
    return (
      target === normalizedRoot ||
      target.startsWith(normalizedRoot + path.sep)
    );
  });
}

export function assertPathAllowed(candidate: string, label = "path"): void {
  if (!isPathAllowed(candidate)) {
    throw new Error(
      `Access denied: ${label} "${candidate}" is outside the allowed roots. ` +
        `Allowed roots (COMMERCE_ALLOWED_ROOTS): ${getAllowedRoots().join("; ")}`
    );
  }
}

export async function directoryExists(candidate: string): Promise<boolean> {
  try {
    const stat = await fs.stat(candidate);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function fileExists(candidate: string): Promise<boolean> {
  try {
    const stat = await fs.stat(candidate);
    return stat.isFile();
  } catch {
    return false;
  }
}
