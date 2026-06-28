export const CONTRACT_SCHEMA_VERSION = "cosmos-cqa.contracts.v0.1.0";

export const ARTIFACT_CLASSES = ["stripe", "dipole", "ringing", "point", "clean", "other"];
export const SEVERITY_LEVELS = ["low", "medium", "high"];
export const OVERLAY_TYPES = ["none", "gradient", "rings", "wavelet"];
export const PALETTES = ["gray", "viridis", "cividis"];
export const EXPERT_CLASSES = ["residual", "clean", "other"];
export const CHECKLIST_TARGET_MODES = ["manual", "bridge"];
export const CHECKLIST_AUTOMATION_STATES = ["manual", "planned", "automated"];
export const CHECKLIST_MIGRATION_STATES = ["tracked", "planned", "migrated"];

const idPattern = "^[A-Za-z0-9._:-]+$";
const checksumPattern = "^(sha256:[A-Za-z0-9._:-]+|)$";

export const schemas = {
  buildInfo: {
    $id: "cosmos-cqa/build-info.schema.json",
    type: "object",
    required: ["version", "sha", "dev"],
    additionalProperties: false,
    properties: {
      version: { type: "string", minLength: 1 },
      sha: { type: "string", minLength: 1 },
      dev: { type: "boolean" },
    },
  },

  truthRecord: {
    $id: "cosmos-cqa/truth-record.schema.json",
    type: "object",
    required: ["class", "severity"],
    additionalProperties: false,
    properties: {
      class: { type: "string", enum: ARTIFACT_CLASSES },
      severity: { type: "string", enum: SEVERITY_LEVELS },
    },
  },

  labelRecord: {
    $id: "cosmos-cqa/label-record.schema.json",
    type: "object",
    required: ["label_id", "tile_id", "dataset", "volunteer_id", "clazz", "severity", "note", "weight", "ts"],
    additionalProperties: false,
    properties: {
      label_id: { type: "string", pattern: "^lbl_[a-z0-9]{4,}$" },
      tile_id: { type: "string", minLength: 1, maxLength: 128, pattern: idPattern },
      dataset: { type: "string", minLength: 1, maxLength: 128 },
      volunteer_id: { type: "string", minLength: 1, maxLength: 128 },
      _truth: { anyOf: [{ $ref: "truthRecord" }, { type: "null" }] },
      clazz: { type: "string", enum: ARTIFACT_CLASSES },
      severity: { type: "string", enum: SEVERITY_LEVELS },
      note: { type: "string", maxLength: 240 },
      weight: { type: "number", minimum: 0, maximum: 1 },
      ts: { type: "string", format: "date-time" },
    },
  },

  labelExportRow: {
    $id: "cosmos-cqa/label-export-row.schema.json",
    type: "object",
    required: [
      "tile_id",
      "dataset",
      "volunteer_id",
      "clazz",
      "severity",
      "note",
      "weight",
      "ts",
      "expert_class",
      "expert_confidence",
      "expert_latency",
    ],
    additionalProperties: false,
    properties: {
      tile_id: { type: "string", minLength: 1, maxLength: 128, pattern: idPattern },
      dataset: { type: "string", minLength: 1, maxLength: 128 },
      volunteer_id: { type: "string", minLength: 1, maxLength: 128 },
      clazz: { type: "string", enum: ARTIFACT_CLASSES },
      severity: { type: "string", enum: SEVERITY_LEVELS },
      note: { type: "string", maxLength: 240 },
      weight: { anyOf: [{ type: "number", minimum: 0, maximum: 1 }, { type: "string", pattern: "^[0-9.]*$" }] },
      ts: { type: "string", format: "date-time" },
      expert_class: { anyOf: [{ type: "string", enum: EXPERT_CLASSES }, { type: "string", const: "" }] },
      expert_confidence: { anyOf: [{ type: "number", minimum: 0, maximum: 1 }, { type: "string", pattern: "^[0-9.]*$" }] },
      expert_latency: { anyOf: [{ type: "number", minimum: 0 }, { type: "string", pattern: "^[0-9.]*$" }] },
    },
  },

  feedTileEvent: {
    $id: "cosmos-cqa/feed-tile-event.schema.json",
    type: "object",
    required: ["type", "tile_id", "dataset", "checksum", "png"],
    additionalProperties: false,
    properties: {
      type: { type: "string", const: "tile" },
      tile_id: { type: "string", minLength: 1, maxLength: 128, pattern: idPattern },
      dataset: { type: "string", minLength: 1, maxLength: 128 },
      release: { type: "string", maxLength: 128 },
      doi: { type: "string", maxLength: 256 },
      band: { type: "string", minLength: 1, maxLength: 32 },
      ra: { type: "number", minimum: 0, maximum: 360 },
      dec: { type: "number", minimum: -90, maximum: 90 },
      overlay: { type: "string", enum: OVERLAY_TYPES },
      checksum: { type: "string", pattern: checksumPattern },
      png: { type: "string", pattern: "^data:image/png;base64,.+" },
    },
  },

  feedExpertEvent: {
    $id: "cosmos-cqa/feed-expert-event.schema.json",
    type: "object",
    required: ["type", "tile_id", "expert_class", "expert_confidence", "latency_s"],
    additionalProperties: false,
    properties: {
      type: { type: "string", const: "expert" },
      tile_id: { type: "string", minLength: 1, maxLength: 128, pattern: idPattern },
      expert_class: { type: "string", enum: EXPERT_CLASSES },
      expert_confidence: { type: "number", minimum: 0, maximum: 1 },
      note: { type: "string", maxLength: 240 },
      latency_s: { type: "number", minimum: 0 },
    },
  },

  feedEvent: {
    $id: "cosmos-cqa/feed-event.schema.json",
    anyOf: [{ $ref: "feedTileEvent" }, { $ref: "feedExpertEvent" }],
  },

  bookmarkPayload: {
    $id: "cosmos-cqa/bookmark-payload.schema.json",
    type: "object",
    required: ["schema_version", "dataset", "tile", "overlay", "palette", "captions", "env"],
    additionalProperties: false,
    properties: {
      schema_version: { type: "string", const: CONTRACT_SCHEMA_VERSION },
      dataset: {
        type: "object",
        required: ["name", "release", "doi", "tile_url"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 1, maxLength: 128 },
          release: { type: "string", minLength: 1, maxLength: 128 },
          doi: { type: "string", maxLength: 256 },
          tile_url: { type: "string", maxLength: 2048 },
        },
      },
      tile: {
        type: "object",
        required: ["id", "checksum"],
        additionalProperties: false,
        properties: {
          id: { type: "string", minLength: 1, maxLength: 128, pattern: idPattern },
          checksum: { type: "string", pattern: checksumPattern },
        },
      },
      overlay: { type: "string", enum: OVERLAY_TYPES },
      palette: { type: "string", enum: PALETTES },
      captions: { type: "boolean" },
      env: {
        type: "object",
        required: ["seed", "audio"],
        additionalProperties: false,
        properties: {
          seed: { type: "number", minimum: 0 },
          audio: {
            type: "object",
            required: ["map", "rate", "loop", "frames"],
            additionalProperties: false,
            properties: {
              map: { type: "string", const: "dft32_rowmeans" },
              rate: { type: "number", minimum: 0.1, maximum: 4 },
              loop: { type: "boolean" },
              frames: { type: "integer", minimum: 1, maximum: 10000 },
            },
          },
        },
      },
    },
  },

  tilePassport: {
    $id: "cosmos-cqa/tile-passport.schema.json",
    type: "object",
    required: [
      "schema_version",
      "tile_id",
      "dataset",
      "release",
      "band",
      "ra",
      "dec",
      "checksum",
      "truth",
      "provenance",
      "sidecars",
    ],
    additionalProperties: false,
    properties: {
      schema_version: { type: "string", const: CONTRACT_SCHEMA_VERSION },
      tile_id: { type: "string", minLength: 1, maxLength: 128, pattern: idPattern },
      dataset: { type: "string", minLength: 1, maxLength: 128 },
      release: { type: "string", minLength: 1, maxLength: 128 },
      doi: { type: "string", maxLength: 256 },
      band: { type: "string", minLength: 1, maxLength: 32 },
      ra: { type: "number", minimum: 0, maximum: 360 },
      dec: { type: "number", minimum: -90, maximum: 90 },
      checksum: { type: "string", pattern: checksumPattern },
      truth: { anyOf: [{ $ref: "truthRecord" }, { type: "null" }] },
      provenance: {
        type: "object",
        required: ["source", "generated_at"],
        additionalProperties: false,
        properties: {
          source: { type: "string", minLength: 1, maxLength: 256 },
          source_url: { type: "string", maxLength: 2048 },
          archive_path: { type: "string", maxLength: 2048 },
          generated_at: { type: "string", format: "date-time" },
          notes: { type: "string", maxLength: 1000 },
        },
      },
      sidecars: {
        type: "object",
        required: ["audio_map", "overlay_modes", "palette_modes"],
        additionalProperties: false,
        properties: {
          audio_map: { type: "string", minLength: 1, maxLength: 128 },
          overlay_modes: {
            type: "array",
            minItems: 1,
            items: { type: "string", enum: OVERLAY_TYPES },
          },
          palette_modes: {
            type: "array",
            minItems: 1,
            items: { type: "string", enum: PALETTES },
          },
          metrics: {
            type: "array",
            items: { type: "string", minLength: 1, maxLength: 128 },
          },
        },
      },
    },
  },

  sbomReference: {
    $id: "cosmos-cqa/sbom-reference.schema.json",
    type: "object",
    required: ["schema_version", "sbom_id", "format", "spec_version", "path", "checksum", "generated_at"],
    additionalProperties: false,
    properties: {
      schema_version: { type: "string", const: CONTRACT_SCHEMA_VERSION },
      sbom_id: { type: "string", pattern: "^sbom_[A-Za-z0-9._:-]+$" },
      format: { type: "string", const: "CycloneDX" },
      spec_version: { type: "string", minLength: 1, maxLength: 32 },
      path: { type: "string", minLength: 1, maxLength: 2048 },
      checksum: { type: "string", pattern: checksumPattern },
      generated_at: { type: "string", format: "date-time" },
      component_name: { type: "string", maxLength: 256 },
    },
  },

  corePackManifest: {
    $id: "cosmos-cqa/core-pack-manifest.schema.json",
    type: "object",
    required: [
      "schema_version",
      "manifest_id",
      "name",
      "version",
      "generated_at",
      "license",
      "steward",
      "tiles",
      "sbom_refs",
    ],
    additionalProperties: false,
    properties: {
      schema_version: { type: "string", const: CONTRACT_SCHEMA_VERSION },
      manifest_id: { type: "string", pattern: "^corepack_[A-Za-z0-9._:-]+$" },
      name: { type: "string", minLength: 1, maxLength: 256 },
      version: { type: "string", minLength: 1, maxLength: 128 },
      generated_at: { type: "string", format: "date-time" },
      license: { type: "string", minLength: 1, maxLength: 256 },
      steward: { type: "string", minLength: 1, maxLength: 256 },
      tiles: {
        type: "array",
        minItems: 1,
        items: { $ref: "tilePassport" },
      },
      sbom_refs: {
        type: "array",
        minItems: 1,
        items: { $ref: "sbomReference" },
      },
      evidence_refs: {
        type: "array",
        items: {
          type: "object",
          required: ["kind", "path"],
          additionalProperties: false,
          properties: {
            kind: { type: "string", minLength: 1, maxLength: 128 },
            path: { type: "string", minLength: 1, maxLength: 2048 },
          },
        },
      },
    },
  },

  checklistTestTargets: {
    $id: "cosmos-cqa/checklist-test-targets.schema.json",
    type: "object",
    required: [
      "schema_version",
      "source",
      "source_sha256",
      "legacy_claimed_total",
      "manual_target_count",
      "bridge_target_count",
      "targets",
    ],
    additionalProperties: false,
    properties: {
      schema_version: { type: "string", const: CONTRACT_SCHEMA_VERSION },
      source: { type: "string", minLength: 1, maxLength: 2048 },
      source_sha256: { type: "string", pattern: checksumPattern },
      legacy_claimed_total: { type: "integer", minimum: 0 },
      manual_target_count: { type: "integer", minimum: 0 },
      bridge_target_count: { type: "integer", minimum: 0 },
      targets: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["id", "source_line", "section", "label", "mode", "automation", "status"],
          additionalProperties: false,
          properties: {
            id: { type: "string", minLength: 1, maxLength: 256, pattern: idPattern },
            source_line: { type: "integer", minimum: 1 },
            section: { type: "string", minLength: 1, maxLength: 256 },
            label: { type: "string", minLength: 1, maxLength: 512 },
            mode: { type: "string", enum: CHECKLIST_TARGET_MODES },
            automation: { type: "string", enum: CHECKLIST_AUTOMATION_STATES },
            status: { type: "string", enum: CHECKLIST_MIGRATION_STATES },
            data_testid: { type: "string", pattern: idPattern },
          },
        },
      },
    },
  },

  cycloneDxSbom: {
    $id: "cosmos-cqa/cyclonedx-sbom.schema.json",
    type: "object",
    required: ["bomFormat", "specVersion", "version", "metadata", "components"],
    additionalProperties: true,
    properties: {
      bomFormat: { type: "string", const: "CycloneDX" },
      specVersion: { type: "string", minLength: 1 },
      version: { type: "integer", minimum: 1 },
      metadata: {
        type: "object",
        required: ["timestamp", "component"],
        additionalProperties: true,
        properties: {
          timestamp: { type: "string", format: "date-time" },
          component: {
            type: "object",
            required: ["type", "name", "version"],
            additionalProperties: true,
            properties: {
              type: { type: "string", minLength: 1 },
              name: { type: "string", minLength: 1 },
              version: { type: "string", minLength: 1 },
            },
          },
        },
      },
      components: {
        type: "array",
        items: {
          type: "object",
          required: ["type", "name", "version"],
          additionalProperties: true,
          properties: {
            type: { type: "string", minLength: 1 },
            name: { type: "string", minLength: 1 },
            version: { type: "string", minLength: 1 },
          },
        },
      },
    },
  },

  validationReport: {
    $id: "cosmos-cqa/validation-report.schema.json",
    type: "object",
    required: ["schema_version", "report_id", "generated_at", "build", "summary", "checks"],
    additionalProperties: false,
    properties: {
      schema_version: { type: "string", const: CONTRACT_SCHEMA_VERSION },
      report_id: { type: "string", pattern: "^rpt_[A-Za-z0-9._:-]+$" },
      generated_at: { type: "string", format: "date-time" },
      build: { $ref: "buildInfo" },
      summary: {
        type: "object",
        required: ["label_count", "feed_error_count", "pass_count", "fail_count"],
        additionalProperties: false,
        properties: {
          label_count: { type: "integer", minimum: 0 },
          feed_error_count: { type: "integer", minimum: 0 },
          pass_count: { type: "integer", minimum: 0 },
          fail_count: { type: "integer", minimum: 0 },
        },
      },
      checks: {
        type: "array",
        items: {
          type: "object",
          required: ["name", "status"],
          additionalProperties: false,
          properties: {
            name: { type: "string", minLength: 1, maxLength: 128 },
            status: { type: "string", enum: ["pass", "fail", "warn"] },
            detail: { type: "string", maxLength: 1000 },
          },
        },
      },
    },
  },
};

