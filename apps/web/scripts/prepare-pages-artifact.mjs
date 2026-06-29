#!/usr/bin/env node

import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const artifactRoot = path.resolve(repoRoot, process.env.COSMOS_CQA_PAGES_ARTIFACT_ROOT || "apps/web/dist-pages");
const siteFiles = ["index.html", "workbench.html", "CNAME", "src"];
const sharedStaticRoots = ["packages", "examples"];

await rm(artifactRoot, { recursive: true, force: true });
await mkdir(artifactRoot, { recursive: true });

for (const entry of siteFiles) {
  await cp(path.join(appRoot, entry), path.join(artifactRoot, entry), { recursive: true });
}

for (const entry of sharedStaticRoots) {
  await cp(path.join(repoRoot, entry), path.join(artifactRoot, entry), { recursive: true });
}

await writeFile(path.join(artifactRoot, ".nojekyll"), "");

console.log(`COSMOS-CQA Pages artifact prepared at ${path.relative(repoRoot, artifactRoot)}`);
console.log(`Included site root: apps/web (${siteFiles.join(", ")})`);
console.log(`Included shared static roots: ${sharedStaticRoots.join(", ")}`);
