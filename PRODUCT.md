# smallpancake’s guitar practice room

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Delegated by the user. Plain HTML, CSS and JavaScript: no build step or dependencies, served locally or over HTTPS.

## Users
A guitar learner following Justin Guitar, and followers of smallpancake’s guitar practice diary who want to practice along using the same tools and track their own progress.

## Product Purpose
The site accompanies smallpancake’s guitar practice diary and welcomes its audience to use the same chord-change, metronome and fretboard tools. The public name is **smallpancake’s guitar practice room**. Visitors can practice without an account; progress stays in their own browser. No social handle or profile URL has been supplied.

The chord-change tool supports one-minute chord changes: start the timer on the first strum, estimate counts from subsequent strums, review and correct the result, and save progress on this device.

## Visual identity
The user authorized two selectable palettes in the shared header. **Pancake** is the default, using the kawaii pastel colors of their [personal blog](http://smallpancakes.nekoweb.org/): cream paper, honey and peach surfaces, tan borders and warm brown actions, with sage success feedback. **Original pastel** restores purple actions, yellow paper, lavender prompts, mint guides and pink accents. Both retain Fredoka and DM Sans, the existing layout and practice behavior. The choice persists locally across tools and synchronizes between open tabs; blocked storage still allows switching colors on the current page.

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

## Fretboard staff answers
The learner already reads staff notation and wants to connect guitar string/fret or tab positions to written pitches. Alongside the existing C/D/E note-name mode, **Answer with → Place a note on the staff** shows a guitar location and accepts a note placed on a treble staff. Tap/click or use arrow keys, select an accidental and press Enter. Grading requires the exact sounding pitch and octave but accepts enharmonic spellings. After grading, show an explicit result above the staff. Preserve an incorrect answer beside the correct note for comparison, and retain accepted enharmonic spelling on correct answers. Reveals earn no recall. Hide answer controls after grading, bring feedback into view and keep Enter available to continue. Guitar notation is written one octave above the sounding pitch.

Both answer modes use the same 24 levels and six-question progression, with independent recall totals, completion and selected level. Guitar self-check shares note-name progress. Answer mode can change outside a round. Bravura is a local notation-only asset; a font failure leaves note-name practice available.

## Optional standalone staff reading
The earlier `staff.html` page remains directly accessible but is absent from the main tool navigation. It is separate from fretboard staff answers.
A separate staff-reading tool teaches written pitches in guitar treble notation: 12 levels over lines/spaces, ledger lines and accidentals. Explore, answer six typed note-name questions, then review results or advance. Each written note needs two successful recalls per level; state is separate from fretboard progress. The reference guide and note selector stay hidden throughout a round; guitar positions and audio become available after each answer. Correct spelling is required (C# and Db have different written positions); octave numbers are optional. Guitar fingerings and reference tones use sounding pitch, one octave below written pitch. Rhythm, bass clef and key signatures are outside this tool.
