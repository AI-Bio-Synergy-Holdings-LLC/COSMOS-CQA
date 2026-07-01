import { expect, test } from "@playwright/test";

import { openWorkbench, readStreamText } from "./fixtures/workbench.mjs";

test("prepares reviewer handoff as a local packet without network submission", async ({ page }) => {
  await openWorkbench(page);
  await installNetworkRecorder(page);
  await submitPinnedObservation(page, "faint vertical band in top center zone for reviewer handoff packet");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportReviewIntake").click();
  const download = await downloadPromise;
  const contents = await readStreamText(await download.createReadStream());
  const packet = JSON.parse(contents);

  expect(download.suggestedFilename()).toBe("cosmos-cqa-review-intake.json");
  expect(packet).toMatchObject({
    packet_type: "review-intake",
    authenticated_access: false,
    network_submission: false,
    transport_state: "local-export",
  });
  expect(packet.reviewer_identity).toMatchObject({
    role: "public-demo-reviewer",
    auth_state: "unauthenticated-local",
  });
  expect(packet.reviewer_identity.claim_boundary).toContain("metadata only");
  expect(packet.contributor_consent.contains_personal_data).toBe(false);
  expect(packet.assignment.observation_ids).toHaveLength(1);
  expect(packet.evidence_bundle.session.observations).toHaveLength(1);
  expect(packet.evidence_bundle.session.observation_review_events).toHaveLength(1);
  expect(await page.locator("#reviewerHandoffStatus").textContent()).toContain("No network submission");
  expect(await page.evaluate(() => window.__COSMOS_NETWORK_AFTER_RECORDER)).toEqual([]);
});

test("imports review return packets for local replay without authenticated reviewer claims", async ({ page }) => {
  await openWorkbench(page);
  await submitPinnedObservation(page, "top center stripe note for review return replay");

  const packetText = await page.evaluate(async () => {
    const packet = await window.COSMOS_CQA_APP.buildReviewReturnEnvelope({
      generatedAt: "2026-06-30T15:00:00.000Z",
    });
    return JSON.stringify(packet);
  });

  await page.reload();
  await page.waitForFunction(() => Boolean(window.COSMOS_CQA_APP));
  await expect(page.locator("#observationReviewStatus")).toContainText("No submitted observations yet");

  const result = await page.evaluate((text) => window.COSMOS_CQA_APP.importReviewPacketText(text, { source: "browser-test" }), packetText);
  expect(result).toMatchObject({ ok: true, type: "review-return" });
  await expect(page.locator("#reviewerHandoffStatus")).toContainText("Imported review return packet");
  await expect(page.locator("#reviewerHandoffStatus")).toContainText("metadata-only");
  await expect(page.locator("#observationReviewStatus")).toContainText("1 submitted observation");
  await expect(page.locator("#observationReviewLedger")).toContainText("0: create");

  const stateCounts = await page.evaluate(() => ({
    observations: window.COSMOS_CQA_APP.state.observations.length,
    reviewEvents: window.COSMOS_CQA_APP.state.observationReviewEvents.length,
  }));
  expect(stateCounts).toEqual({ observations: 1, reviewEvents: 1 });
});

async function submitPinnedObservation(page, note) {
  const canvas = page.locator("#tileCanvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box.width * 0.42, y: box.height * 0.21 } });
  await page.locator("#note").fill(note);
  await expect(page.locator("#submitBtn")).toBeEnabled();
  await page.locator("#submitBtn").click();
  await expect(page.locator("#observationReviewStatus")).toContainText("1 submitted observation");
}

async function installNetworkRecorder(page) {
  await page.evaluate(() => {
    const calls = [];
    window.__COSMOS_NETWORK_AFTER_RECORDER = calls;

    const originalFetch = window.fetch.bind(window);
    window.fetch = (...args) => {
      calls.push({ type: "fetch", target: String(args[0]) });
      return originalFetch(...args);
    };

    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function WebSocketRecorder(...args) {
      calls.push({ type: "websocket", target: String(args[0]) });
      return new OriginalWebSocket(...args);
    };
    window.WebSocket.prototype = OriginalWebSocket.prototype;

    const originalSendBeacon = navigator.sendBeacon?.bind(navigator);
    if (originalSendBeacon) {
      navigator.sendBeacon = (...args) => {
        calls.push({ type: "sendBeacon", target: String(args[0]) });
        return originalSendBeacon(...args);
      };
    }
  });
}
