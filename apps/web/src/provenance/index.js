export function createBuildInfo({ dev = false } = {}) {
  return {
    version: dev ? "source-split-dev" : "source-split-public",
    sha: "source-split",
    dev,
  };
}

export function createBookmarkPayload({ tile, overlay, palette, rate, loop, captions, seed }) {
  const meta = tile.meta;
  return {
    dataset: {
      name: meta.dataset || "DemoSynthetic",
      release: meta.release || "v0",
      doi: meta.doi || "doi:10.0000/demo",
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
  };
}

export function encodeBookmarkPayload(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function createBookmarkUrl(payload, locationRef = location) {
  return `${locationRef.origin}${locationRef.pathname}#state=${encodeBookmarkPayload(payload)}`;
}

export function notifyTestBridge(type, detail) {
  try {
    if (window.opener) {
      window.opener.postMessage({ channel: "cosmos-test-bridge", type, detail }, "*");
    }
  } catch {
    // Test bridge notifications are best-effort only.
  }
}

export async function writeClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}

