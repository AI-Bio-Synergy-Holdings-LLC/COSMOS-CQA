import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const appRoot = resolve(import.meta.dirname, "..");
const targets = [resolve(appRoot, "src"), resolve(appRoot, "scripts")];
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
  if (result.status === 0) {
    console.log(`${file.replace(appRoot, ".")}: syntax OK`);
  } else {
    failures += 1;
    console.error(`${file.replace(appRoot, ".")}: syntax failed`);
    console.error(result.stderr || result.stdout);
  }
}

if (failures > 0) {
  process.exitCode = 1;
}

