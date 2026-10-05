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

## Do's and Don'ts

- Keep practice controls readable and stable while adding visual personality around them.
- Preserve keyboard focus, touch target sizes, tabular measurements and reduced-motion support.
- Use the self-hosted fonts; no remote font request is needed at runtime.
- Do not change timing, microphone processing, counting or storage as part of visual refinements.
