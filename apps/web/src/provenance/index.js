export {
  createBookmarkPayload,
  createBookmarkUrl,
  createBuildInfo,
  createProvenanceHash,
  decodeBookmarkPayload,
  encodeBookmarkPayload,
  sha256Text,
} from "../../../../packages/core/src/provenance/index.js";

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
