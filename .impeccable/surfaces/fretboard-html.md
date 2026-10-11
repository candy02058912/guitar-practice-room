---
version: 1
slug: "fretboard-html"
primary_target: "fretboard.html"
related_targets: ["fretboard.css","fretboard.js","fretboard-engine.js","staff-answer.js","staff-answer.css","staff-engine.js"]
---

# Fretboard practice
Mode: Operate. A learner with a guitar wants to connect note names and locations through recall practice. Extend the existing practice room; default to C, D and E on the B string, then allow wider practice areas. No microphone recognition.

## Direction contract
THESIS: A small note map becomes a recall exercise with visible level progress. Teach through a bounded set of playable notes.
OWN-WORLD: Inherit Practice room's Fredoka and DM Sans, purple controls, yellow paper, lavender practice area, mint guide and pink encouragement.
STORY: Explore three notes, recall their locations in six prompts, then review results and repeat or advance. Hints and self-assessment support a guitar in the user's hands.
FIRST VIEWPORT: Existing shared navigation and heading above the familiar practice-panel/sidebar layout. A labeled region selector, large prompt, horizontal string diagram and primary action anchor the main panel; note locations and the learning rationale sit beside it.
FORM: Narrow extension of existing tools with an agreed exercise sequence; no seed or new visual world. The signature interaction connects recalled locations to level completion. Feedback highlights a selected fret without moving controls; respect reduced motion.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Level path extension
Retain the established visual world and six-question/results sequence. Add a compact current-level progress bar above settings, a four-tier journey with 24 levels in four independently expandable sidebar tiers, and a next-level action after completion. Two successful recalls per location earn progress; completion is awarded at round end. No locks, timers or losing earned progress. Keep old recall totals intact.

## Sidebar refinement
Each tier has its own expandable summary and completion count. Level rows separate number, name and recall status, with explicit selected hover colors. Remove melody building and its copy; round results focus on repeat practice and progression.

## Keyboard practice
Prefer familiar typed answers and Enter over memorized shortcuts. Auto-focus the answer field for each on-screen question, focus Next after grading, and repeat after results. Validate fret ranges and parse enharmonic note spellings. Preserve native form/select controls; arrow navigation within fret/note button groups has one Tab stop each.

## Staff-answer extension
The learner already reads notation: show a guitar string/fret position and ask them to place its pitch on the staff. Keep the existing C/D/E note-name answer mode beside this mode in the Answer with selector. Both use the same 24 levels with separate recall totals, selected level and completion; guitar self-check shares note-name progress.

In a staff-answer round, place a note by tap/click or Up/Down arrows, choose an accidental and submit with Enter or Check staff answer. Grade exact sounding pitch and octave, accepting enharmonic spelling. Show the correct notation only after grading or reveal, with an explicit Correct!, Not quite or Answer revealed result above the staff. For wrong answers, preserve the hollow chosen note on the left beside the filled correct note on the right, with text labels. Retain accepted enharmonic spelling for correct answers. Hide answer controls after grading, bring staff feedback into view and preserve Enter to continue. Preserve the existing palette, type and panel layout; use local Bravura only for notation symbols. Written guitar pitches sit one octave above their sounding pitches. The older standalone staff-reading page remains directly accessible but is not in the main navigation.
