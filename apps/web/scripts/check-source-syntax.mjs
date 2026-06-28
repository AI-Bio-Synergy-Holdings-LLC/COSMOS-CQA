import { readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const appRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(appRoot, "..", "..");
const targets = [resolve(appRoot, "src"), resolve(appRoot, "scripts"), resolve(repoRoot, "packages")];
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
    } else if (entry.isFile() && /\.(mjs|js)$/.test(entry.name)) {
      files.push(path);
    }
  }
}

targets.forEach(walk);

let failures = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  const label = relative(repoRoot, file).replaceAll("\\", "/");
  if (result.status === 0) {
    console.log(`${label}: syntax OK`);
  } else {
    failures += 1;
    console.error(`${label}: syntax failed`);
    console.error(result.stderr || result.stdout);
  }
}

if (failures > 0) {
  process.exitCode = 1;
}
