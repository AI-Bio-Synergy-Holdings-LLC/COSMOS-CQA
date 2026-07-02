import { expect, test } from "@playwright/test";

import { transformSourceToViewportPoint } from "../../../../packages/core/src/observations/index.js";
import { EXPERT_QUEUE_TARGETS, LABEL_WORKFLOW_TARGETS } from "./fixtures/legacy-targets.mjs";
import {
  annotateTargets,
  blurActiveElement,
  disableSimulation,
  firstStoredObservation,
  firstStoredLabel,
  labelCount,
  observationCount,
  openWorkbench,
} from "./fixtures/workbench.mjs";

test("migrates tracked label submit and undo targets into browser automation", async ({ page }) => {
  annotateTargets(LABEL_WORKFLOW_TARGETS);
  await openWorkbench(page);
  await disableSimulation(page);

  await expect(page.locator("#classSel option")).toHaveCount(6);
  await page.locator("#classSel").selectOption("dipole");
  await page.locator("#sevSel").selectOption("high");
  await page.locator("#note").fill("browser automation label workflow ".repeat(12));
  await page.locator("#submitBtn").click();

  await expect(page.locator("#caption")).toContainText("Submitted: dipole (high).");
  await expect.poll(() => labelCount(page)).toBe(1);
  expect(await firstStoredLabel(page)).toMatchObject({
    clazz: "dipole",
    severity: "high",
    tile_id: "tile_001",
  });
  expect((await firstStoredLabel(page)).note).toHaveLength(240);

  await page.locator("#undoBtn").click();
  await expect(page.locator("#caption")).toContainText("Undid last label.");
  await expect.poll(() => labelCount(page)).toBe(0);

  await blurActiveElement(page);
  await page.keyboard.press("s");
  await expect.poll(() => labelCount(page)).toBe(1);

  await blurActiveElement(page);
  await page.keyboard.press("Control+z");
  await expect.poll(() => labelCount(page)).toBe(0);
});

test("migrates expert queue targets into browser automation", async ({ page }) => {
  annotateTargets(EXPERT_QUEUE_TARGETS);
  await openWorkbench(page);
  await disableSimulation(page);

  for (const [index, clazz] of ["stripe", "dipole"].entries()) {
    await page.locator("#tileSelect").selectOption(String(index));
    await page.locator("#classSel").selectOption(clazz);
    await page.locator("#submitBtn").click();
  }

  await page.locator("#expertBtn").click();
  await expect(page.locator("#expertDetails")).toHaveJSProperty("open", true);
  await expect(page.locator("#expertPane")).toContainText("residual:");
  await expect(page.locator("#expertPane")).toContainText("truth residual:");

  const rows = page.locator("#expertPane > div");
  await expect(rows.first()).toBeVisible();
  await rows.nth(0).locator('select[data-c="conf"]').selectOption("0.9");
  await rows.nth(0).locator('input[data-c="note"]').fill("confirm residual");
  await rows.nth(0).locator('button[data-d="confirm"]').click();

  await rows.nth(1).locator('select[data-c="conf"]').selectOption("0.6");
  await rows.nth(1).locator('input[data-c="note"]').fill("override clean");
  await rows.nth(1).locator('button[data-d="override"]').click();

  const expert = await page.evaluate(() => JSON.parse(localStorage.getItem("expert") || "[]"));
  expect(expert).toHaveLength(2);
  expect(expert[0]).toMatchObject({
    expert_class: "residual",
    expert_confidence: 0.9,
    note: "confirm residual",
  });
  expect(expert[1]).toMatchObject({
    expert_class: "clean",
    expert_confidence: 0.6,
    note: "override clean",
  });
});

