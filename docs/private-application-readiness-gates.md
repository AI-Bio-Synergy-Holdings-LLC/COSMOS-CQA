# Private Application Readiness Gates

Status: planning checklist

Owner and steward: AI-Bio Synergy Holdings LLC

Companion map: `docs/private-application-transition-map.md`

This checklist converts the private-application transition map into auditable stage gates. It does not authorize access, implementation, deployment, partner commitments, or real-data processing.

## Gate Policy

- Implementation may begin only after Gates 0 and 1 are approved.
- Synthetic-data integration may begin after Gate 2.
- Partner accounts and a synthetic partner sandbox are prohibited until Gate 5 is approved.
- Real partner data and a controlled research pilot are prohibited until Gate 6 is approved in writing.
- Every exception requires a named risk owner, scope, expiration date, compensating control, and steward approval.

## Gate 0: Transition Authorization

Status: not started

Required evidence:

- [ ] Private application charter states purpose, users, research-only claims, non-goals, and success measures.
- [ ] AI-Bio Synergy Holdings LLC approves the private repository, IP boundary, access model, and release authority.
- [ ] Public `v0.1.4-research-alpha` or a later approved tag is selected as the pinned baseline.
- [ ] Private repository visibility, administrators, CODEOWNERS, branch rules, secret scanning, CodeQL, dependency review, and backup ownership are defined.
- [ ] Private license, confidentiality, contribution, and partner-access terms are identified for counsel review.
- [ ] Public-to-private and private-to-public contribution rules are approved.
- [ ] No partner data, credentials, or confidential material is present in initial scaffolding.

Exit decision: steward signs the transition charter and records the approved public baseline.

## Gate 1: Architecture And Threat Model

Status: not started

Required evidence:

- [ ] Architecture decision record approves the modular-monolith starting point or documents a justified alternative.
- [ ] Trust-boundary and data-flow diagrams cover browser, identity provider, application boundary, storage, jobs, audit, administration, and external adapters.
- [ ] Threat model covers tenant isolation, broken object authorization, identity takeover, malicious files, data exfiltration, queue abuse, supply chain, insider access, and audit tampering.
- [ ] NIST CSF 2.0 current and target profiles are scoped at an appropriate level.
- [ ] OWASP ASVS 5.0.0 verification target and versioned evidence format are selected.
- [ ] Environment separation, secret management, service identities, encryption, logging, backup, restore, and incident ownership are decided.
- [ ] Deployment-specific details are stored only in the private environment.
- [ ] Open architecture and security decisions have owners and due dates.

Exit decision: steward and security owner approve the architecture and initial risk register.

## Gate 2: Identity And Authorization Foundation

Status: not started

Required evidence:

- [ ] Digital identity risk assessment records intended users, impacts, and selected identity, authentication, and federation assurance targets.
- [ ] Managed OIDC or SAML identity provider is selected; no custom password store is introduced.
- [ ] Invitation, affiliation verification, terms acceptance, activation, access review, suspension, revocation, recovery, and institutional departure flows are specified.
- [ ] MFA or passkey policy is defined for all roles and required for privileged roles.
- [ ] Organization, workspace, project, dataset, assignment, artifact, observation, review, report, and export authorization rules are deny-by-default.
- [ ] Human and service identities are separated.
- [ ] Role matrix covers steward, institutional administrator, project owner, researcher, reviewer, adjudicator, data steward, auditor, and service identities.
- [ ] Object-level and cross-tenant negative tests exist for every protected resource type.
- [ ] Privileged changes and break-glass access create immutable audit evidence.

Exit decision: synthetic identity and tenant-isolation tests pass with no unresolved critical or high-severity findings.

## Gate 3: Data Governance And Evidence Foundation

Status: not started

Required evidence:

- [ ] Public, internal, confidential research, and restricted/regulated classes are approved.
- [ ] Restricted or regulated data remains excluded by default.
- [ ] Dataset intake record captures source authority, rights, purpose, classification, checksum, provenance, residency, retention, export, deletion, and owner.
- [ ] Identity evidence is separated from research observations wherever practical.
- [ ] Storage, cache, logs, search, queues, exports, and backups enforce tenant boundaries.
- [ ] Artifact versioning and provenance preserve public schema version, source hash, transformation, actor, project, and application release.
- [ ] Retention schedules exist by artifact class.
- [ ] Backup restoration, integrity verification, tenant-scoped export, and deletion are tested with synthetic data.
- [ ] Audit records are append-only, access-controlled, retained, and exportable for authorized review.
- [ ] Data incident, legal hold, partner exit, and backup-expiry responsibilities are documented.

Exit decision: data steward signs the synthetic-data lifecycle test report.

## Gate 4: Public Contract And Research Workflow Parity

Status: not started

Required evidence:

- [ ] Public schemas and core helpers are imported from an exact tag/hash with a provenance manifest.
- [ ] Compatibility tests cover Core Pack manifests, tile passports, labels, observations, review events, reports, sessions, reviewer packets, SBOM references, and evidence bundles.
- [ ] Public truth-label, audio-safety, claim-boundary, and deterministic-replay policies remain enforced where applicable.
- [ ] Authenticated workflow events extend public contracts without silently reinterpreting local public packets.
- [ ] Create, edit, delete, restore, assignment, review, adjudication, and export histories replay deterministically.
- [ ] Diagnostic and computational-reference outputs remain caveated research artifacts.
- [ ] Evidence exports include actor, organization, project, policy, schema, source, checksum, review, and application release context.
- [ ] Public/private contract drift has an explicit review and upgrade process.

