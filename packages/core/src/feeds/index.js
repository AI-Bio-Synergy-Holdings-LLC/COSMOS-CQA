import { assertContract, validateContract } from "../../../schemas/src/index.js";

export function normalizeFeedEvent(event) {
  if (!event || typeof event !== "object") {
    throw new TypeError("Feed event must be an object");
  }

  if (event.type === "tile") {
    const normalized = {
      type: "tile",
      tile_id: String(event.tile_id || ""),
      dataset: String(event.dataset || ""),
      release: String(event.release || "v0"),
      doi: String(event.doi || ""),
      band: String(event.band || "T"),
      ra: Number(event.ra ?? 0),
      dec: Number(event.dec ?? 0),
      overlay: String(event.overlay || "none"),
      checksum: String(event.checksum || ""),
      png: String(event.png || ""),
    };
    return assertContract("feedTileEvent", normalized);
  }

  if (event.type === "expert") {
    const normalized = {
      type: "expert",
      tile_id: String(event.tile_id || ""),
      expert_class: String(event.expert_class || "residual"),
      expert_confidence: Number(event.expert_confidence ?? 0.75),
      note: String(event.note || "").slice(0, 240),
      latency_s: Number(event.latency_s ?? 0),
    };
    return assertContract("feedExpertEvent", normalized);
  }

  throw new TypeError(`Unsupported feed event type: ${event.type}`);
}

export function validateFeedEvent(event) {
  if (!event || typeof event !== "object" || !event.type) {
    return {
      valid: false,
      errors: [{ path: "feedEvent.type", message: "is required" }],
    };
  }

  const schemaName = event.type === "tile" ? "feedTileEvent" : event.type === "expert" ? "feedExpertEvent" : "feedEvent";
  return validateContract(schemaName, event);
}

export function parseFeedPayload(text) {
  let objects;
  try {
    objects = parseJsonOrNdjson(text);
  } catch (error) {
    return {
      events: [],
      errors: [{ index: -1, message: `Feed parse error: ${error.message}`, event_type: "" }],
    };
  }

  const events = [];
  const errors = [];

  objects.forEach((object, index) => {
    try {
      events.push(normalizeFeedEvent(object));
    } catch (error) {
      errors.push({
        index,
        message: error.message,
        event_type: object && typeof object === "object" ? object.type || "" : "",
      });
    }
  });

  return { events, errors };
}

function parseJsonOrNdjson(text) {
  if (typeof text !== "string" || !text.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }
}
