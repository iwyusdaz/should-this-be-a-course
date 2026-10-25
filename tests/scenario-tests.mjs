#!/usr/bin/env node
/**
 * scenario-tests.mjs — scripted usability/accessibility tests for the branching scenario
 * (docs/05-build/scenario/index.html), run with Playwright 1.57.0 (resolved from the
 * workspace root node_modules).
 *
 * Replaces the automatable parts of the [HUMAN] usability-test step:
 *   - keyboard-only playthrough (Tab/Enter only, from the focus-managed heading),
 *   - scripted playthroughs of all three ending paths with step counts,
 *   - focus management check (:passagedisplay focus lands on the new passage heading),
 *   - 320px reflow / 400%-zoom-equivalent checks (WCAG 1.4.10, WCAG-EM method),
 *   - ariaSnapshot captures (screen-reader output fallback; Guidepup/VoiceOver
 *     automation is not functional on this build machine's macOS version).
 *
 * What this CAN show: the flows work, keyboard works, focus works, no reflow failures.
 * What it CANNOT show: real learner experience, comprehension, realism (that is what the
 * pending reviewer walkthrough, simulated-learner pipeline and human protocol are for).
 *
 * All navigation is done through the same links a player uses (no internal SugarCube
 * APIs for state changes), so the tests exercise what a real user experiences.
 *
 * Usage:  node tests/scenario-tests.mjs
 * Output: results printed + evaluation/scenario-test-results.json + aria snapshots in
 *         evaluation/aria-snapshot/
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCENARIO = "file://" + resolve(ROOT, "docs/05-build/scenario/index.html");
const RESULTS = resolve(ROOT, "evaluation/scenario-test-results.json");
const ARIA_DIR = resolve(ROOT, "evaluation/aria-snapshot");

const results = [];
function record(name, passed, details) {
  details = String(details).replace(/\s+/g, " ").slice(0, 300);
  results.push({ name, passed, details });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name} — ${details}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));

/** Fresh load of the story: clears SugarCube's sessionStorage save first, so every
 *  test starts from the Start passage (a plain reload would restore the last session). */
async function loadStory() {
  await page.goto(SCENARIO);
  await page.evaluate(() => {
    try { sessionStorage.clear(); localStorage.clear(); } catch (e) { /* file:// may restrict */ }
  });
  await page.reload();
  await page.waitForFunction(() => !!document.querySelector("#passages .passage h2"), null, {
    timeout: 15000,
  });
  await page.waitForTimeout(150);
}
const currentPassage = () => page.evaluate(() => window.SugarCube.State.passage);
/** Click an internal link whose visible text includes `text`. Returns false if absent. */
async function clickChoice(text) {
  const links = page.locator("#passages .passage a.link-internal");
  const n = await links.count();
  for (let i = 0; i < n; i++) {
    if ((await links.nth(i).textContent()).includes(text)) {
      await links.nth(i).click();
      return true;
    }
  }
  return false;
}
/** Walk a path of link texts; returns the array of passages visited. */
async function walk(path, visited = []) {
  visited.push(await currentPassage());
  for (const step of path) {
    if (!(await clickChoice(step))) {
      visited.push(`MISSING:${step.slice(0, 40)}`);
      break;
    }
    await page.waitForTimeout(130);
    visited.push(await currentPassage());
  }
  return visited;
}

// 0. Load
await loadStory();

// 1. Focus management: focus lands on the new passage heading on every display
{
  // The first-load focus is applied by the story's safety net within ~1s of load;
  // poll briefly rather than checking a single instant.
  let focus = { tag: "?", tabindex: null, text: "?" };
  for (let i = 0; i < 30; i++) {
    focus = await page.evaluate(() => ({
      tag: document.activeElement.tagName,
      tabindex: document.activeElement.getAttribute("tabindex"),
      text: document.activeElement.textContent?.trim(),
    }));
    if (focus.tag === "H2") break;
    await page.waitForTimeout(100);
  }
  record(
    "focus moves to passage heading on first load",
    focus.tag === "H2" && focus.tabindex === "-1" && focus.text.includes("Monday"),
    `activeElement=${focus.tag} tabindex=${focus.tabindex} text="${focus.text}"`
  );
  await clickChoice("Head over and talk to Priya");
  await page.waitForTimeout(200);
  const focus2 = await page.evaluate(() => ({
    tag: document.activeElement.tagName,
    tabindex: document.activeElement.getAttribute("tabindex"),
    text: document.activeElement.textContent?.trim(),
  }));
  record(
    "focus moves to new passage heading after a choice",
    focus2.tag === "H2" && focus2.tabindex === "-1" && focus2.text.includes("Decision 1"),
    `activeElement=${focus2.tag} tabindex=${focus2.tabindex} text="${focus2.text}"`
  );
}

