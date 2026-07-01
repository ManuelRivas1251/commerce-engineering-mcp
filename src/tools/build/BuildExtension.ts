import path from "path";
import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { runCommand, extractDiagnostics } from "../../core/CommandRunner.js";
import { assertPathAllowed, directoryExists, fileExists } from "../../core/PathGuard.js";

export const BuildExtensionSchema = z.object({
  projectPath: z
    .string()
    .min(1)
    .describe("Absolute path to a .csproj, .sln, or a directory containing one"),
  configuration: z.enum(["Debug", "Release"]).default("Debug"),
  noRestore: z
    .boolean()
    .default(false)
    .describe("Skip the implicit NuGet restore (faster when packages are already restored)"),
  timeoutSeconds: z.number().int().min(30).max(1800).default(600),
});

type BuildExtensionInput = z.infer<typeof BuildExtensionSchema>;

export async function resolveBuildTarget(projectPath: string): Promise<{ target: string; cwd: string } | null> {
  if (await fileExists(projectPath)) {
    return { target: projectPath, cwd: path.dirname(projectPath) };
  }
  if (await directoryExists(projectPath)) {
    // `dotnet build <dir>` picks up the single project/solution in the directory.
    return { target: projectPath, cwd: projectPath };
  }
  return null;
}

export const BuildExtensionTool: RegisteredTool = {
  definition: {
    name: "BuildExtension",
    description:
      "Compiles a Commerce extension project or solution with `dotnet build` (Commerce SDK projects " +
      "are MSBuild-based). Accepts a .csproj, .sln, or directory. Captures MSBuild output, extracts " +
      "error/warning diagnostics (CS/MSB/NU codes), and returns them as structured JSON. Build " +
      "failures are reported cleanly — they never crash the server. Requires the .NET SDK on PATH.",
  },
  schema: BuildExtensionSchema,
  handler: async (input: unknown) => {
    const p = input as BuildExtensionInput;
    assertPathAllowed(p.projectPath, "projectPath");

    const resolved = await resolveBuildTarget(p.projectPath);
    if (!resolved) {
      return {
        success: false,
        message: `Project path does not exist: ${p.projectPath}`,
      };
    }

    const args = ["build", resolved.target, "-c", p.configuration, "-v", "minimal", "-nologo"];
    if (p.noRestore) args.push("--no-restore");

    const result = await runCommand("dotnet", args, {
      cwd: resolved.cwd,
      timeoutMs: p.timeoutSeconds * 1000,
    });

    if (result.spawnError) {
      return { success: false, message: result.spawnError };
    }

    const { errors, warnings } = extractDiagnostics(result.output);
    return {
      success: result.success,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      durationMs: result.durationMs,
      configuration: p.configuration,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
      outputTail: result.output.slice(-4_000),
      hint: result.success
        ? undefined
        : "Full diagnostics are in `errors`. Common causes: missing NuGet feed auth (nuget.config), wrong CommerceSdkPackagesVersion range, or .NET SDK version mismatch with global.json.",
    };
  },
};
