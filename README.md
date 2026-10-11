# Practice room

A small, dependency-free guitar practice toolbox with a one-minute chord-change timer and a metronome. Choose a chord pair, enable the microphone, wait for the quiet-level check, then strum to start a 60-second round. Strum once per chord; each detected strum counts as one, including the first. Review the estimate before saving.

## USB guitar input (including Mustang Micro Plus)

Connect the powered-on interface with a USB data cable. In the chord-change tool, use **Check input** and grant the browser’s microphone permission (this also covers USB audio). Select the Mustang Micro Plus, or the USB audio name shown by your operating system, from **Audio input**. **Refresh devices** rescans the list without opening a microphone.

Strum while checking: the input meter should move while the timer remains at 1:00. For a faint signal, raise **Input boost** from Off to +20 dB, then increase gradually (up to +40 dB) if needed. This scales the signal used by both calibration and detection, and the displayed meter; it does not alter headphone volume. Boost raises noise too. Reduce it if the level warns that boost is too high. Set it before starting a round; changing devices resets it to Off. Use a clean preset without delay/reverb and pause backing tracks. Listen through headphones on the interface; the tool does not monitor the guitar through the computer. Then click **Enable input & get ready**, stay quiet for calibration, and strum to begin.

A selected device is requested explicitly. If unavailable, the app reports the problem instead of falling back to a laptop microphone. Switching devices during a check closes the previous stream. Input selection is locked during an active exercise; cancel first to change it. The input choice lasts for this page visit. The detector still estimates strums, not chord quality.

[Fender confirms the Mustang Micro Plus can act as a USB recording input](https://www.fender.com/articles/parts-and-accessories/how-to-use-fender-studio-with-compatible-interfaces). The input controls and lifecycle have browser tests; the physical device needs checking on your computer.

## Metronome

Open `metronome.html` or choose **Metronome** in the tool navigation. Set 40–240 BPM with the number field, slider, plus/minus buttons or Tap tempo. Choose 1–6 beats per bar, optionally accent beat one, and adjust the volume (0 mutes sound but keeps the beat indicators). Each click is one beat; subdivisions and compound-meter grouping are not included.

Press Start or use Space when focus is outside a form control. Clicks use Web Audio’s clock with a short look-ahead scheduler, following [MDN’s audio scheduling approach](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques). Tempo changes take effect within the short scheduling window; changing beats per bar restarts the bar. Leaving or hiding the page stops playback. No microphone permission is needed.

Tempo, beats, accent and volume are remembered on this browser. If storage is blocked, controls still work for the current visit. Metronome and chord-change practice use separate pages, so switching tools releases their audio resources.

## GitHub Pages

Deployment target: https://smallpancakes.github.io/guitar-practice-room/

GitHub Pages publishes the committed `docs/` folder on `main`. In repository **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/docs**.

After changing the app:

```sh
python3 scripts/check-browser.py
python3 scripts/build-pages.py
git add .
git commit -m "Update practice room"
git push
```

The packaging script copies only browser files and self-hosted fonts into `docs/`; tests, tooling, and repository documentation stay outside the website. Commit both source changes and the refreshed `docs/` files. All asset paths are relative, so the app works under `/guitar-practice-room/`.

See [GitHub’s branch publishing documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Run

From this folder:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 in a current Chrome, Firefox, Edge or Safari browser. For another device, deploy the static files over HTTPS; a plain HTTP LAN address cannot request microphone access. No build step is required.

## Behaviour

- Audio is processed locally with Web Audio and is never recorded or sent to a server.
- The detector finds amplitude attacks with a noise floor, a 64 ms settling period and a 230 ms cooldown. A fresh attack can count while the previous chord is still ringing; the sound does not have to fade to near silence. It estimates strums, not chord identities or correctness. Speech, taps and other sounds can count; ringing, soft or very fast strums can be missed. Adjust sensitivity and correct the final result.
- Manual mode starts on your first tap or Space press and counts each subsequent tap.
- Switching tabs or hiding the page cancels the round to avoid silently missing changes.
- The mic stops when the round finishes, is cancelled, or the page closes. Microphone mode plays a short end tone when audio is available.
- History and personal bests are grouped by chord pair (A/D and D/A are the same pair). Data is stored only in this browser. Clearing site data deletes it. Download the log for a backup; import is not yet implemented.
- The log shows the eight most recent rounds for the selected pair; the downloaded log includes all pairs and rounds.

## Checks

Run `python3 scripts/check-browser.py` with Chrome or Chromium installed to run all checks in an isolated browser profile. Alternatively, serve the project and open `/tests.html` to run deterministic checks for attack detection, the timer boundary, and record validation. Open `/tests-input.html` for USB selection, preview and disconnect handling. Open `/tests-metronome.html` for timing, audio rendering, lifecycle and metronome interaction checks. Open `/tests-ui.html` in a separate test browser profile for integration checks of manual and microphone flows, saving, errors, cancellation and responsive overflow. The integration harness temporarily replaces browser storage and restores it after completion. These synthetic tests do not substitute for testing with a real guitar and microphone.

## Tailnet access

An optional Tailscale Serve deployment can make the app available privately at your device’s HTTPS hostname under `/guitar/`. Use the full HTTPS hostname so microphone access works. Progress is saved separately in each browser and origin; localhost, tailnet, and GitHub Pages history do not automatically transfer between sites.

Tailscale Serve hosts the browser files and self-hosted fonts in `.tailnet-public`, independently of the temporary Python preview server. The existing app at `/` is preserved.

After changing the app, refresh the served assets:

```sh
python3 scripts/prepare-tailnet.py
```

Configure the route with:

```sh
sudo tailscale serve --bg --set-path=/guitar "$PWD/.tailnet-public"
```

To remove only this app’s route:

```sh
sudo tailscale serve --https=443 --set-path=/guitar off
```
