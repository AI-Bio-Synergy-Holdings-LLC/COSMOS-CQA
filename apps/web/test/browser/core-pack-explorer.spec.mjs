import { expect, test } from "@playwright/test";

import { openWorkbench } from "./fixtures/workbench.mjs";

test("shows Core Pack explorer empty and invalid states", async ({ page }) => {
  await openWorkbench(page);

  await expect(page.locator("#corePackExplorerStatus")).toContainText("No Core Pack manifest loaded");
  await expect(page.locator("#tilePassportDetails")).toContainText("tile_001");
  await expect(page.locator("#tilePassportDetails")).toContainText("Public truth labels hidden");
  await expect(page.locator("#tilePassportProvenance")).toContainText("No Core Pack provenance is loaded");

  await page.locator("#fileInput").setInputFiles({
    name: "invalid-core-pack.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        manifest_id: "corepack_invalid",
        tiles: [],
        sbom_refs: [],
      }),
    ),
  });

  await expect(page.locator("#feedStatus")).toContainText("Core Pack rejected");
  await expect(page.locator("#corePackExplorerStatus")).toContainText("Core Pack rejected");
});

test("explores the public sample Core Pack and selected tile passports", async ({ page }) => {
  await openWorkbench(page);

  await page.locator("#loadSample").click();
  await expect(page.locator("#feedStatus")).toHaveText("Loaded Core Pack corepack_demo-v0.1.0-intake: 2 tile passport(s).");

  await expect(page.locator("#corePackExplorerStatus")).toContainText("schema-validated Core Pack manifest");
  await expect(page.locator("#corePackManifestSummary")).toContainText("corepack_demo-v0.1.0-intake");
  await expect(page.locator("#corePackManifestSummary")).toContainText("v0.1.0-research-alpha");
  await expect(page.locator("#corePackManifestSummary")).toContainText("AI-Bio Synergy Holdings LLC");
  await expect(page.locator("#corePackManifestSummary")).toContainText("Research-only public use");
  await expect(page.locator("#corePackManifestSummary")).toContainText("Tile count");
  await expect(page.locator("#corePackManifestSummary")).toContainText("2");

  await expect(page.locator("#corePackTileList button")).toHaveCount(2);
  await expect(page.locator("#corePackTileList button").first()).toHaveClass(/active/);
  await expect(page.locator("#corePackEvidenceRefs")).toContainText("archive-original-materials-manifest");
  await expect(page.locator("#corePackEvidenceRefs")).toContainText("core-pack-import-checklist");
  await expect(page.locator("#corePackSbomRefs")).toContainText("sbom_v0.1.0-research-alpha");
  await expect(page.locator("#corePackDiagnosticRefs")).toContainText("Kappa-y cross-correlation review placeholder");
  await expect(page.locator("#corePackDiagnosticRefs")).toContainText("E/B residual review placeholder");

  await expect(page.locator("#tilePassportStatus")).toHaveText("Core Pack passport");
  await expect(page.locator("#tilePassportDetails")).toContainText("demo_corepack_tile_001");
  await expect(page.locator("#tilePassportDetails")).toContainText("DEMO_SIM_T");
  await expect(page.locator("#tilePassportDetails")).toContainText("RA 7.611, Dec 29.900");
  await expect(page.locator("#tilePassportDetails")).toContainText("sha256:demo-corepack-tile-001");
  await expect(page.locator("#tilePassportDetails")).toContainText("Public truth labels hidden");
  await expect(page.locator("#tilePassportProvenance")).toContainText("synthetic-demo-core-pack");
  await expect(page.locator("#tilePassportProvenance")).toContainText("archive/original-materials/legacy-v3/COSMOS_v3_public.html");
  await expect(page.locator("#tilePassportSidecars")).toContainText("dft32_rowmeans");
  await expect(page.locator("#tilePassportSidecars")).toContainText("none, gradient, rings, wavelet");

  await page.locator("#corePackTileList button").filter({ hasText: "demo_corepack_tile_002" }).click();
  await expect(page.locator("#tileId")).toHaveText("demo_corepack_tile_002");
  await expect(page.locator("#tilePassportDetails")).toContainText("demo_corepack_tile_002");
  await expect(page.locator("#tilePassportDetails")).toContainText("RA 19.250, Dec -4.500");
  await expect(page.locator("#tilePassportDetails")).toContainText("sha256:demo-corepack-tile-002");
  await expect(page.locator("#tilePassportDetails")).toContainText("No truth record in passport.");
  await expect(page.locator("#tilePassportSidecars")).toContainText("gray, cividis");
  await expect(page.locator("#corePackTileList button").filter({ hasText: "demo_corepack_tile_002" })).toHaveClass(/active/);
});
