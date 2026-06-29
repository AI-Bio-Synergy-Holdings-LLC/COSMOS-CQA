# Security Policy

COSMOS-CQA is stewarded by AI-Bio Synergy Holdings LLC under the
COSMOS-CQA Research-Only Public License. This policy defines the public
trust and disclosure route for security, safety, accessibility, and
data-handling concerns.

## Supported Scope

Security reporting currently covers:

- the static public portal at `https://cosmos-cqa.org`;
- the browser research workbench in `apps/web`;
- shared packages in `packages/core` and `packages/schemas`;
- repository workflows, issue templates, release artifacts, examples,
  schemas, and documentation;
- public safety boundaries, including optional audio sonification,
  visual review surfaces, local-first data handling, and public claim
  limits.

COSMOS-CQA is not approved for production deployment, clinical use,
regulated use, diagnostic use, or hosted service operation under the
research-only public license.

## Private Vulnerability Reporting

Do not open public issues for vulnerabilities that could expose users,
credentials, private data, restricted datasets, deployment
infrastructure, or reproducible exploit steps.

Report security vulnerabilities privately through the GitHub security
advisory workflow when available, or by emailing:

`cosmos-cqa-developer@ai-biosynergyholdings.com`

Use the subject prefix `COSMOS-CQA vulnerability report`. Include a
minimal, non-confidential summary, affected surface, impact, browser or
runtime context, and whether private reproduction details are available
on request.

## Public Safety And Accessibility Reports

Use the public issue templates only when the report can be shared without
sensitive details. Public reports are appropriate for:

- audio, visual, or interaction safety wording that should be clearer;
- accessibility barriers that can be reproduced with non-sensitive
  examples;
- usability issues in the public portal or hosted demo;
- documentation gaps in public safety, data-use, or claim boundaries.

If a safety or accessibility report requires personal health
information, regulated data, private screenshots, restricted datasets,
or confidential institutional context, use the private contact route
instead and redact the public summary.

## Data Safety

Do not submit:

- credentials, tokens, passwords, private keys, or session cookies;
- personally identifying information or personal health information;
- restricted dataset copies or unpublished institutional datasets;
- regulated, export-controlled, or controlled-access materials;
- private source code, private repository links, or deployment secrets;
- medical, audiology, legal, investment, valuation, transaction, or
  diligence materials.

## Coordinated Disclosure Expectations

AI-Bio Synergy Holdings LLC will triage responsible reports as capacity
allows. The project does not currently offer a bug bounty, service-level
agreement, production incident response commitment, or guarantee of a
private reply to every public report.

Responsible disclosure means:

- do not publish exploit details before the steward has had a reasonable
  opportunity to review;
- do not disrupt the public portal, repository, GitHub Pages deployment,
  or third-party services;
- do not attempt to access, modify, retain, or disclose data that does
  not belong to you;
- do not use high-volume scans, denial-of-service tests, spam, social
  engineering, or physical attacks.

When a report can be fixed publicly, the steward may open or reference a
sanitized issue or pull request that avoids sensitive reproduction
details.
