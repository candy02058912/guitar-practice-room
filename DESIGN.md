---
name: smallpancake’s guitar practice room
description: Playful guitar practice tools with Pancake and Original pastel palettes.
colors:
  paper: "#fff9e6"
  surface: "#ffffff"
  ink: "#544232"
  muted: "#75604e"
  line: "#c4a484"
  primary: "#76513d"
  primary-hover: "#5d3e2e"
  tint: "#fae9d9"
  focus: "#8b4b39"
  peach: "#e6b89c"
  yellow: "#f7d794"
  honey: "#fff0cb"
  peach-panel: "#f5dbc9"
  success-surface: "#e4eedb"
  success-ink: "#36523d"
  error-ink: "#843d35"
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

# Design System: smallpancake’s guitar practice room

## Overview

The public brand is **smallpancake’s guitar practice room**, accompanying a guitar practice diary and inviting followers to practice along. The user authorized a choice between the default Pancake palette drawn from their [personal blog](http://smallpancakes.nekoweb.org/) and the Original pastel palette. Both retain the rounded typography, playful motifs and existing layout.

The default Pancake palette uses cream, honey, peach and warm browns while preserving all functions. The visual implementation uses rounded lettering, colorful chord controls, a pale peach timer band, a honey practice log and a slightly tilted peach practice note. A small geometric smiling sun adds personality to the heading.

## Colors

In Pancake, warm brown carries primary actions and the timer; dark brown supplies readable text. Cream paper, honey log/guide panels and peach encouragement panels apply the blog’s palette to the tools. The first chord has a peach field, the second a honey field. Darker derived action and hover browns keep white labels readable. Muted brown supports secondary text; tan borders define controls. Sage is reserved for success feedback and reddish brown on peach distinguishes incorrect answers. CSS uses semantic `--primary`, `--focus`, `--honey` and `--peach` names. The frontmatter records the default Pancake values. Color descriptions below refer to Pancake unless stated otherwise; both palettes share the same component roles.

Original pastel uses yellow paper (`#fff9db`), plum ink (`#292447`), purple actions (`#6640c8`, hover `#4e2cab`), lavender prompts (`#eee6ff`), mint guides (`#d4f5dc`) and pink accents (`#ff96c1`). Its focus accent is dark pink (`#a52364`). `palettes.css` defines the shared `--tone-*` roles and their Original pastel overrides under `data-palette="pastel"`; component variables resolve through these roles. Preserve these semantic roles when adding surfaces so both palettes remain complete.

## Typography

Fredoka supplies rounded display text, section headings and measurements. DM Sans supplies instructions and controls. Both are self-hosted in `assets/`, with their OFL licenses. Numerals remain tabular. The mobile heading is 43px (38px on the smallest screens); the mobile timer is 88px.

## Layout

The main container is 1128px wide. Desktop uses a 1.7:1 grid with a minimum 290px sidebar and a 26px gap. The timer is a full-width pale peach band inside the practice panel. The log and note sit in a vertical sidebar with different colored surfaces. At 760px and below, the page becomes a single column with 18px outer padding. The decorative sun sits alongside the heading without intercepting any controls.

## Elevation & Depth

Use flat color areas without shadows. A two-pixel brown outline anchors the practice panel. The log and note are separated by color. The note's slight rotation and tilted wordmark emblem bring playfulness without moving inputs or timer digits.

## Shapes

Panels have the larger radius; controls have the smaller radius. The swap button is circular with a 44px target. Small duration and header badges are pills. SVG decoration is noninteractive and hidden from assistive technology.

## Components

All IDs, inputs, event bindings and behavior remain unchanged. The primary action is warm brown with white text and a small upward hover movement. Reduced-motion preferences remove transitions. Focus is a three-pixel terracotta outline with four-pixel offset. Disabled controls reduce opacity. Settings, result correction, errors and populated history use the same palette and type system.

### Palette selector

All four tool pages carry a native header select labeled Palette, with Pancake and Original pastel choices. `palette.js` reads `practice-room.palette.v1` before styles paint and sets the root `data-palette` to `pancake` or `pastel`. Selection updates the UI, browser theme color, favicon and themed SVG artwork. The choice persists across tool pages and synchronizes through storage events between tabs. If storage is blocked, switching still applies to the current page. Typography, geometry and practice state stay shared across palettes.

### Shared brand header

The full name appears in a two-line Fredoka wordmark beside the existing guitar emblem: smallpancake’s above guitar practice room, with the warm brown terminal dot. The owner line uses primary warm brown at 16px, reducing to 14px on phones; the main wordmark reduces to 22px on phones. Keep the full name readable rather than abbreviating it. The desktop header note reads “Practice along with us.” and the footer reads “From our guitar diary to your daily practice.” Browser titles and sharing metadata use the full brand name. The home introduction welcomes diary followers to use the tools without an account; no social profile link is present until a real destination is supplied.

### Fretboard staff answers

The fretboard's Answer with selector retains note-name practice and adds placing a note on the staff. The answer surface appears during staff-answer rounds beneath the guitar-position prompt. It inherits the panel, rounded controls and warm brown action palette. Its responsive SVG occupies the available width at 290px height, with a 400 × 290 view box, a rounded border and a visible warm brown keyboard-focus outline. Ungraded noteheads use the primary warm brown. Click/tap and arrow placement share the same explicit staff and ledger geometry; an adjacent native select supplies accidentals. After grading, placement locks and the accidental/check controls disappear. A result panel above the staff uses Fredoka result text: Correct! on sage, Not quite on peach, or Answer revealed on pale peach. Wrong answers remain visible as hollow reddish-brown-outlined notes on the left; filled sage-green correct notes appear on the right, with Your answer and Correct note labels beneath. Correct answers preserve the accepted enharmonic spelling. Feedback scrolls into view while Enter continues the round.

Bravura supplies only musical clef and accidental glyphs from the local OFL asset; Fredoka and DM Sans remain the interface fonts. The small 8 below the treble clef indicates sounding pitch one octave below written pitch. This is a narrow extension of the existing world. The older standalone staff page is directly accessible but omitted from main navigation.

### Optional standalone staff reading

The staff-reading tool inherits the shared navigation, practice panel, pale peach prompt and tier navigator, honey reference, peach guitar guide, Fredoka headings and DM Sans controls. Self-hosted Bravura (`assets/bravura.otf`, with its local SIL Open Font License) supplies only the treble clef and accidental symbols; it is a musical notation asset, not a replacement brand typeface.

The notation uses a responsive SVG with a 400 × 290 view box. Five staff lines are spaced 20 units apart; successive written letters move 10 units between lines and spaces. Ledger lines, noteheads and stems use explicit SVG geometry. Bravura symbols render at 80 units. A small DM Sans 8 below the clef indicates guitar's sounding pitch one octave below its written pitch; displayed fingerings and reference audio follow the sounding pitch.

The staff fills the available width with a 300px maximum height, reduced to 250px at the shared 760px mobile breakpoint, where the workspace becomes one column. Typed answers retain the existing rounded controls and visible focus. The reference guide and note selector stay hidden during rounds; note names, guitar positions and audio become available after grading. Starting a round remains disabled until the local notation font loads.

## Do's and Don'ts

- Keep practice controls readable and stable while adding visual personality around them.
- Preserve keyboard focus, touch target sizes, tabular measurements and reduced-motion support.
- Use the self-hosted fonts; no remote font request is needed at runtime.
- Do not change timing, microphone processing, counting or storage as part of visual refinements.

### Toolbox and metronome

A shared navigation row uses warm brown for the current tool and quiet text for the other. The metronome inherits the same two-column layout, rounded Fredoka measurements, pale peach activity band, honey guide and peach practice note. Tempo controls flank a large numeric input; numbered beat indicators show bar position and briefly fill warm brown (terracotta on accented beat one). The beat row shrinks to fit six beats on small screens. Settings remain below the Start and Tap tempo actions, with explicit labels and visible focus.

The chord-change input setup uses a labeled device select beside Check input, a compact live level meter, current-source text and a Refresh devices action. It sits above the start action and inherits the existing pale peach controls and mobile wrapping. Signal feedback is not announced on every audio frame.

Input boost is a labeled range control with an adjacent dB readout in the audio setup. It follows the existing warm brown slider treatment, shows feedback on the level meter, and is disabled while a round is active.