export function validateContract(name, value) {
  const schema = schemas[name];
  if (!schema) {
    throw new Error(`Unknown COSMOS-CQA contract schema: ${name}`);
  }

  const errors = [];
  validateAgainstSchema(schema, value, name, errors);
  return { valid: errors.length === 0, errors };
}

export function assertContract(name, value) {
  const result = validateContract(name, value);
  if (!result.valid) {
    const details = result.errors.map((error) => `${error.path}: ${error.message}`).join("; ");
    throw new TypeError(`Invalid ${name} contract: ${details}`);
  }
  return value;
}

export function isValidContract(name, value) {
  return validateContract(name, value).valid;
}

function validateAgainstSchema(schema, value, path, errors) {
  if (schema.$ref) {
    validateAgainstSchema(resolveRef(schema.$ref), value, path, errors);
    return;
  }

  if (schema.anyOf) {
    const branchResults = schema.anyOf.map((branch) => {
      const branchErrors = [];
      validateAgainstSchema(branch, value, path, branchErrors);
      return branchErrors;
    });
    if (branchResults.some((branchErrors) => branchErrors.length === 0)) {
      return;
    }
    errors.push({
      path,
      message: `must match one of: ${schema.anyOf.map((branch) => branch.$ref || branch.type || "schema").join(", ")}`,
    });
    return;
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push({ path, message: `expected ${schema.type}, got ${describeType(value)}` });
    return;
  }

  if (schema.const !== undefined && value !== schema.const) {
    errors.push({ path, message: `expected constant ${JSON.stringify(schema.const)}` });
  }

  if (schema.enum && !schema.enum.some((item) => Object.is(item, value))) {
    errors.push({ path, message: `expected one of ${schema.enum.join(", ")}` });
  }

  if (typeof value === "string") {
    validateString(schema, value, path, errors);
  }

  if (typeof value === "number") {
    validateNumber(schema, value, path, errors);
  }

  if (Array.isArray(value)) {
    validateArray(schema, value, path, errors);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    validateObject(schema, value, path, errors);
  }
}

