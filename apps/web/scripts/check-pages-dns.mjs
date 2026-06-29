#!/usr/bin/env node

import { resolve4, resolve6, resolveCname } from "node:dns/promises";

const domain = process.env.COSMOS_CQA_PAGES_DOMAIN || "cosmos-cqa.org";
const wwwDomain = `www.${domain}`;
const expectedA = new Set(["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"]);
const expectedAaaa = new Set([
  "2606:50c0:8000::153",
  "2606:50c0:8001::153",
  "2606:50c0:8002::153",
  "2606:50c0:8003::153",
]);
const expectedWwwCname = "ai-bio-synergy-holdings-llc.github.io";
const failures = [];

await checkApexRecords();
await checkWwwRecord();

if (failures.length) {
  console.error(`GitHub Pages DNS is not ready for ${domain}:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`GitHub Pages DNS OK for ${domain}.`);
}

async function checkApexRecords() {
  const aRecords = await resolveOrEmpty(() => resolve4(domain));
  const aaaaRecords = await resolveOrEmpty(() => resolve6(domain));

  const missingA = [...expectedA].filter((record) => !aRecords.includes(record));
  const unexpectedA = aRecords.filter((record) => !expectedA.has(record));
  if (missingA.length) {
    failures.push(`${domain}: missing GitHub Pages A record(s): ${missingA.join(", ")}`);
  }
  if (unexpectedA.length) {
    failures.push(`${domain}: remove non-GitHub Pages A record(s): ${unexpectedA.join(", ")}`);
  }

  const unexpectedAaaa = aaaaRecords.filter((record) => !expectedAaaa.has(record));
  if (unexpectedAaaa.length) {
    failures.push(`${domain}: remove non-GitHub Pages AAAA record(s): ${unexpectedAaaa.join(", ")}`);
  }
}

async function checkWwwRecord() {
  const cnames = (await resolveOrEmpty(() => resolveCname(wwwDomain))).map((record) => record.replace(/\.$/, "").toLowerCase());
  const cnameSet = new Set(cnames);
  if (!cnameSet.has(expectedWwwCname)) {
    failures.push(`${wwwDomain}: expected CNAME ${expectedWwwCname}`);
  }
}

async function resolveOrEmpty(resolveFn) {
  try {
    return await resolveFn();
  } catch {
    return [];
  }
}