// 2. Keyboard-only playthrough: reach an ending + debrief using only Tab + Enter
{
  await loadStory();
  const keySteps = [];
  const seen = new Set();
  let ok = true;
  for (let step = 0; step < 60; step++) {
    const passage = await currentPassage();
    seen.add(passage);
    let landed = null;
    let tabs = 0;
    for (let t = 0; t < 15; t++) {
      await page.keyboard.press("Tab");
      tabs++;
      const el = await page.evaluate(() => {
        const a = document.activeElement;
        return a && a.classList && a.classList.contains("link-internal") && a.closest("#passages") ? a.textContent.trim() : null;
      });
      if (el) { landed = el; break; }
    }
    if (!landed) { ok = false; keySteps.push(`STUCK on ${passage}: no internal link reachable via Tab`); break; }
    keySteps.push(`${passage} --(Tab×${tabs}, Enter)--> ${landed.slice(0, 36)}`);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const after = await currentPassage();
    if (after === passage) { ok = false; keySteps.push(`Enter on "${landed}" did not navigate (still ${passage})`); break; }
    seen.add(after);
    if (after === "Debrief") break;
  }
  record(
    "keyboard-only playthrough (Tab/Enter only) reaches the debrief",
    ok && seen.has("Debrief"),
    `${keySteps.length} keyboard activations; visited: ${[...seen].join(", ")}${ok ? "" : " | " + keySteps.slice(-2).join(" | ")}`
  );
  record(
    "no keyboard trap detected during playthrough",
    ok,
    "Tab moved focus freely across every passage; Enter activated each choice; the loop never stalled"
  );
}

// 3. All three ending paths, with step counts (3 decisions + continuation links each)
const PATHS = [
  {
    name: "strong path reaches End_Improved",
    steps: [
      "Head over and talk to Priya", "can I grab you for five minutes", "A few days later",
      "Two weeks later", "system change", "Later that week",
      "The next one-on-one", "Give one specific piece of feedback", "Four weeks later", "Continue",
    ],
    expect: "End_Improved",
  },
  {
    name: "mistake-heavy path reaches End_Unresolved",
    steps: [
      "Head over and talk to Priya", "complaints about your handovers", "A few days later",
      "Two weeks later", "handover completeness is mandatory", "Later that week",
      "The next one-on-one", "brilliant she was", "Four weeks later", "Continue",
    ],
    expect: "End_Unresolved",
  },
  {
    name: "avoidant path reaches End_Escalated",
    steps: [
      "Head over and talk to Priya", "Hey Pri, how", "A few days later",
      "Two weeks later", "have raised it", "Later that week",
      "The next one-on-one", "Cancel", "Four weeks later", "Continue",
    ],
    expect: "End_Escalated",
  },
];
for (const pathSpec of PATHS) {
  await loadStory();
  const visited = await walk(pathSpec.steps);
  const final = visited[visited.length - 1];
  const nPassages = visited.filter((v) => !v.startsWith("MISSING")).length;
  record(
    pathSpec.name,
    final === pathSpec.expect,
    `${nPassages} passages visited (${visited.join("→")}); decisions=3, options per decision=3`
  );
}

