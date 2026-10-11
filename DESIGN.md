---
name: Practice room
description: Bright, playful guitar practice tools.
colors:
  paper: "#fff9db"
  surface: "#ffffff"
  ink: "#292447"
  muted: "#635b78"
  line: "#ded6ef"
  primary: "#6640c8"
  primary-hover: "#4e2cab"
  lavender: "#eee6ff"
  focus: "#a52364"
  pink: "#ff96c1"
  yellow: "#ffe46a"
  mint: "#d4f5dc"
typography:
  display:
    fontFamily: "Fredoka, sans-serif"
    fontSize: "clamp(40px, 5.4vw, 64px)"
    fontWeight: 600
    lineHeight: 1.03
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  timer:
    fontFamily: "Fredoka, sans-serif"
    fontSize: "96px"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.03em"
rounded:
  control: "12px"
  panel: "16px"
spacing:
  control-gap: "8px"
  panel-inline: "30px"
  panel-inline-mobile: "20px"
  workspace-gap: "26px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "13px 18px"
    height: "52px"
  practice-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "23px 30px 0"
---

# Design System: Practice room

## Overview

The user requested brighter colors, a more playful appearance, and livelier layout while preserving all functions. The visual implementation uses rounded lettering, colorful chord controls, a lavender timer band, a mint practice log and a slightly tilted pink practice note. A small geometric smiling sun adds personality to the heading.

## Colors

Purple carries primary actions and the timer. Dark plum supplies readable text. Sunshine yellow is the page family; mint and pink distinguish the log and encouragement. The first chord has a pink field, the second a green field. Supporting text is tinted to its surface and maintains readable contrast. Existing CSS variable names `--green` and `--orange` remain compatibility names for primary purple and the focus accent.

## Typography

Fredoka supplies rounded display text, section headings and measurements. DM Sans supplies instructions and controls. Both are self-hosted in `assets/`, with their OFL licenses. Numerals remain tabular. The mobile heading is 43px (38px on the smallest screens); the mobile timer is 88px.

## Layout

The main container is 1128px wide. Desktop uses a 1.7:1 grid with a minimum 290px sidebar and a 26px gap. The timer is a full-width lavender band inside the practice panel. The log and note sit in a vertical sidebar with different colored surfaces. At 760px and below, the page becomes a single column with 18px outer padding. The decorative sun sits alongside the heading without intercepting any controls.

## Elevation & Depth

Use flat color areas without shadows. A two-pixel plum outline anchors the practice panel. The log and note are separated by color. The note's slight rotation and tilted wordmark emblem bring playfulness without moving inputs or timer digits.

## Shapes

Panels have the larger radius; controls have the smaller radius. The swap button is circular with a 44px target. Small duration and header badges are pills. SVG decoration is noninteractive and hidden from assistive technology.

## Components

All IDs, inputs, event bindings and behavior remain unchanged. The primary action is purple with white text and a small upward hover movement. Reduced-motion preferences remove transitions. Focus is a three-pixel dark pink outline with four-pixel offset. Disabled controls reduce opacity. Settings, result correction, errors and populated history use the same palette and type system.

### Fretboard staff answers

The fretboard's Answer with selector retains note-name practice and adds placing a note on the staff. The answer surface appears during staff-answer rounds beneath the guitar-position prompt. It inherits the panel, rounded controls and purple action palette. Its responsive SVG occupies the available width at 290px height, with a 400 × 290 view box, a rounded border and a visible purple keyboard-focus outline. Ungraded noteheads use the primary purple. Click/tap and arrow placement share the same explicit staff and ledger geometry; an adjacent native select supplies accidentals. After grading, placement locks and the accidental/check controls disappear. A result panel above the staff uses Fredoka result text: Correct! on mint, Not quite on pink, or Answer revealed on lavender. Wrong answers remain visible as hollow plum-outlined notes on the left; filled green correct notes appear on the right, with Your answer and Correct note labels beneath. Correct answers preserve the accepted enharmonic spelling. Feedback scrolls into view while Enter continues the round.

Bravura supplies only musical clef and accidental glyphs from the local OFL asset; Fredoka and DM Sans remain the interface fonts. The small 8 below the treble clef indicates sounding pitch one octave below written pitch. This is a narrow extension of the existing world. The older standalone staff page is directly accessible but omitted from main navigation.

### Optional standalone staff reading

The staff-reading tool inherits the shared navigation, practice panel, lavender prompt and tier navigator, mint reference, pink guitar guide, Fredoka headings and DM Sans controls. Self-hosted Bravura (`assets/bravura.otf`, with its local SIL Open Font License) supplies only the treble clef and accidental symbols; it is a musical notation asset, not a replacement brand typeface.

The notation uses a responsive SVG with a 400 × 290 view box. Five staff lines are spaced 20 units apart; successive written letters move 10 units between lines and spaces. Ledger lines, noteheads and stems use explicit SVG geometry. Bravura symbols render at 80 units. A small DM Sans 8 below the clef indicates guitar's sounding pitch one octave below its written pitch; displayed fingerings and reference audio follow the sounding pitch.

The staff fills the available width with a 300px maximum height, reduced to 250px at the shared 760px mobile breakpoint, where the workspace becomes one column. Typed answers retain the existing rounded controls and visible focus. The reference guide and note selector stay hidden during rounds; note names, guitar positions and audio become available after grading. Starting a round remains disabled until the local notation font loads.

## Do's and Don'ts

- Keep practice controls readable and stable while adding visual personality around them.
- Preserve keyboard focus, touch target sizes, tabular measurements and reduced-motion support.
- Use the self-hosted fonts; no remote font request is needed at runtime.
- Do not change timing, microphone processing, counting or storage as part of visual refinements.

### Toolbox and metronome

A shared navigation row uses purple for the current tool and quiet text for the other. The metronome inherits the same two-column layout, rounded Fredoka measurements, lavender activity band, mint guide and pink practice note. Tempo controls flank a large numeric input; numbered beat indicators show bar position and briefly fill purple (pink on accented beat one). The beat row shrinks to fit six beats on small screens. Settings remain below the Start and Tap tempo actions, with explicit labels and visible focus.

The chord-change input setup uses a labeled device select beside Check input, a compact live level meter, current-source text and a Refresh devices action. It sits above the start action and inherits the existing lavender controls and mobile wrapping. Signal feedback is not announced on every audio frame.

Input boost is a labeled range control with an adjacent dB readout in the audio setup. It follows the existing purple slider treatment, shows feedback on the level meter, and is disabled while a round is active.
