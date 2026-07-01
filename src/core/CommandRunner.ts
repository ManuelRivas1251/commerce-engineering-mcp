/**
 * CommandRunner — safe execution of local build tooling (dotnet / MSBuild).
 *
 * Design constraints:
 *  - execFile (never shell) so arguments cannot be injected.
 *  - Only whitelisted executables can run.
 *  - Hard timeout and bounded output so a hung or noisy build cannot
 *    stall the MCP server or flood the client.
 *  - Never throws for build failures: a non-zero exit code, a missing
 *    executable, or a timeout all come back as a structured result the
 *    tool can serialize into MCP content.
 */

import { execFile } from "child_process";
import { logger } from "./Logger.js";

const ALLOWED_EXECUTABLES = new Set(["dotnet"]);
const MAX_OUTPUT_CHARS = 30_000;
const MAX_BUFFER_BYTES = 32 * 1024 * 1024;

export interface CommandResult {
  success: boolean;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
  /** Combined stdout+stderr, tail-truncated to MAX_OUTPUT_CHARS. */
  output: string;
  /** Set when the process could not be started at all (e.g. dotnet not installed). */
  spawnError?: string;
}

// MSBuild diagnostics look like: `Path\File.cs(12,5): error CS1002: message`
// or `MSBUILD : error MSB1009: message`.
const DIAGNOSTIC_RE = /:\s(error|warning)\s+([A-Z]+\d+)\s*:/;

export function extractDiagnostics(output: string): { errors: string[]; warnings: string[] } {
  const errors = new Set<string>();
  const warnings = new Set<string>();
  for (const line of output.split(/\r?\n/)) {
    const m = DIAGNOSTIC_RE.exec(line);
    if (!m) continue;
    const trimmed = line.trim();
    if (m[1] === "error") errors.add(trimmed);
    else warnings.add(trimmed);
  }
  return { errors: Array.from(errors), warnings: Array.from(warnings) };
}

function truncateTail(text: string): string {
  if (text.length <= MAX_OUTPUT_CHARS) return text;
  return `[... ${text.length - MAX_OUTPUT_CHARS} chars truncated ...]\n` + text.slice(-MAX_OUTPUT_CHARS);
}

export async function runCommand(
  executable: string,
  args: string[],
  options: { cwd: string; timeoutMs?: number }
): Promise<CommandResult> {
  if (!ALLOWED_EXECUTABLES.has(executable)) {
    return {
      success: false,
      exitCode: null,
      timedOut: false,
      durationMs: 0,
      output: "",
      spawnError: `Executable "${executable}" is not allowed. Allowed: ${Array.from(ALLOWED_EXECUTABLES).join(", ")}`,
    };
  }

  const timeoutMs = Math.min(options.timeoutMs ?? 600_000, 1_800_000);
  const startedAt = Date.now();
  logger.info({ executable, args, cwd: options.cwd }, "Running command");

  return new Promise<CommandResult>((resolve) => {
    execFile(
      executable,
      args,
      {
        cwd: options.cwd,
        timeout: timeoutMs,
        maxBuffer: MAX_BUFFER_BYTES,
        windowsHide: true,
        shell: false,
      },
      (err, stdout, stderr) => {
        const durationMs = Date.now() - startedAt;
        const output = truncateTail([stdout, stderr].filter(Boolean).join("\n"));

        if (err && (err as NodeJS.ErrnoException).code === "ENOENT") {
          resolve({
            success: false,
            exitCode: null,
            timedOut: false,
            durationMs,
            output,
            spawnError: `"${executable}" was not found on PATH. Install the .NET SDK (https://dotnet.microsoft.com/download) and restart the MCP server.`,
          });
          return;
        }

        const timedOut = Boolean(err && (err as { killed?: boolean }).killed);
        const exitCode = err ? ((err as { code?: number | string }).code as number | null) ?? null : 0;

        resolve({
          success: !err,
          exitCode: typeof exitCode === "number" ? exitCode : null,
          timedOut,
          durationMs,
          output,
        });
      }
    );
  });
}
