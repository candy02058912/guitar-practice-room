# Guitar practice tools

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Delegated by the user. Plain HTML, CSS and JavaScript: no build step or dependencies, served locally or over HTTPS.

## Users
A guitar learner following Justin Guitar who wants tools to track personal progress.

## Product Purpose
The chord-change tool supports one-minute chord changes: start the timer on the first strum, estimate counts from subsequent strums, review and correct the result, and save progress on this device.

## Operating Context
Hands occupied by a guitar. User confirmed one strum per chord change with automatic counting and correction before saving.

## Capabilities and Constraints
Microphone permission is required for hands-free use. Sound stays on the device. Strum detection is an estimate, not chord recognition. Manual practice remains available. No account or server storage is planned for this first version.

## Metronome
A second tool provides a steady beat with adjustable tempo, tap tempo, beats per bar, first-beat accent and volume. It uses local audio synthesis with no microphone, and remembers its settings in this browser. The existing chord-change tool remains separately accessible through shared navigation.

## Audio inputs
The chord-change tool accepts a microphone or a USB guitar input, including the user’s Fender Mustang Micro Plus. An explicit selector and signal check precede a round. Audio remains local; missing selected devices do not fall back to another input.

## Fretboard practice
A third tool helps connect note names and locations. It begins with C, D and E on the B string, offers six-question on-screen recall or guitar self-check rounds, and ends with recall results and repeat/next-level actions. Reference tones remain available when exploring notes. The learner can expand the practice area through all notes on all strings up to fret 12. Missed locations receive more practice; recall progress is stored locally. Standard tuning only; no microphone recognition.

Fretboard progression offers 24 freely selectable levels across four tiers. Each location needs two successful recalls in that level; finishing the round awards completion. Both on-screen and guitar self-check practice count. Level progress and selection persist separately from existing recall totals.

The fretboard sidebar uses four independently expandable tier groups with separate level numbers, names and progress. Melody building is removed from the fretboard practice flow; no separate melody tool is included.

Keyboard practice uses a focused typed-answer field (fret number on the requested string or note name, accepting sharps/flats). Enter submits and continues after feedback. Arrow keys navigate fret and note buttons, with one Tab stop per group. Standard Tab/Enter navigation remains available throughout.
