export {
  createBookmarkPayload,
  createBookmarkUrl,
  createBuildInfo,
  createProvenanceHash,
  decodeBookmarkPayload,
  encodeBookmarkPayload,
  sha256Text,
} from "../../../../packages/core/src/provenance/index.js";

export function notifyTestBridge(type, detail, windowRef = globalThis.window) {
  try {
    const targetOrigin = getTestBridgeTargetOrigin(windowRef);
    if (targetOrigin) {
      windowRef.opener.postMessage({ channel: "cosmos-test-bridge", type, detail }, targetOrigin);
    }
  } catch {
    // Test bridge notifications are best-effort only.
  }
}

export function getTestBridgeTargetOrigin(windowRef = globalThis.window) {
  const opener = windowRef?.opener;
  if (!opener || typeof opener.postMessage !== "function") {
    return "";
  }

  const currentOrigin = getWindowOrigin(windowRef);
  if (!currentOrigin) {
    return "";
  }

  const openerOrigin = getWindowOrigin(opener);
  if (openerOrigin !== currentOrigin) {
    return "";
  }

  return currentOrigin;
}

function getWindowOrigin(windowRef) {
  try {
    const origin = windowRef?.location?.origin;
    if (origin && origin !== "null") {
      return origin;
    }

    const href = windowRef?.location?.href;
    if (!href) {
      return "";
    }

    const parsedOrigin = new URL(href).origin;
    return parsedOrigin === "null" ? "" : parsedOrigin;
  } catch {
    return "";
  }
}

export async function writeClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}
