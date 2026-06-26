/**
 * Tests for D365FOBridge — the HQ/CDX integration guidance engine.
 */

import { describe, it, expect } from "vitest";
import { D365FOBridge } from "../sources/D365FOBridge.js";

const bridge = new D365FOBridge();

describe("D365FOBridge", () => {

  describe("getCDXGuide", () => {
    it("returns HQ-to-channel guide with steps and code snippets", () => {
      const guide = bridge.getCDXGuide("hq-to-channel");
      expect(guide.direction).toBe("HQToChannel");
      expect(guide.steps.length).toBeGreaterThan(3);
      expect(guide.codeSnippets.length).toBeGreaterThan(0);
      expect(guide.docsUrl).toMatch(/^https:\/\//);
    });

    it("hq-to-channel includes SQL snippet with IF NOT EXISTS guard", () => {
      const guide = bridge.getCDXGuide("hq-to-channel");
      const sqlSnippet = guide.codeSnippets.find(s => s.language === "sql");
      expect(sqlSnippet).toBeDefined();
      expect(sqlSnippet!.code).toContain("IF NOT EXISTS");
      expect(sqlSnippet!.code).toContain("ALTER TABLE");
    });

    it("returns channel-to-hq guide with P-job guidance", () => {
      const guide = bridge.getCDXGuide("channel-to-hq");
      expect(guide.direction).toBe("ChannelToHQ");
      expect(guide.steps.some(s => s.toLowerCase().includes("p-job"))).toBe(true);
    });

    it("channel-to-hq includes CRT code snippet", () => {
      const guide = bridge.getCDXGuide("channel-to-hq");
      const csSnippet = guide.codeSnippets.find(s => s.language === "csharp");
      expect(csSnippet).toBeDefined();
      expect(csSnippet!.code).toContain("context.ExecuteAsync");
    });

    it("all guides have risks array", () => {
      for (const topic of ["hq-to-channel", "channel-to-hq"] as const) {
        const guide = bridge.getCDXGuide(topic);
        expect(Array.isArray(guide.risks)).toBe(true);
        expect(guide.risks.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getHQExtensionGuide", () => {
    const areas = ["Table", "CDXJob", "SyncSubjob", "RetailChannelTable", "Form"] as const;

    for (const area of areas) {
      it(`returns guide for area "${area}"`, () => {
        const guide = bridge.getHQExtensionGuide(area);
        expect(guide.area).toBe(area);
        expect(guide.title).toBeTruthy();
        expect(guide.steps.length).toBeGreaterThan(0);
        expect(guide.docsUrl).toMatch(/^https:\/\//);
      });
    }

    it("Table guide mentions AOT and table extension", () => {
      const guide = bridge.getHQExtensionGuide("Table");
      expect(guide.steps.some(s => s.toLowerCase().includes("extension"))).toBe(true);
    });

    it("RetailChannelTable guide mentions GetChannelConfigurationServiceRequest", () => {
      const guide = bridge.getHQExtensionGuide("RetailChannelTable");
      expect(guide.steps.some(s => s.includes("GetChannelConfigurationServiceRequest"))).toBe(true);
    });
  });

  describe("getChannelDbGuide", () => {
    it("returns channel DB guide with idempotent SQL", () => {
      const guide = bridge.getChannelDbGuide();
      expect(guide.title).toContain("Channel Database");
      const sqlSnippet = guide.codeSnippets.find(s => s.language === "sql");
      expect(sqlSnippet).toBeDefined();
      expect(sqlSnippet!.code).toContain("IF NOT EXISTS");
    });

    it("includes CRT snippet for reading extension properties", () => {
      const guide = bridge.getChannelDbGuide();
      const csSnippet = guide.codeSnippets.find(s => s.language === "csharp");
      expect(csSnippet).toBeDefined();
      expect(csSnippet!.code).toContain("ExtensionProperties");
    });
  });

  describe("getIntegrationMap", () => {
    it("maps customer/loyalty scenario to CDX job 1010", () => {
      const map = bridge.getIntegrationMap("sync customer loyalty points from HQ");
      expect(map.cdxJobs.some(j => j.includes("1010"))).toBe(true);
      expect(map.hqSide.some(h => h.includes("CustTable") || h.includes("LoyaltyCard"))).toBe(true);
      expect(map.crtSide.some(c => c.includes("GetCustomersServiceRequest"))).toBe(true);
    });

    it("maps product scenario to CDX job 1040", () => {
      const map = bridge.getIntegrationMap("sync product catalog information");
      expect(map.cdxJobs.some(j => j.includes("1040"))).toBe(true);
    });

    it("maps transaction/upload to P-job", () => {
      const map = bridge.getIntegrationMap("upload custom transaction data from POS to HQ");
      expect(map.cdxJobs.some(j => j.toLowerCase().includes("p-job"))).toBe(true);
      expect(map.channelDbSide.length).toBeGreaterThan(0);
    });

    it("always returns docsUrls array with valid URLs", () => {
      const map = bridge.getIntegrationMap("any scenario");
      expect(map.docsUrls.length).toBeGreaterThan(0);
      map.docsUrls.forEach(url => expect(url).toMatch(/^https:\/\//));
    });

    it("returns default guidance for unknown scenario", () => {
      const map = bridge.getIntegrationMap("completely unrelated topic xyz");
      expect(map.hqSide.length).toBeGreaterThan(0);
      expect(map.channelDbSide.length).toBeGreaterThan(0);
    });
  });

  describe("listAllTopics", () => {
    it("returns 8 topics", () => {
      const topics = bridge.listAllTopics();
      expect(topics).toHaveLength(8);
    });

    it("all topics have topic and description fields", () => {
      bridge.listAllTopics().forEach(t => {
        expect(t.topic).toBeTruthy();
        expect(t.description).toBeTruthy();
      });
    });
  });
});
