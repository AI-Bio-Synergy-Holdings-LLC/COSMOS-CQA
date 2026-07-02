import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";

export function createBuildInfo({ dev = false } = {}) {
  return assertContract("buildInfo", {
    version: dev ? "source-split-dev" : "source-split-public",
    sha: "source-split",
    dev,
  });
}

export async function sha256Text(text, cryptoRef = globalThis.crypto) {
  if (!cryptoRef?.subtle) {
    throw new Error("SHA-256 hashing requires Web Crypto subtle.digest support");
  }
  const bytes = new TextEncoder().encode(String(text));
  const digest = await cryptoRef.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createProvenanceHash({ subject, sha256, generatedAt = new Date().toISOString() }) {
  return assertContract("provenanceHash", {
    subject,
    algorithm: "sha256",
    value: sha256.startsWith("sha256:") ? sha256 : `sha256:${sha256}`,
    generated_at: generatedAt,
  });
}

export function createBookmarkPayload({ tile, overlay, palette, rate, loop, captions, seed }) {
  const meta = tile.meta;
  return assertContract("bookmarkPayload", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    dataset: {
      name: meta.dataset || "DemoSynthetic",
      release: meta.release || "v0",
      doi: meta.doi || "",
      tile_url: meta.url || "",
    },
    tile: {
      id: meta.tile_id,
      checksum: meta.checksum || "",
    },
    overlay,
    palette,
    captions,
    env: {
      seed,
      audio: {
        map: "dft32_rowmeans",
        rate,
        loop,
        frames: 120,
      },
    },
  });
}

export function encodeBookmarkPayload(payload) {
  return encodeUtf8Base64(JSON.stringify(assertContract("bookmarkPayload", payload)));
}

export function decodeBookmarkPayload(encoded) {
  return assertContract("bookmarkPayload", JSON.parse(decodeUtf8Base64(encoded)));
}

export function createBookmarkUrl(payload, locationRef = location) {
  return `${locationRef.origin}${locationRef.pathname}#state=${encodeBookmarkPayload(payload)}`;
}

function encodeUtf8Base64(text) {
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(text)));
  }
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(text, "utf8").toString("base64");
  }
  throw new Error("No base64 encoder available");
}

function decodeUtf8Base64(encoded) {
  if (typeof atob === "function") {
    return decodeURIComponent(escape(atob(encoded)));
  }
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(encoded, "base64").toString("utf8");
  }
  throw new Error("No base64 decoder available");
}
