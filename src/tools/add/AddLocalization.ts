import { z } from "zod";
import type { RegisteredTool } from "../../core/ToolRegistry.js";
import path from "path";

export const AddLocalizationSchema = z.object({
  workspacePath: z.string().min(1),
  resourceName: z.string().min(1).describe("Resource file name e.g. 'resources'"),
  locale: z.string().default("en-US").describe("Locale code e.g. en-US, es-MX"),
  keys: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  outputDir: z.string().optional(),
});

export const AddLocalizationTool: RegisteredTool = {
  definition: {
    name: "AddLocalization",
    description: "Generates a Store Commerce POS localization resource file (JSON) for a given locale. Follows the official pattern for POS extension localization.",
  },
  schema: AddLocalizationSchema,
  handler: async (input: unknown) => {
    const p = input as z.infer<typeof AddLocalizationSchema>;
    const locale = p.locale ?? "en-US";
    const keys = p.keys ?? [{ key: "extensionTitle", value: "My Extension" }];

    const resourceObj: Record<string, string> = {};
    for (const entry of keys) {
      resourceObj[entry.key] = entry.value;
    }

    const content = JSON.stringify(resourceObj, null, 2);
    const fileName = `${p.resourceName}.${locale}.json`;
    const outputPath = p.outputDir
      ? path.join(p.workspacePath, p.outputDir, fileName)
      : path.join(p.workspacePath, "Localization", fileName);

    return {
      success: true,
      files: [
        {
          relativePath: outputPath,
          content,
          language: "json",
        },
      ],
      notes: [
        `Resource file: ${fileName}`,
        `Reference in your POS view or control via this.context.resources.getString("${keys[0]?.key ?? "key"}").`,
        `Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/pos-localization`,
      ],
    };
  },
};
