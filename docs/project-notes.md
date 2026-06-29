# Project Notes

This file records public execution notes that should remain easy to audit after individual pull requests are merged.

## 2026-06-29 Safety PR Review Trail

PR #51, `Harden public audio safety boundaries`, is complete and merged.

Completion evidence:

- draft PR opened from `codex/safety-audio-liability-hardening` into `main`;
- local verification passed with `npm --prefix apps/web run check`;
- GitHub Web checks and CodeQL passed before merge;
- PR #51 merged into `main` as `b44d7d7`;
- GitHub Pages deployment for PR #51 completed successfully;
- live portal validation passed against `https://cosmos-cqa.org` with HTTP smoke checks.

The merged safety layer added:

- `apps/web/safety.html`;
- `docs/public-safety.md`;
- loop-off default behavior for public audio;
- centralized audio frequency, gain, duration, and playback-rate limits;
- public copy boundaries for optional sonification;
- browser, unit, portal, and deployment validation coverage.

## Current Public-Surface Hardening Trail

Completed in PR #52:

- privacy and user-data wording;
- safety and accessibility issue-reporting templates;
- validation that reporting lanes remain available and non-confidential.

Post-merge evidence:

- local verification passed with `npm --prefix apps/web run check`;
- GitHub Web checks and CodeQL passed before merge;
- `main` was fast-forwarded locally to `946bea7`;
- main-branch CI, CodeQL, and GitHub Pages deployment passed after merge;
- live smoke checks passed for `user-data.html`, `safety.html`, and `contact.html`.

## Current Public Trust Operations Trail

Next hardening layer:

- `SECURITY.md` responsible disclosure routing;
- a public security/disclosure page;
- issue template chooser routing so private vulnerabilities and sensitive safety details are not filed as public issues;
- validation that security, safety, privacy, accessibility, and contact routes remain connected.
