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
