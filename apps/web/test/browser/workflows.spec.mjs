import { expect, test } from "@playwright/test";

const TILE_NAVIGATION_TARGETS = [
  "legacy-v3.manual.1-tile-navigation-display.001",
  "legacy-v3.manual.1-tile-navigation-display.002",
  "legacy-v3.manual.1-tile-navigation-display.003",
  "legacy-v3.manual.1-tile-navigation-display.004",
  "legacy-v3.manual.1-tile-navigation-display.005",
  "legacy-v3.manual.1-tile-navigation-display.006",
];

const LABEL_WORKFLOW_TARGETS = [
  "legacy-v3.manual.4-classification-submission.001",
  "legacy-v3.manual.4-classification-submission.002",
  "legacy-v3.manual.4-classification-submission.003",
  "legacy-v3.manual.4-classification-submission.004",
  "legacy-v3.manual.4-classification-submission.005",
  "legacy-v3.manual.4-classification-submission.006",
  "legacy-v3.manual.4-classification-submission.007",
  "legacy-v3.manual.4-classification-submission.008",
];

const BOOKMARK_TARGETS = [
  "legacy-v3.manual.8-data-import-export.001",
  "legacy-v3.manual.8-data-import-export.002",
  "legacy-v3.bridge.bookmark-created",
  "legacy-v3.bridge.bookmark-roundtrip",
];

const TRUTH_POLICY_TARGETS = [
  "legacy-v3.manual.1-tile-navigation-display.007",
  "legacy-v3.bridge.truth-hidden-public",
];

test("migrates tracked tile navigation targets into browser automation", async ({ page }) => {
  annotateTargets(TILE_NAVIGATION_TARGETS);
  await openWorkbench(page);

  await expect(page.locator("#tileCanvas")).toBeVisible();
  await expect(page.locator("#tileSelect option")).toHaveCount(32);
  await expect(page.locator("#tileId")).toHaveText("tile_001");
  expect(await canvasHasSignal(page)).toBe(true);

  await page.locator("#nextBtn").click();
  await expect(page.locator("#tileId")).toHaveText("tile_002");
  await expect(page.locator("#tileSelect")).toHaveValue("1");

  await page.locator("#prevBtn").click();
  await expect(page.locator("#tileId")).toHaveText("tile_001");
  await expect(page.locator("#tileSelect")).toHaveValue("0");

  await page.keyboard.press("Control+ArrowRight");
  await expect(page.locator("#tileId")).toHaveText("tile_002");

  await page.keyboard.press("Control+ArrowLeft");
  await expect(page.locator("#tileId")).toHaveText("tile_001");
});

test("migrates tracked label submit and undo targets into browser automation", async ({ page }) => {
  annotateTargets(LABEL_WORKFLOW_TARGETS);
  await openWorkbench(page);
  await page.evaluate(() => {
    window.COSMOS_CQA_APP.state.simDisabled = true;
  });

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

test("migrates tracked bookmark creation and reload targets into browser automation", async ({ context, page }) => {
  annotateTargets(BOOKMARK_TARGETS);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:4173" });
  await openWorkbench(page);

  await page.locator("#tileSelect").selectOption("4");
  await expect(page.locator("#tileId")).toHaveText("tile_005");
  await page.locator("#overlaySel").selectOption("rings");
  await page.locator("#paletteSel").selectOption("cividis");
  await page.locator("#rateSel").selectOption("1.5");
  await page.locator("#loopBtn").click();
  await expect(page.locator("#loopBtn")).toHaveText("Loop: off");
  await page.locator("#captionsChk").setChecked(false);

  await page.locator("#bookmarkBtn").click();
  await expect.poll(() => readClipboard(page)).toContain("#state=");
  const bookmarkUrl = await readClipboard(page);
  const payload = decodeBookmarkPayload(bookmarkUrl);

  expect(payload.schema_version).toBe("cosmos-cqa.contracts.v0.1.0");
  expect(payload.dataset).toMatchObject({
    name: "DEMO_SIM_T",
    release: "v0",
  });
  expect(payload.tile.id).toBe("tile_005");
  expect(payload.overlay).toBe("rings");
  expect(payload.palette).toBe("cividis");
  expect(payload.env.audio).toMatchObject({
    map: "dft32_rowmeans",
    rate: 1.5,
    loop: false,
  });

  await openWorkbench(page, bookmarkUrl);
  await expect(page.locator("#tileId")).toHaveText("tile_005");
  await expect(page.locator("#tileSelect")).toHaveValue("4");
  await expect(page.locator("#overlaySel")).toHaveValue("rings");
  await expect(page.locator("#paletteSel")).toHaveValue("cividis");
  await expect(page.locator("#rateSel")).toHaveValue("1.5");
  await expect(page.locator("#loopBtn")).toHaveText("Loop: off");
  await expect(page.locator("#captionsChk")).not.toBeChecked();
});

test("migrates public truth-label hiding into browser automation", async ({ page }) => {
  annotateTargets(TRUTH_POLICY_TARGETS);
  await openWorkbench(page);

  await expect(page.locator("#truthTag")).toBeHidden();
  await expect(page.locator("#tileSelect option").first()).toHaveText("tile_001");

  await openWorkbench(page, "/?dev=1");
  await expect(page.locator("#truthTag")).toBeVisible();
  await expect(page.locator("#truthTag")).toHaveText("truth: stripe");
  await expect(page.locator("#tileSelect option").first()).toHaveText("tile_001 - stripe");
});

async function openWorkbench(page, url = "/") {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.COSMOS_CQA_APP));
}

async function canvasHasSignal(page) {
  return page.locator("#tileCanvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(0, 0, 64, 64);
    let min = 255;
    let max = 0;
    let alphaPixels = 0;

    for (let index = 0; index < data.length; index += 4) {
      min = Math.min(min, data[index]);
      max = Math.max(max, data[index]);
      if (data[index + 3] > 0) {
        alphaPixels += 1;
      }
    }

    return alphaPixels > 0 && max > min;
  });
}

async function labelCount(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("labels") || "[]").length);
}

async function firstStoredLabel(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("labels") || "[]")[0]);
}

async function blurActiveElement(page) {
  await page.evaluate(() => document.activeElement?.blur());
}

async function readClipboard(page) {
  return page.evaluate(() => navigator.clipboard.readText());
}

function decodeBookmarkPayload(url) {
  const encoded = new URL(url).hash.slice("#state=".length);
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
}

function annotateTargets(targets) {
  test.info().annotations.push({
    type: "legacy-targets",
    description: targets.join(", "),
  });
}
