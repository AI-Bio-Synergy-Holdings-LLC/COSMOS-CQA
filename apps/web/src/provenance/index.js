export {
  createBookmarkPayload,
  createBookmarkUrl,
  createBuildInfo,
  decodeBookmarkPayload,
  encodeBookmarkPayload,
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
