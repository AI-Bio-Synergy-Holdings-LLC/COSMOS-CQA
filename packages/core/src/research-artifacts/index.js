import { assertContract } from "../../../schemas/src/index.js";
import { validateCorePackManifest } from "../core-pack/index.js";
import { parseFeedPayload } from "../feeds/index.js";
import { createProvenanceHash, sha256Text } from "../provenance/index.js";

export async function parseResearchArtifactPayload(
  text,
  { source = "inline", generatedAt = new Date().toISOString(), cryptoRef = globalThis.crypto } = {},
) {
  const sourceSha256 = `sha256:${await sha256Text(text, cryptoRef)}`;
  const provenanceHash = createProvenanceHash({ subject: source, sha256: sourceSha256, generatedAt });
  const parsedJson = parseJsonObject(text);

  if (isCorePackManifestShape(parsedJson)) {
    const validation = validateCorePackManifest(parsedJson);
    return {
      kind: "core-pack",
      manifest: parsedJson,
      events: [],
      errors: validation.errors.map((message) => ({ index: -1, message, event_type: "core-pack" })),
      warnings: validation.warnings,
      artifact: createResearchArtifact({
        kind: "core-pack",
        source,
        sourceSha256,
        recordCount: Array.isArray(parsedJson.tiles) ? parsedJson.tiles.length : 0,
        errorCount: validation.errors.length,
        importedAt: generatedAt,
        manifestId: parsedJson.manifest_id,
        notes: "Core Pack manifest loaded through the research artifact intake lane.",
      }),
      provenanceHash,
    };
  }

  const feed = parseFeedPayload(text);
  return {
    kind: "feed",
    manifest: null,
    events: feed.events,
    errors: feed.errors,
    warnings: [],
    artifact: createResearchArtifact({
      kind: "feed",
      source,
      sourceSha256,
      recordCount: feed.events.length,
      errorCount: feed.errors.length,
      importedAt: generatedAt,
      notes: "Feed payload loaded through contract validation.",
    }),
    provenanceHash,
  };
}

export function createResearchArtifact({
  kind,
  source,
  sourceSha256,
  recordCount,
  errorCount = 0,
  importedAt = new Date().toISOString(),
  manifestId,
  notes = "",
}) {
  const artifact = {
    artifact_id: `artifact_${safeId(kind)}_${safeId(sourceSha256.replace(/^sha256:/, "").slice(0, 16))}`,
    kind,
    source,
    source_sha256: sourceSha256,
    record_count: recordCount,
    error_count: errorCount,
    imported_at: importedAt,
  };

  if (manifestId) {
    artifact.manifest_id = manifestId;
  }
  if (notes) {
    artifact.notes = notes;
  }

  return assertContract("researchArtifact", artifact);
}

export function isCorePackManifestShape(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof value.manifest_id === "string" &&
      Array.isArray(value.tiles) &&
      Array.isArray(value.sbom_refs),
  );
}

function parseJsonObject(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function safeId(value) {
  return String(value).replace(/[^A-Za-z0-9._:-]+/g, "_");
}