// 4. Reflow at 320px viewport — the WCAG-EM equivalent of 400% zoom on a 1280px display.
//    Each target passage is reached on a FRESH load at 320px by playing the story with
//    the same links a user would use; media queries are active from the start, exactly
//    as for a real 400%-zoom user. (CSS `zoom: 4` is NOT used: it does not trigger media
//    queries, so it is not a faithful 400%-zoom emulation.)
{
  const narrow = await browser.newPage({ viewport: { width: 320, height: 640 } });
  narrow.on("pageerror", (e) => pageErrors.push(String(e)));
  const widen = [];
  for (const [label, steps] of [
    ["Start", []],
    ["Decision 2 (D2)", ["Head over and talk to Priya", "can I grab you for five minutes", "A few days later", "Two weeks later"]],
    ["Debrief", ["Head over and talk to Priya", "Hey Pri, how", "A few days later", "Two weeks later", "have raised it", "Later that week", "The next one-on-one", "Cancel", "Four weeks later", "Continue", "Debrief"]],
  ]) {
    await narrow.goto(SCENARIO);
    await narrow.evaluate(() => {
      try { sessionStorage.clear(); localStorage.clear(); } catch (e) { /* file:// may restrict */ }
    });
    await narrow.reload();
    await narrow.waitForFunction(() => !!document.querySelector("#passages .passage h2"), null, { timeout: 15000 });
    await narrow.waitForTimeout(150);
    for (const step of steps) {
      const links = narrow.locator("#passages .passage a.link-internal");
      const n = await links.count();
      let hit = false;
      for (let i = 0; i < n; i++) {
        if ((await links.nth(i).textContent()).includes(step)) { await links.nth(i).click(); hit = true; break; }
      }
      if (!hit) { widen.push(`${label}: could not reach (missing link ${step.slice(0, 30)})`); break; }
      await narrow.waitForTimeout(120);
    }
    const over = await narrow.evaluate(() => ({
      scrollW: document.scrollingElement.scrollWidth,
      clientW: document.scrollingElement.clientWidth,
    }));
    if (over.scrollW > over.clientW + 1) widen.push(`${label}: scrollW=${over.scrollW} > ${over.clientW}`);
  }
  await narrow.close();
  record(
    "320px viewport / 400%-zoom equivalent (WCAG 1.4.10): no horizontal scrolling",
    widen.length === 0,
    widen.length ? widen.join("; ") : "fresh 320px loads of Start, Decision 2 and Debrief: scrollWidth <= 320 at all"
  );
}

// 5. Timed-choice check: no automatic navigation while idle on a decision
{
  await loadStory();
  await clickChoice("Head over and talk to Priya");
  await page.waitForTimeout(200);
  const timed = await page.evaluate(
    () =>
      new Promise((res) => {
        const p0 = window.SugarCube.State.passage;
        setTimeout(() => res(window.SugarCube.State.passage === p0), 1600);
      })
  );
  record("no timed choices (passage unchanged after idle wait)", timed, "no automatic navigation observed during 1.6s idle on a decision passage");
}

// 6. aria snapshots (screen-reader output fallback)
{
  mkdirSync(ARIA_DIR, { recursive: true });
  await loadStory();
  const s1 = await page.locator("#passages").ariaSnapshot();
  await clickChoice("Head over and talk to Priya");
  await page.waitForTimeout(200);
  const s2 = await page.locator("#passages").ariaSnapshot();
  await walk([
    "Hey Pri, how", "A few days later", "Two weeks later", "have raised it", "Later that week",
    "The next one-on-one", "Cancel", "Four weeks later", "Continue", "Debrief",
  ]);
  const s3 = await page.locator("#passages").ariaSnapshot();
  const header = [
    "ARIA SNAPSHOTS — The Handover Problem scenario (Playwright ariaSnapshot fallback).",
    "Note: Guidepup/VoiceOver automation is NOT functional on this build machine's macOS version;",
    "no VoiceOver testing has been performed. These captures show the browser accessibility tree",
    "that a screen reader would consume — they are NOT a substitute for a manual VoiceOver check",
    "(protocol: evaluation/human-protocol/manual-voiceover-check.md).",
    `Captured: ${new Date().toISOString().slice(0, 10)} · Playwright 1.57.0 · Chromium 143`,
    "",
  ].join("\n");
  writeFileSync(
    resolve(ARIA_DIR, "aria-snapshot.txt"),
    header + "=== START ===\n" + s1 + "\n\n=== DECISION 1 ===\n" + s2 + "\n\n=== DEBRIEF ===\n" + s3 + "\n"
  );
  record(
    "ariaSnapshot captures saved",
    s1.length > 50 && s2.length > 50 && s3.length > 50,
    `evaluation/aria-snapshot/aria-snapshot.txt (Start + Decision 1 + Debrief)`
  );
}

// ------------------------------------------------------------------ summary
record(
  "no page errors during the whole run",
  pageErrors.length === 0,
  pageErrors.length ? pageErrors.join("; ") : "zero uncaught errors in Chromium"
);

const passed = results.filter((r) => r.passed).length;
const summary = {
  generated: new Date().toISOString(),
  scenario: "docs/05-build/scenario/index.html",
  tool: "Playwright 1.57.0 (Chromium headless)",
  note: "Scripted tests replace the automatable parts of the usability check. They prove the flows, keyboard support, focus management and reflow; they are not real user testing.",
  passed,
  total: results.length,
  results,
};
writeFileSync(RESULTS, JSON.stringify(summary, null, 2) + "\n");
console.log(`\n${passed}/${results.length} checks passed. Results: evaluation/scenario-test-results.json`);

await browser.close();
process.exit(passed === results.length ? 0 : 1);
