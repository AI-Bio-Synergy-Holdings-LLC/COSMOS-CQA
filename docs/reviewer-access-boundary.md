# Reviewer Access Boundary

COSMOS-CQA currently provides local research review mechanics, not authenticated reviewer access.

The public workbench can create tile observations, edit review fields, record adjudication queue placeholder decisions, export evidence bundles, and prepare reviewer handoff packets. Those features are useful for research workflow design and deterministic replay, but they do not prove reviewer identity, qualification, assignment, or scientific consensus.

A separate selective-access COSMOS-CQA application is planned for verified researchers and institutions. That application is outside the current public demo and should not be described as available through the static portal.

## Current Boundary

- The hosted portal is static and local-first.
- Reviewer identity fields are metadata inside exported JSON.
- No account system, reviewer login, role-based authorization, server queue, or live reviewer assignment service is active.
- No observation is transmitted when a user clicks Prepare Reviewer Handoff JSON or Export Local Review Return JSON.
- Import Review Packet loads a validated local JSON packet into the browser for replay/testing.

## Packet Contracts

PR #62 adds reviewer handoff contracts:

- `reviewerIdentityClaim`: reviewer id, role, display name, auth state, optional provider metadata, and claim-boundary text.
- `reviewDataUseConsent`: local research-review consent/data-use posture with no personal data by default.
- `reviewAssignment`: source session/bundle ids, source hashes, tile ids, observation ids, task text, transport state, research-only license, and claim boundary.
- `reviewIntakeEnvelope`: local handoff packet containing an evidence bundle and assignment metadata.
- `reviewReturnEnvelope`: local return packet containing a research session with returned observation review events.

Both packet envelopes require:

- `authenticated_access: false`
- `network_submission: false`
- `transport_state: "local-export"` for the current static portal path

These fields are intentional guardrails. A future service boundary must not silently reinterpret current local packets as authenticated expert review.

## Future Authenticated Lane

A production-grade reviewer lane would need a separate service layer with:

- OAuth/OIDC or equivalent identity verification;
- role and qualification checks for reviewers, adjudicators, and stewards;
- server-side assignment and queue state;
- append-only review event storage;
- submission rate limits and abuse controls;
- private storage and retention rules;
- consent capture and data-use policy enforcement;
- audit logs that bind packet hashes to verified reviewer identities;
- security review before public deployment.

Until that service exists, COSMOS-CQA should describe review/adjudication as local research workflow evidence only.

## Public Copy Rule

Use language such as:

```text
Reviewer handoff packets are local research artifacts. The public portal does not authenticate reviewers, assign expert queues, or transmit observations to a remote review service.
```

Avoid language such as:

```text
Submitted to expert reviewers.
Authenticated review complete.
Consensus validated.
```

Those claims require a verified reviewer pipeline and independent scientific review.
