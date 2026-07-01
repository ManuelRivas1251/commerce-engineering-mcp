import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import { VersionResolver } from "../../core/VersionResolver.js";
import { directoryExists } from "../../core/PathGuard.js";

export const DetectCommerceVersionSchema = z.object({
  workspacePath: z.string().min(1).describe("Absolute path to the workspace root"),
});

export type DetectCommerceVersionInput = z.infer<typeof DetectCommerceVersionSchema>;

const resolver = new VersionResolver();

export const DetectCommerceVersionTool: RegisteredTool = {
  definition: {
    name: "DetectCommerceVersion",
    description:
      "Detects the Dynamics 365 Commerce version used in the workspace by inspecting " +
      "CustomizationPackage.props, package.json, .csproj files, CommerceRuntime.config, " +
      "manifest.json, and lock files. Never assumes a version — reports UNKNOWN if not determinable " +
      "and the user must provide it.",
  },
  schema: DetectCommerceVersionSchema,
  handler: async (input: unknown) => {
    const { workspacePath } = input as DetectCommerceVersionInput;

    if (!(await directoryExists(workspacePath))) {
      return {
        detected: false,
        message: `Workspace path does not exist or is not a directory: ${workspacePath}. Verify the path and try again.`,
        version: null,
      };
    }

    const version = await resolver.resolve(workspacePath);

    if (version.confidence === "UNKNOWN") {
      return {
        detected: false,
        message:
          "Could not determine the Commerce version from the workspace. " +
          "Please provide the version explicitly (e.g. '10.0.46'). " +
          "Checked: CustomizationPackage.props, package.json, *.csproj, " +
          "CommerceRuntime.config, manifest.json, lock files.",
        version: null,
      };
    }

    return {
      detected: true,
      version,
      githubBranch: version.branch,
      message: `Detected Commerce ${version.version} (confidence: ${version.confidence}) from ${version.detectedFrom}.`,
    };
  },
};
