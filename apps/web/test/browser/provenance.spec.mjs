import { expect, test } from "@playwright/test";

import { BOOKMARK_TARGETS } from "./fixtures/legacy-targets.mjs";
import {
  annotateTargets,
  decodeBookmarkPayload,
  openWorkbench,
  readClipboard,
} from "./fixtures/workbench.mjs";

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