function validateString(schema, value, path, errors) {
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push({ path, message: `must be at least ${schema.minLength} characters` });
  }
  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    errors.push({ path, message: `must be no more than ${schema.maxLength} characters` });
  }
  if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
    errors.push({ path, message: `must match ${schema.pattern}` });
  }
  if (schema.format === "date-time" && Number.isNaN(Date.parse(value))) {
    errors.push({ path, message: "must be an ISO date-time string" });
  }
}

function validateNumber(schema, value, path, errors) {
  if (!Number.isFinite(value)) {
    errors.push({ path, message: "must be finite" });
    return;
  }
  if (schema.minimum !== undefined && value < schema.minimum) {
    errors.push({ path, message: `must be >= ${schema.minimum}` });
  }
  if (schema.maximum !== undefined && value > schema.maximum) {
    errors.push({ path, message: `must be <= ${schema.maximum}` });
  }
}

function validateArray(schema, value, path, errors) {
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    errors.push({ path, message: `must contain at least ${schema.minItems} items` });
  }
  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    errors.push({ path, message: `must contain no more than ${schema.maxItems} items` });
  }
  if (schema.items) {
    value.forEach((item, index) => validateAgainstSchema(schema.items, item, `${path}[${index}]`, errors));
  }
}

function validateObject(schema, value, path, errors) {
  const properties = schema.properties || {};
  for (const key of schema.required || []) {
    if (!hasOwn(value, key) || value[key] === undefined) {
      errors.push({ path: `${path}.${key}`, message: "is required" });
    }
  }

  if (schema.additionalProperties === false) {
    for (const key of Object.keys(value)) {
      if (!hasOwn(properties, key)) {
        errors.push({ path: `${path}.${key}`, message: "is not allowed" });
      }
    }
  }

  for (const [key, propertySchema] of Object.entries(properties)) {
    if (value[key] !== undefined) {
      validateAgainstSchema(propertySchema, value[key], `${path}.${key}`, errors);
    }
  }
}

function matchesType(value, type) {
  if (Array.isArray(type)) {
    return type.some((entry) => matchesType(value, entry));
  }
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "null") return value === null;
  if (type === "object") return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  return typeof value === type;
}

function describeType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function resolveRef(ref) {
  const key = ref.replace(/^#?\//, "").replace(/^schemas\//, "");
  const schema = schemas[key];
  if (!schema) {
    throw new Error(`Unknown schema reference: ${ref}`);
  }
  return schema;
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}
