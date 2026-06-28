import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../../..");
const legacyRoot = resolve(repoRoot, "archive/original-materials/legacy-v3");

const files = [
  "COSMOS_v3_public.html",
  "COSMOS_v3_dev.html",
  "COSMOS_v3_1_dev.html",
];

function extractScripts(html) {
  const scripts = [];
  const pattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  return scripts.join("\n");
}

let failures = 0;

for (const file of files) {
  const path = resolve(legacyRoot, file);
  const html = readFileSync(path, "utf8");
  const scripts = extractScripts(html);

  try {
    new Function(scripts);
    console.log(`${file}: JavaScript syntax OK`);
  } catch (error) {
    failures += 1;
    console.error(`${file}: JavaScript syntax failed`);
    console.error(error.message);
  }
}

if (failures > 0) {
  process.exitCode = 1;
}

