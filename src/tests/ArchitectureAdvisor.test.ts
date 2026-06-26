/**
 * Tests for ArchitectureAdvisor — the deterministic D365 Commerce
 * architecture planner that maps scenarios to layers and patterns.
 */

import { describe, it, expect } from "vitest";
import { ArchitectureAdvisor } from "../core/ArchitectureAdvisor.js";

const advisor = new ArchitectureAdvisor();

describe("ArchitectureAdvisor", () => {

  // ── Area detection ─────────────────────────────────────────────────────────

  describe("area detection", () => {
    it("detects POS+CRT for a trigger scenario", () => {
      const plan = advisor.analyse("add a pre-trigger to validate the cashier before logon");
      expect(plan.detectedAreas).toContain("POS");
      expect(plan.detectedAreas).toContain("CRT");
    });

    it("always includes CRT when POS is detected", () => {
      const plan = advisor.analyse("custom button on the POS screen");
      expect(plan.detectedAreas).toContain("POS");
      expect(plan.detectedAreas).toContain("CRT");
    });

    it("detects HardwareStation for fiscal printer scenario", () => {
      const plan = advisor.analyse("fiscal printer integration for receipt printing");
      expect(plan.detectedAreas).toContain("HardwareStation");
    });

    it("detects RetailServer for API/ecommerce scenario", () => {
      const plan = advisor.analyse("expose a custom retail server api endpoint for product lookup");
      expect(plan.detectedAreas).toContain("RetailServer");
    });

    it("respects explicit requestedAreas override", () => {
      const plan = advisor.analyse("some generic task", ["RetailServer", "CRT"]);
      expect(plan.detectedAreas).toEqual(["RetailServer", "CRT"]);
      expect(plan.detectedAreas).not.toContain("POS");
    });
  });

  // ── Artifact selection ─────────────────────────────────────────────────────

  describe("artifact selection", () => {
    it("recommends PreTrigger for 'before logon' scenario", () => {
      const plan = advisor.analyse("add logic before logon to check pin");
      const artifacts = plan.layers.flatMap(l => l.artifacts);
      expect(artifacts.some(a => a.patternName === "PreTrigger")).toBe(true);
    });

    it("recommends PostTrigger for 'after transaction' scenario", () => {
      const plan = advisor.analyse("run code after transaction is complete to notify backend");
      const artifacts = plan.layers.flatMap(l => l.artifacts);
      expect(artifacts.some(a => a.patternName === "PostTrigger")).toBe(true);
    });

    it("recommends ShowDialog for pin/input scenario", () => {
      const plan = advisor.analyse("show a dialog to capture pin number input from cashier");
      const artifacts = plan.layers.flatMap(l => l.artifacts);
      expect(artifacts.some(a => a.patternName === "ShowDialog")).toBe(true);
    });

    it("recommends CustomOperation for button/operation scenario", () => {
      const plan = advisor.analyse("add a custom button operation to open price override");
      const artifacts = plan.layers.flatMap(l => l.artifacts);
      expect(artifacts.some(a => a.patternName === "CustomOperation")).toBe(true);
    });

    it("recommends SingleAsyncRequestHandler for CRT area", () => {
      const plan = advisor.analyse("add crt handler to calculate custom discount", ["CRT"]);
      const artifacts = plan.layers.flatMap(l => l.artifacts);
      expect(artifacts.some(a => a.patternName === "SingleAsyncRequestHandler")).toBe(true);
    });

    it("every detected area has at least one artifact", () => {
      const plan = advisor.analyse("fiscal printer with crt and retail server api", ["POS", "CRT", "RetailServer", "HardwareStation"]);
      for (const area of plan.detectedAreas) {
        const layer = plan.layers.find(l => l.area === area);
        expect(layer).toBeDefined();
        expect(layer!.artifacts.length).toBeGreaterThan(0);
      }
    });
  });

  // ── Data flow ──────────────────────────────────────────────────────────────

  describe("data flow", () => {
    it("generates at least 2 flow steps for POS+CRT", () => {
      const plan = advisor.analyse("pos trigger calling crt", ["POS", "CRT"]);
      expect(plan.dataFlow.length).toBeGreaterThanOrEqual(2);
    });

    it("generates 7 steps for full E2E (all areas)", () => {
      const plan = advisor.analyse("full e2e", ["POS", "CRT", "RetailServer", "HardwareStation"]);
      expect(plan.dataFlow.length).toBe(7);
    });

    it("flow steps have from, to, mechanism, description", () => {
      const plan = advisor.analyse("any scenario");
      for (const step of plan.dataFlow) {
        expect(step.from).toBeTruthy();
        expect(step.to).toBeTruthy();
        expect(step.mechanism).toBeTruthy();
        expect(step.description).toBeTruthy();
      }
    });
  });

  // ── Risks ──────────────────────────────────────────────────────────────────

  describe("risks", () => {
    it("always includes a version-alignment risk", () => {
      const plan = advisor.analyse("any scenario");
      const generalRisks = plan.risks.filter(r => r.area === "General");
      expect(generalRisks.length).toBeGreaterThan(0);
    });

    it("includes offline-mode risk when POS is involved", () => {
      const plan = advisor.analyse("pos trigger", ["POS", "CRT"]);
      expect(plan.risks.some(r => r.risk.toLowerCase().includes("offline"))).toBe(true);
    });

    it("includes fiscal compliance risk for fiscal scenarios", () => {
      const plan = advisor.analyse("fiscal printer integration", ["POS", "CRT", "HardwareStation"]);
      expect(plan.risks.some(r => r.risk.toLowerCase().includes("fiscal"))).toBe(true);
    });

    it("HIGH risks have severity = HIGH", () => {
      const plan = advisor.analyse("pos operation", ["POS", "CRT"]);
      const highRisks = plan.risks.filter(r => r.severity === "HIGH");
      expect(highRisks.length).toBeGreaterThan(0);
      highRisks.forEach(r => expect(r.mitigation).toBeTruthy());
    });
  });

  // ── Plan structure ─────────────────────────────────────────────────────────

  describe("plan structure", () => {
    it("includes officialReferences with valid https URLs", () => {
      const plan = advisor.analyse("add pos trigger");
      expect(plan.officialReferences.length).toBeGreaterThan(0);
      for (const ref of plan.officialReferences) {
        expect(ref.url).toMatch(/^https:\/\//);
        expect(ref.title).toBeTruthy();
      }
    });

    it("deploymentNotes is non-empty array", () => {
      const plan = advisor.analyse("any scenario");
      expect(Array.isArray(plan.deploymentNotes)).toBe(true);
      expect(plan.deploymentNotes.length).toBeGreaterThan(0);
    });

    it("testing includes a recommendation per detected area", () => {
      const plan = advisor.analyse("full solution", ["POS", "CRT", "RetailServer"]);
      const areas = plan.testing.map(t => t.area);
      expect(areas).toContain("POS");
      expect(areas).toContain("CRT");
      expect(areas).toContain("RetailServer");
    });
  });
});