Exit decision: synthetic end-to-end evidence bundle passes schema, replay, authorization, provenance, and export review.

## Gate 5: Partner And Protocol Readiness

Status: not started

Required evidence:

- [ ] Partner qualification packet identifies sponsor, purpose, users, roles, datasets, security, accessibility, residency, retention, export, publication, IP, and support expectations.
- [ ] Non-confidential first-contact rule remains in place.
- [ ] Confidentiality, research collaboration, data-use, processing, publication, IP, and support terms are reviewed as applicable.
- [ ] Responsible institution records ethics or human-subject review determination when relevant.
- [ ] Partner and steward name institutional administrator, project owner, data steward, security contact, and incident contact.
- [ ] Workspace policy, permitted datasets, reviewer qualifications, adjudication rules, and export approvals are configured.
- [ ] Partner receives security, privacy/data, acceptable-use, safety, accessibility, citation, and claim-boundary notices.
- [ ] Offboarding, data return/destruction, account revocation, and publication disposition are agreed.

Exit decision: written onboarding authorization permits partner accounts in a synthetic sandbox only. It does not authorize real partner data.

## Gate 6: Operational Pilot Readiness

Status: not started

Required evidence:

- [ ] Synthetic sandbox acceptance testing is complete.
- [ ] CI, security verification, dependency/SBOM review, migration checks, and deployment evidence are green.
- [ ] Monitoring, alert routing, audit review, incident triage, backup restore, access revocation, and partner offboarding exercises pass.
- [ ] Rate, quota, job timeout, file-size, export, and abuse boundaries are configured.
- [ ] Support hours, response expectations, maintenance windows, release process, rollback, and change notification are documented without unsupported service promises.
- [ ] Known limitations and residual risks have named owners and dispositions.
- [ ] Accessibility and audio-safety checks pass for the private interface.
- [ ] Pilot protocol defines dataset, users, duration, success measures, stop conditions, and publication/claim review.

Exit decision: steward, security owner, data steward, and partner sponsor approve a time-bounded pilot.

## Gate 7: Controlled Research Operation

Status: not started

Required evidence:

- [ ] Periodic access, role, data, vulnerability, dependency, audit, and partner reviews are scheduled.
- [ ] Security and privacy metrics are reviewed against the target profile.
- [ ] Contract migrations and public baseline updates preserve replay evidence.
- [ ] Partner incidents, exceptions, exports, publications, and offboarding are documented.
- [ ] Scientific claims remain subject to protocol, uncertainty, reproducibility, and independent review.
- [ ] Expansion to new partners, datasets, regions, or integrations repeats the applicable gates.

Exit decision: controlled research operation continues only while gate evidence remains current.

## Private Tracker Seed

Create these issues in the private repository after Gate 0. Do not open implementation-detail issues in the public tracker.

| ID | Private issue | Minimum acceptance evidence |
| --- | --- | --- |
| P-001 | Establish private repository and stewardship controls | Branch rules, CODEOWNERS, security tooling, private license/access files, clean secret scan |
| P-002 | Record application architecture decision | Approved modular-monolith ADR, dependency boundaries, deployment decision backlog |
| P-003 | Produce threat model and target security profile | Data flows, abuse cases, risk owners, NIST CSF target, ASVS target |
| P-004 | Define identity assurance and account lifecycle | IdP decision, assurance targets, invitation/recovery/revocation, MFA policy |
| P-005 | Implement organization and resource authorization model | Role matrix, deny-by-default policy, object-level and cross-tenant tests |
| P-006 | Define data lifecycle and dataset intake record | Classification, rights, retention, deletion, export, residency, provenance |
| P-007 | Implement immutable audit and review event model | Actor/resource/policy context, integrity, retention, authorized export |
| P-008 | Pin public contracts and add drift gate | Public tag/hash manifest, compatibility suite, upgrade procedure |
| P-009 | Build synthetic end-to-end research workflow | Intake through evidence export with deterministic replay and no network ambiguity |
| P-010 | Create partner qualification and onboarding packet | Sponsor, protocol, data, security, ethics, agreements, roles, offboarding |
| P-011 | Exercise operations and recovery | Monitoring, incident, restore, revocation, deletion, rollback, partner notification |
| P-012 | Gate external computational integrations | Server-side adapter, terms review, secrets, rate limit, audit, scientific caveat |

## Decision Evidence Template

Every gate decision should record:

```text
Gate:
Decision: approved | approved with exception | rejected
Date:
Scope:
Evidence links:
Risk owner:
Exceptions and expiration:
Approvers:
Next review:
```

## Immediate Next Actions

1. Review and approve the public/private repository boundary.
2. Select the private repository name, owner, administrators, and access policy without publishing its location here.
3. Draft the private application charter and initial role matrix.
4. Select one representative partner profile and one synthetic Core Pack workflow for planning.
5. Complete Gate 0 before scaffolding application code.
6. Complete the architecture ADR and threat model before choosing hosting or identity vendors.
