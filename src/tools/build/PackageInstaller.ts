import path from "path";
import fg from "fast-glob";
import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { runCommand, extractDiagnostics } from "../../core/CommandRunner.js";
import { assertPathAllowed } from "../../core/PathGuard.js";
import { resolveBuildTarget } from "./BuildExtension.js";

export const PackageInstallerSchema = z.object({
  installerProjectPath: z
    .string()
    .min(1)
    .describe(
      "Absolute path to an installer .csproj (e.g. Contoso.StoreCommerce.Installer.csproj, " +
        "Contoso.ScaleUnit.Installer.csproj, Contoso.HardwareStation.Installer.csproj) or its directory"
    ),
  configuration: z.enum(["Debug", "Release"]).default("Release"),
  timeoutSeconds: z.number().int().min(30).max(1800).default(900),
});

type PackageInstallerInput = z.infer<typeof PackageInstallerSchema>;

export const PackageInstallerTool: RegisteredTool = {
  definition: {
    name: "PackageInstaller",
    description:
      "Builds a Store Commerce / Scale Unit / Hardware Station installer project with `dotnet build` " +
      "(Commerce SDK installer projects produce their self-contained installer executable or package " +
      "on build) and locates the produced artifacts (.exe, .zip, .scpkg) under bin/<Configuration>. " +
      "Returns build diagnostics and the artifact paths. Requires the .NET SDK on PATH.",
  },
  schema: PackageInstallerSchema,
  handler: async (input: unknown) => {
    const p = input as PackageInstallerInput;
    assertPathAllowed(p.installerProjectPath, "installerProjectPath");

    const resolved = await resolveBuildTarget(p.installerProjectPath);
    if (!resolved) {
      return {
        success: false,
        message: `Installer project path does not exist: ${p.installerProjectPath}`,
      };
    }

    const startedAt = Date.now();
    const result = await runCommand(
      "dotnet",
      ["build", resolved.target, "-c", p.configuration, "-v", "minimal", "-nologo"],
      { cwd: resolved.cwd, timeoutMs: p.timeoutSeconds * 1000 }
    );

    if (result.spawnError) {
      return { success: false, message: result.spawnError };
    }

    const { errors, warnings } = extractDiagnostics(result.output);

    // Locate artifacts produced by this build (mtime >= build start).
    const projectDir = resolved.target.endsWith(".csproj")
      ? path.dirname(resolved.target)
      : resolved.target;
    const artifacts = result.success
      ? (
          await fg(["bin/**/*.{exe,zip,scpkg}"], {
            cwd: projectDir,
            absolute: true,
            stats: true,
            suppressErrors: true,
          })
        )
          .filter((e) => (e.stats?.mtimeMs ?? 0) >= startedAt - 1000)
          .map((e) => e.path)
      : [];

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
      artifacts,
      outputTail: result.output.slice(-4_000),
      hint: result.success
        ? artifacts.length === 0
          ? "Build succeeded but no new .exe/.zip/.scpkg artifact was detected under bin/. Installer projects only produce artifacts when their references changed — try a Rebuild or check bin/<Configuration> manually."
          : undefined
        : "Full diagnostics are in `errors`. Installer projects target net472/net48 — ensure the .NET Framework targeting packs are installed.",
    };
  },
};
