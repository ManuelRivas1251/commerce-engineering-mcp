import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isPathAllowed, assertPathAllowed, getAllowedRoots } from "../core/PathGuard.js";

const ENV_KEY = "COMMERCE_ALLOWED_ROOTS";
let savedEnv: string | undefined;

beforeEach(() => {
  savedEnv = process.env[ENV_KEY];
});

afterEach(() => {
  if (savedEnv === undefined) delete process.env[ENV_KEY];
  else process.env[ENV_KEY] = savedEnv;
});

describe("PathGuard", () => {
  it("allows everything when the variable is unset", () => {
    delete process.env[ENV_KEY];
    expect(getAllowedRoots()).toEqual([]);
    expect(isPathAllowed("C:\\Windows\\System32")).toBe(true);
  });

  it("allows paths inside a configured root", () => {
    process.env[ENV_KEY] = "C:\\AMSourceControl";
    expect(isPathAllowed("C:\\AMSourceControl\\Projects\\MyExt")).toBe(true);
    expect(isPathAllowed("C:\\AMSourceControl")).toBe(true);
  });

  it("rejects paths outside all roots", () => {
    process.env[ENV_KEY] = "C:\\AMSourceControl";
    expect(isPathAllowed("C:\\Windows\\System32")).toBe(false);
    expect(() => assertPathAllowed("C:\\Windows\\System32", "workspacePath")).toThrow(/Access denied/);
  });

  it("does not treat a sibling with a shared prefix as inside the root", () => {
    process.env[ENV_KEY] = "C:\\AMSourceControl";
    expect(isPathAllowed("C:\\AMSourceControlEvil\\x")).toBe(false);
  });

  it("rejects .. traversal that escapes the root", () => {
    process.env[ENV_KEY] = "C:\\AMSourceControl";
    expect(isPathAllowed("C:\\AMSourceControl\\..\\Windows")).toBe(false);
  });

  it("supports multiple roots separated by semicolons", () => {
    process.env[ENV_KEY] = "C:\\AMSourceControl;C:\\Projects";
    expect(isPathAllowed("C:\\Projects\\App")).toBe(true);
    expect(isPathAllowed("C:\\Other\\App")).toBe(false);
  });

  it("is case-insensitive on Windows drive/dir names", () => {
    process.env[ENV_KEY] = "C:\\AMSourceControl";
    if (process.platform === "win32") {
      expect(isPathAllowed("c:\\amsourcecontrol\\sub")).toBe(true);
    }
  });
});
