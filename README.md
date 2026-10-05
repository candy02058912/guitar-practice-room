# Practice room

A small, dependency-free guitar practice app. Choose a chord pair, enable the microphone, wait for the quiet-level check, then strum to start a 60-second round. Strum once per chord; each detected strum counts as one, including the first. Review the estimate before saving.

## GitHub Pages

Deployment target: https://candy02058912.github.io/guitar-practice-room/

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
- The detector finds amplitude attacks with a noise floor, decay gate and 230 ms cooldown. It estimates strums, not chord identities or correctness. Speech, taps and other sounds can count; ringing, soft or very fast strums can be missed. Adjust sensitivity and correct the final result.
- Manual mode starts on your first tap or Space press and counts each subsequent tap.
- Switching tabs or hiding the page cancels the round to avoid silently missing changes.
- The mic stops when the round finishes, is cancelled, or the page closes. Microphone mode plays a short end tone when audio is available.
- History and personal bests are grouped by chord pair (A/D and D/A are the same pair). Data is stored only in this browser. Clearing site data deletes it. Download the log for a backup; import is not yet implemented.
- The log shows the eight most recent rounds for the selected pair; the downloaded log includes all pairs and rounds.

## Checks

Run `python3 scripts/check-browser.py` with Chrome or Chromium installed to run all checks in an isolated browser profile. Alternatively, serve the project and open `/tests.html` to run deterministic checks for attack detection, the timer boundary, and record validation. Open `/tests-ui.html` in a separate test browser profile for integration checks of manual and microphone flows, saving, errors, cancellation and responsive overflow. The integration harness temporarily replaces browser storage and restores it after completion. These synthetic tests do not substitute for testing with a real guitar and microphone.

## Tailnet access

An optional Tailscale Serve deployment can make the app available privately at your device’s HTTPS hostname under `/guitar/`. Use the full HTTPS hostname so microphone access works. Progress is saved separately in each browser and origin; localhost, tailnet, and GitHub Pages history do not automatically transfer between sites.

Tailscale Serve hosts the four browser files and self-hosted fonts in `.tailnet-public`, independently of the temporary Python preview server. The existing app at `/` is preserved.

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
