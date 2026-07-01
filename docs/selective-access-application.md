# Selective Access Application Notice

COSMOS-CQA's public repository and hosted demo remain local-first public research infrastructure. The public demo does not authenticate users, collect observations, assign reviewer queues, transmit reviewer packets, or operate a server-side workspace.

A separate COSMOS-CQA application is planned for verified researchers and institutions. That selective-access application is expected to be handled outside the public demo surface and should not be described as available until access terms, data handling, security controls, and operational responsibilities are ready.

## Public Wording

Use language such as:

```text
A separate COSMOS-CQA application is planned for verified researchers and institutions. The public demo remains local-first and does not authenticate users, collect observations, or transmit review packets.
```

Avoid language such as:

```text
Researcher access is open now.
Observations are submitted to COSMOS-CQA reviewers.
Institutional review is available through the public demo.
```

Those claims require a separate authenticated application, access process, and operational policy.

## Public Demo Boundary

- Public workbench: static, local-first, research-only demo.
- Reviewer handoff packets: local JSON artifacts for replay/testing.
- Selective-access application: separate future surface for verified researchers and institutions.
- Public documentation: may point to the planned selective-access lane, but should not publish backend architecture, access promises, or operational timelines prematurely.

This notice complements `docs/reviewer-access-boundary.md`, `docs/data-governance.md`, and `docs/public-portal.md`.
