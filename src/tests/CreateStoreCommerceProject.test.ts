import { describe, it, expect } from "vitest";
import os from "os";
import path from "path";
import { CreateStoreCommerceProjectTool } from "../tools/create/CreateStoreCommerceProject.js";

interface GeneratedFile {
  relativePath: string;
  content: string;
  language: string;
}

interface ScaffoldResult {
  success: boolean;
  files: GeneratedFile[];
  notes: string[];
}

describe("CreateStoreCommerceProject", () => {
  it("generates the DefinePosExtensionPackageTrigger with Name/Publisher matching the manifest", async () => {
    const targetPath = path.join(os.tmpdir(), "scaffold-test");
    const result = (await CreateStoreCommerceProjectTool.handler({
      targetPath,
      packageName: "AcmeRetail",
      publisher: "Acme",
    })) as ScaffoldResult;

    expect(result.success).toBe(true);

    // The trigger file must exist in the CRT project. Without it, Store Commerce
    // never activates the package (GetExtensionPackageDefinitions returns nothing).
    const trigger = result.files.find((f) =>
      f.relativePath.endsWith("Triggers/DefinePosExtensionPackageTrigger.cs")
    );
    expect(trigger).toBeDefined();
    expect(trigger!.content).toContain("GetExtensionPackageDefinitionsRequest");
    expect(trigger!.content).toContain("IRequestTriggerAsync");
    expect(trigger!.content).toContain('Name = "AcmeRetail"');
    expect(trigger!.content).toContain('Publisher = "Acme"');
    expect(trigger!.content).toContain("IsEnabled = true");

    // Name/Publisher must match the generated manifest.json exactly.
    const manifest = result.files.find((f) => f.relativePath.endsWith("POS/manifest.json"));
    expect(manifest).toBeDefined();
    const manifestJson = JSON.parse(manifest!.content) as { name: string; publisher: string };
    expect(manifestJson.name).toBe("AcmeRetail");
    expect(manifestJson.publisher).toBe("Acme");
  });
});
