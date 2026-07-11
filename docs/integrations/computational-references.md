# External Computational References

COSMOS-CQA may eventually compare research workflow outputs with optional computational references. This lane is a contract and safety boundary, not a live integration in the public repository or public demo.

## Purpose

The `computationalReference` contract gives the project a controlled place to describe a reference calculation, its assumptions, its provider posture, and its claim boundaries. It is intended for reproducible research notes, private application review, and future audited integrations.

In the public repository, computational references are limited to synthetic fixtures and documentation. They do not run network requests, load third-party tools, or display external service results.

## Public Repository Rules

- No API clients, endpoint code, request builders, proxies, or polling loops.
- No MCP server configuration, MCP manifest, tool registration, or connector setup.
- No API keys, key names, environment variable instructions, credential handling, or sample secrets.
- No copied third-party response payloads, screenshots, branded output, or service-specific result formatting.
- No public-demo UI that implies an external computational service is active.
- No claim that an external computational reference validates COSMOS-CQA observations, diagnostics, labels, or evidence bundles.

The public fixture in `examples/computational-references/synthetic-computational-reference.json` is authored synthetic content. It exists only to test the schema and guardrails.

## Contract Boundary

The schema requires explicit flags for the public posture:

- `synthetic_fixture: true`
- `live_api_call: false`
- `api_client_implemented: false`
- `mcp_config_included: false`
- `external_content_copied: false`
- `diagnostic_validation: false`
- `training_data_use: false`

These constants are intentional. Any future live computational reference belongs in the private application unless the steward makes a separate rights, security, privacy, and scientific review decision.

## Private Application Note

If live computational services are later used in the selective-access application, they should be server-side only, authenticated, rate-limited, logged, and reviewable. Requests should avoid personal data and should record enough metadata for audit without storing restricted provider content beyond the permitted use.

Private implementation review should cover:

- provider terms, attribution, caching, redistribution, and commercial-use limits;
- identity, access control, secret storage, and per-institution authorization;
- prompt or query safety, output review, and error handling;
- whether any result can be exported, cited, cached, or included in evidence bundles;
- explicit language that references are not diagnostic validation.

## Verification

Run the contract tests from the repository root:

```bash
npm --prefix apps/web run test:contracts
```

The tests assert that the public fixture is synthetic, non-live, non-diagnostic, and not an API client or MCP configuration.
