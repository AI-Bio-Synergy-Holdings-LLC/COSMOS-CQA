# Controlled Restart Charter: COSMOS-CQA

Date: 2026-08-13

Repository: `AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA`

Baseline default head: `8b7174dab0ea4176f2823828f75abb8120adb6e7`

Operational project ID: `cosmos-cqa`

Asset registry ID: unassigned

## Decision

The completed QS-DMSS bounded delivery and its protected central-ledger
closeout satisfy the prerequisite for one further repository admission. The
owner explicitly authorized proceeding with the implementation order that
places COSMOS-CQA next.

This protected charter admits exactly one repository to the next controlled
engineering step. COSMOS-CQA remains `PENDING_KICKOFF` until this charter
reaches `main` through the normal protected merge path. That merge changes
only COSMOS-CQA to `ACTIVE_CONTROLLED`.

At the exact signed PR head, every required check passed and no review thread
existed, but GitHub correctly refused a direct merge and required its protected
auto-merge route. Repository auto-merge was disabled at the captured baseline.
This charter therefore authorizes enabling that one repository setting as a
pre-admission merge-control bootstrap. Auto-merge must be activated explicitly
for this PR and remains subject to all branch protection, exact-head checks,
and conversation-resolution rules. It is not an admin bypass and does not
authorize autonomous runtime, release, or deployment action.

After protected merge, the only engineering-active repositories are:

1. `AI-Bio-Synergy-Holdings-LLC/portfolio-control-plane`
2. `AI-Bio-Synergy-Holdings-LLC/lumical-studio`
3. `AI-Bio-Synergy-Holdings-LLC/QS-DMSS`
4. `AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA`

Every other organization repository remains `PENDING_KICKOFF`. The canonical
public-website monorepo is owned by a personal GitHub account, remains outside
the 42-repository organization census, and is not an engineering admission.

## Asset-identity boundary

The repository slug and project name are technical identifiers only. They are
not a registered asset name or an asset-ownership mapping. `assetRegistryId`
remains null and the asset-mapping status remains `UNASSIGNED`.

Any future asset reference must use a separately authorized registry ID. This
charter does not create or infer one.

## First bounded delivery

Once this charter is merged, COSMOS-CQA may have one protected feature pull
request active at a time. The first delivery is limited to deterministic
integrity receipts for existing COSMOS-CQA evidence bundles.

Authorized work is limited to:

- a closed, versioned receipt contract that identifies the evidence-bundle
  contract version, bundle ID, canonical byte length, and SHA-256 digest;
- deterministic receipt creation from the existing canonical evidence-bundle
  serialization;
- local, non-executing verification that rejects malformed receipts,
  non-canonical bundles, identifier drift, length mismatch, and digest
  mismatch before any state mutation;
- a bounded browser or package surface for exporting and checking the receipt,
  without network submission, authentication, or new runtime dependencies;
- golden fixtures, negative-path tests, CI, and documentation needed to prove
  deterministic round trips and tamper detection; and
- explicit wording that a checksum receipt proves byte-level consistency, not
  authorship, authenticity, scientific validity, production readiness, or
  regulatory suitability.

The feature may verify the integrity of an existing evidence bundle. It may
not reinterpret bundle contents or certify an observation, diagnostic,
review, consensus result, source dataset, or scientific conclusion.

This charter pull request contains governance records only. It does not alter
runtime behavior, dependencies, scientific algorithms, claims, releases, or
deployment configuration.

## Retained prohibitions

The following remain prohibited:

- scientific-validation, authenticity, authorship, certification, regulatory,
  production-readiness, or survey-performance claims based on the receipt;
- changing evidence-bundle semantics, scientific conclusions, diagnostic
  behavior, observation interpretation, or claim boundaries in the first
  bounded delivery;
- importing or repairing executable CSSFP/Core Pack diagnostics before the
  existing provenance, rights, fixture, and scientific-review gates pass;
- adding a backend, database, account system, identity provider, partner-data
  lane, server submission, private-application implementation, or live
  external computational integration;
- publishing a release or package, changing production deployment authority,
  or adding autonomous runtime, release, or deployment actions; protected
  GitHub auto-merge is the sole repository-setting exception authorized here;
- any Holdings connector, credential, mount, token, network path, or private
  asset-data access;
- Control Plane repository execution, actuation, automated merge, deployment,
  transaction, diligence, or Gate 6 authority;
- representing an internal development identifier as registered asset
  identity;
- admin bypass, force push, history rewrite, unprotected merge, or weakened
  required checks; and
- activating another repository without a separate protected charter and
  explicit owner approval.

## Entry controls

The admission baseline captured at `2026-08-14T02:00:31.0010080Z` is:

- default branch `main` at `8b7174dab0ea4176f2823828f75abb8120adb6e7`;
- exact-head status rollup `SUCCESS`;
- zero open pull requests;
- strict required `Web checks`, `Analyze (javascript-typescript)`,
  `Analyze (actions)`, `policy / Organization baseline`, and
  `metadata / PR metadata` checks pinned to GitHub Actions app `15368`;
- zero open high or critical Dependabot alerts;
- zero open CodeQL alerts;
- zero open secret-scanning alerts;
- Dependabot security updates, secret scanning, and push protection enabled;
- repository auto-merge disabled at capture; this charter authorizes enabling
  it only as a protected merge-control bootstrap;
- successful public-portal deployment verification on run `30781005088`;
- successful exact-head main CI on run `30781005082`; and
- successful latest scheduled CodeQL runs `31569185478` and `31384059220`.

## Exit criteria for the first bounded delivery

The delivery is complete only when:

1. the pull request is exact-head and all required checks are successful;
2. repository health, source checks, contract tests, unit tests, replay tests,
   browser tests, legacy checks, and applicable build/deployment validation
   pass;
3. high and critical dependency, CodeQL, and secret-scanning findings remain
   zero unless separately accepted in a protected risk record;
4. the receipt contract is deterministic, dependency-free, documented, and
   tested against malformed, non-canonical, identifier-drifted, length-
   mismatched, and tampered inputs;
5. no authenticity, authorship, scientific-validation, production-readiness,
   or certification claim is created;
6. no backend, provider, authentication, private-application, Holdings,
   execution, actuation, deployment-authority, or Gate 6 path is introduced;
7. the public static deployment and exact-head main rollup are green after the
   protected merge;
8. the audit log contains no `protected_branch.policy_override` event for the
   charter merge;
9. the observe-only Control Plane records a signed review; and
10. the central organization ledger records the result through a protected
   pull request.

## Operating limit

This admission raises the organization from exactly three to exactly four
engineering-active repositories. A fifth repository cannot enter engineering
until COSMOS-CQA completes this bounded delivery, the Control Plane and central
ledger record the result, and the owner explicitly authorizes another charter.
