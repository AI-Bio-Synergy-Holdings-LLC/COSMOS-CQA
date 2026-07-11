# Wolfram Integration Boundary

Wolfram Alpha is a possible future external computational reference provider for the private COSMOS-CQA application. It is not active in the public repository, public demo, or GitHub Pages portal.

This document records the public boundary so that COSMOS-CQA can discuss the integration concept without creating legal, security, or scientific ambiguity.

## Current Public Status

- No Wolfram Alpha API client is included.
- No Wolfram MCP configuration is included.
- No API key, AppID, environment variable, or credential instructions are included.
- No Wolfram output, screenshots, response payloads, pods, subpods, or branded result formatting are included.
- No public-demo feature implies that Wolfram access is active.
- No COSMOS-CQA observation, label, diagnostic placeholder, or evidence bundle is described as validated by Wolfram.

## Legal And Rights Risks

Official Wolfram Alpha API terms require careful review before any live use. The public repository should avoid adding live access because the terms include obligations around permitted clients, attribution/linking, AppID security, quota compliance, no unauthorized caching, no redistribution or sublicensing of API/data content, no look-and-feel replication, and no use of service data for training AI models.

Production or institutional use may require commercial terms or a written agreement. A private COSMOS-CQA implementation should be reviewed against the active provider terms before any live request, storage, export, or public display behavior is enabled.

Useful official references:

- Wolfram Alpha API Terms of Use: https://products.wolframalpha.com/api/termsofuse
- Wolfram Alpha API Commercial Terms: https://products.wolframalpha.com/api/commercial-termsofuse
- Wolfram Alpha API overview: https://products.wolframalpha.com/api

## MCP Risks

MCP can be useful for connecting tools and data sources, but MCP proxy patterns can introduce authorization and consent risks when a server acts between a client and a third-party API. COSMOS-CQA should not add public MCP configuration for computational providers unless the steward has reviewed authentication, authorization, consent, logging, and credential boundaries.

Useful official references:

- MCP security best practices: https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices
- MCP authorization security considerations: https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization

## Public Repository Guardrail

The only public implementation artifact is a synthetic schema fixture under `examples/computational-references/`. It is not copied from Wolfram output, does not call a live service, and does not define an API client or MCP server.

Live Wolfram access, if ever pursued, belongs in the private application as a server-side, authenticated, audited, rate-limited integration with explicit provider-term review and clear language that computational references are not diagnostic validation.