test("pins tile observation targets and requires notes before synced submission", async ({ page }) => {
  await openWorkbench(page);
  await disableSimulation(page);

  const canvas = page.locator("#tileCanvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box.width * 0.42, y: box.height * 0.21 } });

  await expect(page.locator("#tileObservationStatus")).toContainText("Pinned top center");
  await expect(page.locator("#clearObservationBtn")).toBeVisible();
  const pendingCueTarget = await page.evaluate(() => window.COSMOS_CQA_APP.state.pendingObservation);
  const expectedCoordinateCue = `Tile coordinates: x=${pendingCueTarget.x_norm.toFixed(4)}, y=${pendingCueTarget.y_norm.toFixed(4)}`;
  const coordinateCue = await page.locator("#note").inputValue();
  expect(coordinateCue).toContain(expectedCoordinateCue);
  expect(coordinateCue).toContain("top center");
  expect(coordinateCue).toMatch(/Observation:\s*$/);
  await expect(page.locator("#submitBtn")).toBeDisabled();
  await expect(page.locator(".observation-marker.pending")).toHaveCount(1);

  await page.locator("#note").fill(`${coordinateCue}faint vertical band in top center zone; visible with gradient overlay`);
  await expect(page.locator("#submitBtn")).toBeEnabled();
  await page.locator("#classSel").selectOption("stripe");
  await page.locator("#sevSel").selectOption("medium");
  await page.locator("#submitBtn").click();

  await expect(page.locator("#caption")).toContainText("Submitted: stripe (medium) at top center.");
  await expect.poll(() => labelCount(page)).toBe(1);
  await expect.poll(() => observationCount(page)).toBe(1);
  await expect(page.locator(".observation-marker.submitted")).toHaveCount(1);
  await expect(page.locator(".observation-marker.pending")).toHaveCount(0);

  const label = await firstStoredLabel(page);
  const observation = await firstStoredObservation(page);
  expect(observation).toMatchObject({
    label_id: label.label_id,
    tile_id: "tile_001",
    zone_id: "r1c2",
    zone_label: "top center",
    clazz: "stripe",
    severity: "medium",
  });
  expect(observation.x_norm).toBeGreaterThan(0.4);
  expect(observation.x_norm).toBeLessThan(0.44);
  expect(observation.y_norm).toBeGreaterThan(0.19);
  expect(observation.y_norm).toBeLessThan(0.23);
  expect(observation.note).toContain(expectedCoordinateCue);
  expect(observation.note).toContain("top center zone");
  expect(label.note).toBe(observation.note);
  await expect(page.locator("#note")).toHaveValue("");

  await page.locator("#undoBtn").click();
  await expect.poll(() => labelCount(page)).toBe(0);
  await expect.poll(() => observationCount(page)).toBe(0);
  await expect(page.locator(".observation-marker.submitted")).toHaveCount(0);
});

test("keeps pinned source coordinates stable after viewer transforms", async ({ page }) => {
  await openWorkbench(page);
  await disableSimulation(page);

  await expect(page.locator("#viewerTransformStatus")).toContainText("Zoom 100%; rotation 0 deg; pan 0, 0.");
  await page.locator("#zoomInBtn").click();
  await page.locator("#zoomInBtn").click();
  await page.locator("#panRightBtn").click();
  await page.locator("#panDownBtn").click();
  await page.locator("#rotateRightBtn").click();
  await expect(page.locator("#viewerTransformStatus")).toContainText("Zoom 150%; rotation 90 deg; pan 32, 32.");

  const viewport = await page.locator("#tileCanvasWrap").boundingBox();
  const clickPoint = transformSourceToViewportPoint({
    xNorm: 0.42,
    yNorm: 0.32,
    width: viewport.width,
    height: viewport.height,
    transform: { zoom: 1.5, panX: 32, panY: 32, rotationDeg: 90 },
  });
  expect(clickPoint.x).toBeGreaterThan(0);
  expect(clickPoint.x).toBeLessThan(viewport.width);
  expect(clickPoint.y).toBeGreaterThan(0);
  expect(clickPoint.y).toBeLessThan(viewport.height);

  await page.locator("#tileCanvasWrap").click({ position: clickPoint });
  await expect(page.locator("#tileObservationStatus")).toContainText("Pinned top center");
  await expect(page.locator(".observation-marker.pending")).toHaveCount(1);

  const pending = await page.evaluate(() => window.COSMOS_CQA_APP.state.pendingObservation);
  expect(pending).toMatchObject({
    zone_id: "r1c2",
    zone_label: "top center",
  });
  expect(pending.x_norm).toBeGreaterThan(0.418);
  expect(pending.x_norm).toBeLessThan(0.422);
  expect(pending.y_norm).toBeGreaterThan(0.318);
  expect(pending.y_norm).toBeLessThan(0.322);
  const expectedTransformedCoordinateCue = `Tile coordinates: x=${pending.x_norm.toFixed(4)}, y=${pending.y_norm.toFixed(4)}`;
  const transformedCoordinateCue = await page.locator("#note").inputValue();
  expect(transformedCoordinateCue).toContain(expectedTransformedCoordinateCue);
  expect(transformedCoordinateCue).toContain("top center");
  await expect(page.locator("#submitBtn")).toBeDisabled();
  await expect
    .poll(async () => {
      const viewportAfterPin = await page.locator("#tileCanvasWrap").boundingBox();
      const marker = await page.locator(".observation-marker.pending").boundingBox();
      if (!viewportAfterPin || !marker) {
        return 999;
      }

      const markerCenter = {
        x: marker.x + marker.width / 2,
        y: marker.y + marker.height / 2,
      };
      const expectedMarkerPoint = transformSourceToViewportPoint({
        xNorm: pending.x_norm,
        yNorm: pending.y_norm,
        width: viewportAfterPin.width,
        height: viewportAfterPin.height,
        transform: { zoom: 1.5, panX: 32, panY: 32, rotationDeg: 90 },
      });

      return Math.max(
        Math.abs(markerCenter.x - (viewportAfterPin.x + expectedMarkerPoint.x)),
        Math.abs(markerCenter.y - (viewportAfterPin.y + expectedMarkerPoint.y)),
      );
    })
    .toBeLessThan(4);

  await page.locator("#note").fill(`${transformedCoordinateCue}transformed viewer click stays linked to source tile coordinates`);
  await page.locator("#submitBtn").click();
  const observation = await firstStoredObservation(page);
  expect(observation).toMatchObject({
    zone_id: "r1c2",
  });
  expect(observation.x_norm).toBeGreaterThan(0.418);
  expect(observation.x_norm).toBeLessThan(0.422);
  expect(observation.y_norm).toBeGreaterThan(0.318);
  expect(observation.y_norm).toBeLessThan(0.322);
  expect(observation.note).toContain(expectedTransformedCoordinateCue);

  await page.locator("#resetViewBtn").click();
  await expect(page.locator("#viewerTransformStatus")).toContainText("Zoom 100%; rotation 0 deg; pan 0, 0.");
  await expect.poll(() => page.evaluate(() => window.COSMOS_CQA_APP.state.viewerTransform)).toEqual({
    zoom: 1,
    panX: 0,
    panY: 0,
    rotationDeg: 0,
  });
});

test("reviews submitted observations with synced edit delete restore and export summaries", async ({ page }) => {
  await openWorkbench(page);
  await disableSimulation(page);

  await page.locator("#zoomInBtn").click();
  await page.locator("#panRightBtn").click();
  await page.locator("#rotateRightBtn").click();
  const viewport = await page.locator("#tileCanvasWrap").boundingBox();
  const clickPoint = transformSourceToViewportPoint({
    xNorm: 0.42,
    yNorm: 0.32,
    width: viewport.width,
    height: viewport.height,
    transform: { zoom: 1.25, panX: 32, panY: 0, rotationDeg: 90 },
  });
  await page.locator("#tileCanvasWrap").click({ position: clickPoint });
  const reviewCoordinateCue = await page.locator("#note").inputValue();
  await page.locator("#note").fill(`${reviewCoordinateCue}review workspace transformed pin in top center zone`);
  await page.locator("#submitBtn").click();

  await expect(page.locator("#observationReviewStatus")).toContainText("1 submitted observation");
  await expect(page.locator("#observationReviewSummary")).toContainText("Review events");
  await expect(page.locator("#observationReviewLedger")).toContainText("0: create");
  await expect(page.locator(".observation-review-row")).toHaveCount(1);
  await page.locator(".observation-review-row").click();
  await expect(page.locator(".observation-review-row")).toHaveClass(/active/);
  await expect(page.locator(".observation-marker.selected")).toHaveCount(1);
  await expect(page.locator("#observationReviewAudit")).toContainText("synced label");

  await page.locator("#reviewClassSel").selectOption("dipole");
  await page.locator("#reviewSevSel").selectOption("high");
  await page.locator("#reviewStatusSel").selectOption("needs-adjudication");
  await page.locator("#reviewConfidenceInput").evaluate((input) => {
    input.value = "0.85";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.locator("#reviewNote").fill("reviewed transformed target; stronger dipole interpretation with clear top center note");
  await page.locator("#saveObservationReviewBtn").click();
  await expect(page.locator("#caption")).toContainText("Observation review saved");
  await expect(page.locator("#observationReviewAudit")).toContainText("edited revision 1");
  await expect(page.locator("#observationReviewAudit")).toContainText("needs-adjudication");
  await expect(page.locator("#observationReviewLedger")).toContainText("1: edit");
  await expect(page.locator("#adjudicationQueueStatus")).toContainText("1 observation");
  await expect(page.locator("#adjudicationQueueList .observation-review-row")).toHaveCount(1);
  await expect(page.locator("#adjudicationQueueList .observation-review-row")).toHaveClass(/active/);
  await expect(page.locator("#adjudicationQueueDetails")).toContainText("needs-adjudication");
  await expect(page.locator("#adjudicationLedger")).toContainText("1: edit");
  await expect(page.locator("#evidenceObservations")).toContainText("review=edited:1");
  await expect(page.locator("#evidenceObservations")).toContainText("confidence=0.85");
  await expect(page.locator("#evidenceReviewLedger")).toContainText("not validated detections");
  await expect(page.locator("#reportObservationSummary")).toContainText("Review states");
  await expect(page.locator("#reportObservationSummary")).toContainText("Needs adjudication");
  await expect(page.locator("#reportObservations")).toContainText("Tile tile_001");
  await expect(page.locator("#reportReviewLedger")).toContainText("1: edit");

  const reviewedLabel = await firstStoredLabel(page);
  const reviewedObservation = await firstStoredObservation(page);
  expect(reviewedLabel).toMatchObject({
    clazz: "dipole",
    severity: "high",
    review_state: "edited",
    review_revision: 1,
    review_status: "needs-adjudication",
    reviewer_confidence: 0.85,
    consensus_status: "needs-adjudication",
  });
  expect(reviewedObservation).toMatchObject({
    clazz: "dipole",
    severity: "high",
    review_state: "edited",
    review_revision: 1,
    review_status: "needs-adjudication",
    reviewer_confidence: 0.85,
    consensus_status: "needs-adjudication",
  });
  expect(reviewedLabel.note).toBe(reviewedObservation.note);
  expect(reviewedObservation.edit_summary).toContain("class stripe -> dipole");
  expect(reviewedObservation.adjudication_state).toContain("adjudication placeholder");
  const eventsAfterEdit = await page.evaluate(() => JSON.parse(localStorage.getItem("observationReviewEvents") || "[]"));
  expect(eventsAfterEdit.map((event) => event.action)).toEqual(["create", "edit"]);
  expect(eventsAfterEdit[1]).toMatchObject({
    review_status: "needs-adjudication",
    reviewer_confidence: 0.85,
    active_after: true,
  });
  expect(eventsAfterEdit[1].claim_boundary).toContain("not validated detections");

  const report = await page.evaluate(() => window.COSMOS_CQA_APP.state.validationReportPreview);
  expect(report.observation_summary.tile_counts[0]).toMatchObject({ key: "tile_001", count: 1 });
  expect(report.observation_summary.note_status_counts[0]).toMatchObject({ key: "with_note", count: 1 });
  expect(report.observation_summary.review_state_counts[0]).toMatchObject({ key: "edited", count: 1 });
  expect(report.observation_summary.review_status_counts[0]).toMatchObject({ key: "needs-adjudication", count: 1 });
  expect(report.observation_summary.tile_qa_metrics[0]).toMatchObject({ key: "tile_001", ledger_event_count: 2, needs_adjudication_count: 1 });
  expect(report.observation_review_events.map((event) => event.action)).toEqual(["create", "edit"]);
  expect(report.checks.find((check) => check.name === "tile observation targets").detail).toContain("2 immutable review ledger event");

  await expect(page.locator("#applyAdjudicationDecisionBtn")).toBeDisabled();
  await page.locator("#adjudicationDecisionSel").selectOption("request-second-review");
  await page.locator("#adjudicationNote").fill("request a second review before any consensus interpretation");
  await page.locator("#applyAdjudicationDecisionBtn").click();
  await expect(page.locator("#caption")).toContainText("request-second-review");
  await expect(page.locator("#observationReviewAudit")).toContainText("edited revision 2");
  await expect(page.locator("#observationReviewAudit")).toContainText("needs-adjudication");
  await expect(page.locator("#adjudicationQueueStatus")).toContainText("1 observation");
  await expect(page.locator("#observationReviewLedger")).toContainText("2: adjudication-second-review");
  await expect(page.locator("#adjudicationLedger")).toContainText("decision=request-second-review");
  const secondReviewObservation = await firstStoredObservation(page);
  expect(secondReviewObservation).toMatchObject({
    review_revision: 2,
    review_status: "needs-adjudication",
    consensus_status: "needs-adjudication",
  });
  expect(secondReviewObservation.adjudication_note).toContain("second review");

  await page.locator("#adjudicationDecisionSel").selectOption("mark-reviewed");
  await page.locator("#adjudicationNote").fill("triage complete as a single-reviewer QA workflow state only");
  await page.locator("#applyAdjudicationDecisionBtn").click();
  await expect(page.locator("#caption")).toContainText("mark-reviewed");
  await expect(page.locator("#adjudicationQueueStatus")).toContainText("No observations are waiting");
  await expect(page.locator("#adjudicationQueueDetails")).toContainText("No queued observation selected");
  await expect(page.locator("#observationReviewAudit")).toContainText("edited revision 3");
  await expect(page.locator("#observationReviewAudit")).toContainText("reviewed");
  await expect(page.locator("#observationReviewLedger")).toContainText("3: adjudication-reviewed");
  await expect(page.locator("#evidenceReviewLedger")).toContainText("decision=mark-reviewed");
  await expect(page.locator("#reportReviewLedger")).toContainText("adjudication-reviewed");
  const adjudicatedObservation = await firstStoredObservation(page);
  expect(adjudicatedObservation).toMatchObject({
    review_revision: 3,
    review_status: "reviewed",
    consensus_status: "single-reviewer",
  });
  expect(adjudicatedObservation.adjudication_state).toContain("single-reviewer QA");
  const eventsAfterAdjudication = await page.evaluate(() => JSON.parse(localStorage.getItem("observationReviewEvents") || "[]"));
  expect(eventsAfterAdjudication.map((event) => event.action)).toEqual([
    "create",
    "edit",
    "adjudication-second-review",
    "adjudication-reviewed",
  ]);
  expect(eventsAfterAdjudication.at(-1)).toMatchObject({
    adjudication_decision: "mark-reviewed",
    review_status: "reviewed",
    consensus_status: "single-reviewer",
  });
  const adjudicatedReport = await page.evaluate(() => window.COSMOS_CQA_APP.state.validationReportPreview);
  expect(adjudicatedReport.observation_summary.review_status_counts[0]).toMatchObject({ key: "reviewed", count: 1 });
  expect(adjudicatedReport.observation_summary.tile_qa_metrics[0]).toMatchObject({ key: "tile_001", ledger_event_count: 4, needs_adjudication_count: 0 });
  expect(adjudicatedReport.checks.find((check) => check.name === "tile observation targets").detail).toContain(
    "4 immutable review ledger event",
  );

  await page.locator("#deleteObservationReviewBtn").click();
  await expect(page.locator("#caption")).toContainText("removed from active exports");
  await expect.poll(() => labelCount(page)).toBe(0);
  await expect.poll(() => observationCount(page)).toBe(0);
  await expect(page.locator("#observationReviewStatus")).toContainText("No submitted observations yet.");
  await expect(page.locator("#restoreObservationReviewBtn")).toBeEnabled();
  await expect(page.locator(".observation-marker.submitted")).toHaveCount(0);
  await expect(page.locator("#observationReviewLedger")).toContainText("4: delete");
  const reportAfterDelete = await page.evaluate(() => window.COSMOS_CQA_APP.state.validationReportPreview);
  expect(reportAfterDelete.summary.observation_count).toBe(0);
  expect(reportAfterDelete.summary.observation_review_event_count).toBe(5);
  expect(reportAfterDelete.observation_review_events.at(-1)).toMatchObject({ action: "delete", active_after: false });

  await page.locator("#restoreObservationReviewBtn").click();
  await expect(page.locator("#caption")).toContainText("restored to active evidence exports");
  await expect.poll(() => labelCount(page)).toBe(1);
  await expect.poll(() => observationCount(page)).toBe(1);
  await expect(page.locator(".observation-marker.selected")).toHaveCount(1);
  await expect(page.locator("#restoreObservationReviewBtn")).toBeDisabled();
  await expect(page.locator("#observationReviewLedger")).toContainText("5: restore");
  const restoredObservation = await firstStoredObservation(page);
  expect(restoredObservation).toMatchObject({
    review_state: "edited",
    review_revision: 3,
    review_status: "reviewed",
    consensus_status: "single-reviewer",
  });

  const bundle = await page.evaluate(() => window.COSMOS_CQA_APP.buildEvidenceBundle({ generatedAt: "2026-06-30T00:00:00.000Z" }));
  expect(bundle.observation_summary.tile_counts[0]).toMatchObject({ key: "tile_001", count: 1 });
  expect(bundle.observation_summary.review_state_counts[0]).toMatchObject({ key: "edited", count: 1 });
  expect(bundle.observation_summary.tile_qa_metrics[0]).toMatchObject({ key: "tile_001", ledger_event_count: 6, needs_adjudication_count: 0 });
  expect(bundle.observation_review_events.map((event) => event.action)).toEqual([
    "create",
    "edit",
    "adjudication-second-review",
    "adjudication-reviewed",
    "delete",
    "restore",
  ]);
  expect(bundle.session.observation_review_events.map((event) => event.event_id)).toEqual(bundle.observation_review_events.map((event) => event.event_id));
  expect(bundle.summary.observation_review_event_count).toBe(6);

  const sessionText = JSON.stringify(bundle.session);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => Boolean(window.COSMOS_CQA_APP));
  const importResult = await page.evaluate((text) => window.COSMOS_CQA_APP.importResearchSessionText(text, { source: "browser-replay" }), sessionText);
  expect(importResult.ok).toBe(true);
  await expect(page.locator("#evidenceReviewLedger")).toContainText("5: restore");
  await expect(page.locator("#reportReviewLedger")).toContainText("adjudication-reviewed");
  const replayedEvents = await page.evaluate(() => window.COSMOS_CQA_APP.state.observationReviewEvents.map((event) => event.action));
  expect(replayedEvents).toEqual(["create", "edit", "adjudication-second-review", "adjudication-reviewed", "delete", "restore"]);
});
