# Agile / Release Governance — KulePoshti

## Delivery model
Two-week product increments are allowed, but release is evidence-driven rather than calendar-driven.

### Workstreams
1. Product & UX
2. QC Domain / Medical & Operational Rules
3. ASR / Local AI
4. Data / Security / Audit
5. Reporting & Coaching
6. Reliability / E2E / Recovery

## Definition of Ready
A story enters development only when it has:
- domain owner;
- user outcome;
- rule/evidence source when QC-related;
- privacy classification;
- acceptance criteria;
- explicit fail-closed behavior.

## Definition of Done
A capability is Done only when:
- implementation compiled;
- unit/regression tests pass;
- desktop and mobile browser smoke pass;
- real user flow is exercised E2E;
- no silent fallback creates scores or data;
- docs/rule-pack/version updated;
- audit behavior defined;
- rollback/recovery impact understood.

## Release gates
G0 Compile → G1 Domain tests → G2 Browser E2E → G3 Public runtime smoke → G4 Gold/Calibration when AI quality changes.

## Severity
P0: privacy leak, data loss, wrong critical approval.
P1: review/score corruption, runtime crash, inability to process.
P2: report inconsistency or degraded UX.
P3: visual/polish issue.

## Scrum ceremonies
- Daily: blockers + gate state, not status theater.
- Refinement: source/rule evidence + UX flow.
- Review: demo real flow using non-sensitive or approved data.
- Retro: defects escaped, lead time, rework and calibration drift.
