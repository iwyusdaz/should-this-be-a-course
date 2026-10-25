---
title: "Mager & Pipe decision flow"
parent: "3. Analysis"
nav_order: 3
---

# The Mager & Pipe decision flow applied to Brightline

Mager & Pipe's *Analyzing Performance Problems* gives a sequence of questions for any performance gap: fix the environment first, test whether it's really a skill deficit ("could they do it if their life depended on it?"), and only then train — choosing between "can't do" remediations. The flowchart below runs Brightline's four causes through that procedure.

```mermaid
flowchart TD
    A[Start: managers do not give regular,\nstructured feedback] --> B{Do they know they are\nsupposed to - and what 'good'\nlooks like?}

    B -- "No: no defined expectation,\npolicy says only 'encouraged'" --> C[FAST FIX: define the cadence and\npublish a one-on-one standard\n+ template<br/>Owner: HR + COO]
    C --> D{Do they have the means -\ntime, tools, numbers of reports?}

    B -- Yes: managers can describe\ngood feedback --> D

    D -- "No: no rostered time, no template,\nspans of 12-18 (median 13)" --> E[FAST FIX: roster 2:1 meeting time,\nadopt template, review span of control\nflagged to leadership<br/>Owner: Ops directors]
    E --> F{If their life depended on it,\ncould they give structured\nfeedback tomorrow?}

    B -- n/a --> F
    D -- Yes --> F

    F -- "No - for SOME managers:\nnew cohort avoids hard\nconversations, cannot\nstructure them" --> G{Is the skill used often\nand is it worth practicing?}

    G -- "Yes: every fortnight,\ndrives retention" --> H[TRAINING - narrow: 15-min branching\nscenario practice + 'Feedback in\n5 minutes' job aid<br/>Owner: L&D]
    F -- Yes for most managers --> I{Are there obstacles in the\nsystem punishing the behavior?}

    I -- "Yes: scorecard 0% team development,\nthroughput rewarded, feedback risks\nconflict with no upside" --> J[FAST FIX: add team-development items\nto manager scorecards; recognize\nfeedback work<br/>Owner: COO + Ops]
    J --> K[Outcome: retention of behavior.\nRe-test in 90 days]
    H --> K
    C --> K
    E --> K
```

### Text summary of the diagram (for screen readers and plain reading)

1. **Start:** managers do not give regular, structured feedback.
2. **Do they know they're supposed to, and what good looks like?** Partly no: there is no defined expectation (the policy only "encourages" one-on-ones). Fast fix: define the cadence, publish a one-on-one standard and template. Owner: HR + COO.
3. **Do they have the means — time, tools, team size that permits it?** No: no rostered time, no template, spans of 12–18. Fast fix: roster the meeting time, adopt the template, and flag a span-of-control review to leadership. Owner: operations directors.
4. **If their life depended on it, could they give structured feedback tomorrow?** For most managers, yes — they can describe good feedback; they don't have the structure to do it in. For *some* (concentrated in the new-manager cohort), no: they avoid hard conversations and cannot structure one. That subset passes the skill test into training.
5. **Is the skill used often and worth practicing?** Yes — every fortnight, and it is tied to the retention result. So training is warranted, but *narrow*: a 15-minute branching scenario for practice plus a "Feedback in 5 minutes" job aid on the job. Owner: L&D.
6. **Are there obstacles in the system punishing the behavior?** Yes: scorecards carry 0% weight on team development while throughput is heavily rewarded. Fast fix: add team-development items to scorecards and recognize feedback work. Owner: COO + operations.
7. **Outcome:** the fixes reinforce each other; retention of the behavior is re-tested at 90 days (see the [measurement plan](../06-measure/measurement-plan.html)).

## Why this ordering matters

Mager & Pipe's discipline is that **training is the last check, not the first reflex**. Applied here, three of the four paths end in "fast fixes" (environment, process, incentives) and only one narrow path reaches training — and even that path pairs practice with a job aid rather than a course. Running the flow *after* the [BEM analysis](root-cause-bem.html) cross-checks the same evidence with an independent procedure; both agree.

> Diagram note: Mermaid diagrams are rendered from the text description above; if you use a screen reader, the numbered summary is the accessible version. The flow structure paraphrases Mager & Pipe's published model — see [ATTRIBUTION](https://github.com/iwyusdaz/should-this-be-a-course/blob/main/ATTRIBUTION.md).
