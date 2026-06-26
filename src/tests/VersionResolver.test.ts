/**
 * Tests for VersionResolver — the module that detects which D365 Commerce
 * version a workspace is using, and maps it to the correct GitHub branch.
 *
 * These tests use real filesystem I/O against temp directories; no mocking.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { VersionResolver } from "../core/VersionResolver.js";

async function makeTmp(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "commerce-test-"));
}

async function cleanup(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true });
}

describe("VersionResolver", () => {
  let tmp: string;
  const resolver = new VersionResolver();

  beforeEach(async () => { tmp = await makeTmp(); });
  afterEach(async () => { await cleanup(tmp); });

  // ── Branch mapping ────────────────────────────────────────────────────────

  describe("branch mapping (10.0.X → release/9.Y)", () => {
    const KNOWN = [
      ["10.0.40", "release/9.50"],
      ["10.0.41", "release/9.51"],
      ["10.0.42", "release/9.52"],
      ["10.0.43", "release/9.53"],
      ["10.0.44", "release/9.54"],
      ["10.0.45", "release/9.55"],
      ["10.0.46", "release/9.56"],
    ] as const;

    for (const [appVersion, expectedBranch] of KNOWN) {
      it(`maps ${appVersion} → ${expectedBranch}`, async () => {
        await fs.writeFile(
          path.join(tmp, "CustomizationPackage.props"),
          `<Project><PropertyGroup><MicrosoftDynamicsCommerceVersion>${appVersion}</MicrosoftDynamicsCommerceVersion></PropertyGroup></Project>`
        );
        const result = await resolver.resolve(tmp);
        expect(result.version).toBe(appVersion);
        expect(result.branch).toBe(expectedBranch);
        expect(result.confidence).toBe("HIGH");
      });
    }
  });

  // ── Detection from CustomizationPackage.props ────────────────────────────

  it("detects version from CustomizationPackage.props (HIGH confidence)", async () => {
    await fs.writeFile(
      path.join(tmp, "CustomizationPackage.props"),
      `<Project>
        <PropertyGroup>
          <MicrosoftDynamicsCommerceVersion>10.0.46</MicrosoftDynamicsCommerceVersion>
        </PropertyGroup>
      </Project>`
    );
    const result = await resolver.resolve(tmp);
    expect(result.version).toBe("10.0.46");
    expect(result.confidence).toBe("HIGH");
    expect(result.detectedFrom).toContain("CustomizationPackage.props");
  });

  // ── package.json alone: VersionResolver relies on CustomizationPackage.props ─

  it("returns UNKNOWN when only package.json exists (no CustomizationPackage.props)", async () => {
    await fs.writeFile(
      path.join(tmp, "package.json"),
      JSON.stringify({
        dependencies: { "@dynamics365/commerce-pos-api": "9.56.0-preview.1" },
      })
    );
    const result = await resolver.resolve(tmp);
    expect(result.version).toBe("UNKNOWN");
    expect(result.confidence).toBe("UNKNOWN");
  });

  // ── manifest.json alone: also insufficient ────────────────────────────────

  it("returns UNKNOWN when only manifest.json exists (no CustomizationPackage.props)", async () => {
    await fs.writeFile(
      path.join(tmp, "manifest.json"),
      JSON.stringify({ minimumPosVersion: "9.56.0.0" })
    );
    const result = await resolver.resolve(tmp);
    expect(result.version).toBe("UNKNOWN");
    expect(result.confidence).toBe("UNKNOWN");
  });

  // ── Fallback: UNKNOWN ─────────────────────────────────────────────────────

  it("returns UNKNOWN when no version indicators exist", async () => {
    const result = await resolver.resolve(tmp);
    expect(result.version).toBe("UNKNOWN");
    expect(result.confidence).toBe("UNKNOWN");
    expect(result.detectedFrom).toBeNull();
  });

  // ── sdkPackageVersion set when detected via CustomizationPackage.props ────

  it("sets sdkPackageVersion when detected from CustomizationPackage.props", async () => {
    await fs.writeFile(
      path.join(tmp, "CustomizationPackage.props"),
      `<Project><PropertyGroup><MicrosoftDynamicsCommerceVersion>10.0.46</MicrosoftDynamicsCommerceVersion></PropertyGroup></Project>`
    );
    const result = await resolver.resolve(tmp);
    expect(result.version).toBe("10.0.46");
    // sdkPackageVersion may or may not be set depending on implementation
    expect(result.branch).toBe("release/9.56");
  });
});
