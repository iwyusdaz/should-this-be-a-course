# Manual VoiceOver check — "The Handover Problem" (macOS)

**Status: NOT performed.** Guidepup/VoiceOver automation does not function on the build machine's macOS version, so no VoiceOver testing has been done and none is claimed anywhere in this repository. This protocol exists so a human can run the check in ~20 minutes.

Run on macOS with Safari or Chrome, VoiceOver on (Cmd+F5). Where results are marked `[ ]`, record what you actually heard.

## Setup

1. System Settings → Accessibility → VoiceOver → enable "Use trackpad/keyboard commander" defaults; keep the rotor available.
2. Open `docs/05-build/scenario/index.html`. Wait for the passage to render.
3. Announce: "I'm testing how the scenario sounds with a screen reader."

## Checks

### A. Page load and title
- [ ] VoiceOver announces the page/story title ("The Handover Problem — a branching scenario") on load.
- [ ] The opening passage heading ("Monday, 07:42") is announced (the focus lands on it; VO speaks "heading level 2, Monday, 07:42"). *Heard:*

### B. Choice navigation
- [ ] VO+C (or Tab) reaches each choice link; each announces as a link with its full sentence label.
- [ ] After activating a choice, the new passage's heading is announced before you navigate into the body (this is the `:passagedisplay` focus behavior — the critical check). *Heard:*
- [ ] No announcement of "clickable" images or unlabeled controls in the passage flow.

### C. Consequences and debrief
- [ ] The consequence text reads coherently (no stray markup characters such as asterisks or pipes).
- [ ] The debrief table/list reads in a sensible order (decision → strong → mistake → avoidant).
- [ ] The job-aid link in the debrief announces as a link ("Feedback in 5 minutes job aid").

### D. Sidebar and chrome
- [ ] The sidebar title, Saves / Restart links are reachable but do not interrupt the reading flow after a choice.
- [ ] Rotor: headings list shows one h2 per passage (no duplicates per screen).

### E. Reflow and zoom (with VoiceOver still active)
- [ ] At 400% browser zoom, content reflows without horizontal scrolling (Cmd+Option+8 toggles zoom areas on some setups — or use View → Zoom In).
- [ ] No text is cut off or overlapping at 320px width (narrow the window).

## Reporting

Record what you heard against each check (verbatim where it matters — e.g., how the heading announcement actually sounded). Log findings in `findings-template.md` with the same severity + revision-ledger rules. Anything VoiceOver users would hit daily but the automated tests can't see (announcement order, verbosity, cut-off speech) is exactly what this check exists to catch.
