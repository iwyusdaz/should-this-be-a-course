# Findings log and revision ledger (template)

One log per usability round (or per review round — the agent review and the AI panel use the same template). The point of the ledger: **every high/medium finding either triggers a documented revision or records why it didn't.** Nothing gets lost between "we heard it" and "we changed it".

## Round metadata

| Field | Value |
|---|---|
| Round / date | |
| Method (human sessions / agent review / AI panel) | |
| Participants or reviewers (P1…P5 / model + role) | |
| Artifacts tested | |
| Facilitator / run by | |

## Findings

| # | Participant / reviewer | Decision point or location | Observation (what happened, what was said) | Category (realism / choice difficulty / obviousness / wording / navigation / emotion) | Severity (high / med / low) | Proposed revision |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |

**Severity guide:** *high* = blocks or misleads most participants; *medium* = confuses several / a stakeholder would notice; *low* = polish.

## Revision ledger

| Finding # | Severity | Revision made (what changed, where) | Re-tested? (which check now covers it) | Date |
|---|---|---|---|---|
| | | | | |

## Already-known issues (do not re-log, do check for worsening)

| Known issue | Status | Notes from this round |
|---|---|---|
| SugarCube does not emit `:passagedisplay` for the opening passage (first-load focus handled by a safety net) | Fixed + covered by scripted focus test | |
| ASCII quotes inside `[[link->target]]` markup break SugarCube link parsing (typographic quotes used) | Fixed + covered by all-paths test | |
| 4-column tables overflow a 320px viewport (Debrief rebuilt as headed lists) | Fixed + covered by reflow test | |
| Light sidebar needs its own link colors (theme assumed dark) | Fixed + covered by axe audit | |

## Writing up

1. Group findings by category; quote sparingly and anonymously.
2. List the revisions in the usability test report (`docs/06-measure/usability-test-report.md`) with the re-test evidence.
3. Update `STATUS.md` and the README evaluation-status line if the overall status changes.
