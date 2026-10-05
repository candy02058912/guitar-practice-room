import { StrumDetector, PracticeRound, pairKey, validSession } from './engine.js';
const $ = id => document.getElementById(id);
const chords = ['A', 'D', 'E', 'Am', 'Dm', 'Em', 'C', 'G', 'F', 'Bm', 'B7', 'A7', 'D7', 'E7', 'G7', 'C7', 'Fmaj7'];
const storageKey = 'practice-room.sessions.v1';
let sessions = [], state = 'idle', mode = 'mic', round, detector, stream, context, analyser, samples, frame, timeout, requestId = 0, calibrationEnd, wakeLock;
let storageWarning = '';
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(stored) || !stored.every(validSession)) throw new Error('Invalid practice log');
  sessions = stored;
} catch {
  storageWarning = 'Your saved practice log could not be read. New results can still be downloaded. Saving will not replace the existing log.';
}
for (const id of ['chord-a', 'chord-b']) {
  for (const chord of chords) $(id).add(new Option(chord, chord));
  $(id).addEventListener('change', () => { clearError(); renderHistory(); updateControls(); });
}
$('chord-b').value = 'D';
$('swap-chords').addEventListener('click', () => {
  if (state !== 'idle') return;
  const [first, second] = selectedPair();
  $('chord-a').value = second;
  $('chord-b').value = first;
  clearError(); renderHistory(); updateControls();
});
function selectedPair() { return [$('chord-a').value, $('chord-b').value]; }
function showError(message) { $('error').textContent = message; $('error').hidden = false; }
function clearError() { $('error').hidden = true; }
function setStatus(title, instruction) { $('status').textContent = title; $('instruction').textContent = instruction; }
function updateControls() {
  const active = ['requesting', 'calibrating', 'armed', 'running'].includes(state);
  const same = $('chord-a').value === $('chord-b').value;
  $('chord-a').disabled = $('chord-b').disabled = $('swap-chords').disabled = state !== 'idle';
  $('listen').hidden = $('manual').hidden = state !== 'idle';
  $('listen').disabled = $('manual').disabled = same;
  $('cancel').hidden = !active;
  $('tap').hidden = !(mode === 'manual' && ['armed', 'running'].includes(state));
  $('result').hidden = state !== 'finished';
  $('mic-settings').hidden = mode === 'manual' && active;
  document.body.classList.toggle('is-running', state === 'running');
  document.body.classList.toggle('is-armed', state === 'armed');
  if (same && state === 'idle') setStatus('Choose two different chords', 'Pick a different second chord to start your practice.');
  else if (state === 'idle') setStatus('Make yourself comfortable', 'Get your fingers ready. Your first strum starts the clock.');
}
async function holdScreen() {
  try {
    const lock = await navigator.wakeLock?.request('screen');
    if (['armed', 'running', 'calibrating'].includes(state)) wakeLock = lock;
    else await lock?.release();
  } catch { /* Keeping the screen awake is optional. */ }
}
function releaseAudio() {
  cancelAnimationFrame(frame); clearTimeout(timeout);
  if (stream) { stream.getTracks().forEach(track => { track.onended = null; track.stop(); }); stream = null; }
  if (context) { const oldContext = context; context = null; oldContext.onstatechange = null; void oldContext.close().catch(() => {}); }
  if (wakeLock) { void wakeLock.release().catch(() => {}); wakeLock = null; }
  analyser = null; $('level').value = 0;
}
function reset(message) {
  requestId++; releaseAudio(); state = 'idle'; round = null;
  $('timer').textContent = '1:00'; $('timer').setAttribute('aria-label', '60 seconds remaining');
  $('time-fill').style.transform = 'scaleX(1)'; $('count').textContent = '0';
  $('count-label').textContent = 'estimated changes';
  updateControls(); if (message) setStatus(message, 'Your next minute is ready when you are.');
}
function interrupt(message) { reset(); showError(message); }
function registerHit(now) {
  if (!['armed', 'running'].includes(state)) return;
  if (round.expired(now)) { finish(); return; }
  if (state === 'armed') {
    state = 'running';
    setStatus('Keep going. You’ve got this.', mode === 'mic' ? 'Alternate your chords. One strum for each change.' : 'Press Space or tap the button for each chord you play.');
    timeout = setTimeout(finish, 60000);
    updateControls();
  }
  round.hit(now); $('count').textContent = round.count;
}
function tick() {
  if (!['calibrating', 'armed', 'running'].includes(state)) return;
  const now = performance.now();
  if (state === 'running' && round.expired(now)) { finish(); return; }
  if (analyser) {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0; for (const sample of samples) sum += sample * sample;
    const rms = Math.sqrt(sum / samples.length);
    $('level').value = rms;
    if (state === 'calibrating') {
      detector.calibrate(rms);
      if (now >= calibrationEnd) {
        state = 'armed'; setStatus('Listening for your first strum', 'Take your time. The clock starts when you play.'); updateControls();
      }
    } else if (detector.feed(rms, now)) registerHit(now);
  }
  if (state === 'running') {
    const remaining = round.remaining(now), seconds = Math.ceil(remaining / 1000);
    $('timer').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    $('timer').setAttribute('aria-label', `${seconds} seconds remaining`);
    $('time-fill').style.transform = `scaleX(${remaining / 60000})`;
  }
  frame = requestAnimationFrame(tick);
}
async function listen() {
  if (state !== 'idle') return;
  clearError(); mode = 'mic'; state = 'requesting'; const token = ++requestId;
  setStatus('Allow microphone access', 'Your browser will ask to use the microphone.'); updateControls();
  let pendingContext;
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('UNSUPPORTED');
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('UNSUPPORTED');
    pendingContext = new AudioContext(); context = pendingContext;
    await context.resume();
    const acquired = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
    if (token !== requestId) { acquired.getTracks().forEach(t => t.stop()); return; }
    stream = acquired;
    for (const track of stream.getTracks()) track.onended = () => interrupt('The microphone disconnected. Reconnect it and start a new round, or use manual mode.');
    analyser = context.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0;
    context.createMediaStreamSource(stream).connect(analyser);
    samples = new Float32Array(analyser.fftSize); detector = new StrumDetector(Number($('sensitivity').value)); round = new PracticeRound();
    state = 'calibrating'; calibrationEnd = performance.now() + 1500;
    setStatus('Finding the room’s quiet level…', 'Hold off strumming for a moment.'); updateControls();
    context.onstatechange = () => { if (context && context.state === 'suspended' && ['armed', 'running', 'calibrating'].includes(state)) interrupt('Audio was interrupted. Keep this page open and start a new round.'); };
    void holdScreen(); tick();
  } catch (error) {
    if (token !== requestId) return;
    reset();
    const messages = { NotAllowedError: 'Microphone access was blocked. Allow it in your browser’s site settings and try again, or use manual mode.', NotFoundError: 'No microphone was found. Connect one, or use manual mode.', NotReadableError: 'Your microphone is unavailable. Close other apps using it and try again, or use manual mode.' };
    showError(messages[error.name] || 'Microphone listening is unavailable. Open this app on localhost or HTTPS in a supported browser, or use manual mode.');
  }
}
function manual() {
  if (state !== 'idle') return;
  clearError(); mode = 'manual'; round = new PracticeRound(); state = 'armed';
  $('count-label').textContent = 'changes counted';
  setStatus('Ready when you are', 'Press Space or tap “Count a change” with your first chord.');
  updateControls(); $('tap').focus(); void holdScreen(); tick();
}
function finish() {
  if (state !== 'running') return;
  // Use the audio context already permitted by the start gesture for a short end cue.
  const oldContext = context;
  if (oldContext && oldContext.state === 'running') {
    try {
      const oscillator = oldContext.createOscillator(), gain = oldContext.createGain();
      oscillator.connect(gain); gain.connect(oldContext.destination); oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.08, oldContext.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, oldContext.currentTime + 0.35);
      oscillator.start(); oscillator.stop(oldContext.currentTime + 0.36);
      context = null; oldContext.onstatechange = null; setTimeout(() => { void oldContext.close().catch(() => {}); }, 450);
    } catch { /* The visible end state still signals completion. */ }
  }
  releaseAudio(); state = 'finished'; $('timer').textContent = '0:00'; $('timer').setAttribute('aria-label', 'Time is up'); $('time-fill').style.transform = 'scaleX(0)';
  $('final-count').value = round.count; setStatus('Time’s up. Nice work.', ''); updateControls(); $('final-count').focus();
}
function renderHistory() {
  const [a, b] = selectedPair(), rows = sessions.filter(s => pairKey(...s.chords) === pairKey(a, b)).sort((a,b) => Date.parse(b.date)-Date.parse(a.date));
  $('log-context').textContent = `${a} ↔ ${b} · this device`;
  $('session-total').textContent = `${rows.length} ${rows.length === 1 ? 'session' : 'sessions'}`;
  $('empty-log').hidden = rows.length > 0; $('personal-best').hidden = rows.length === 0;
  $('best').replaceChildren(document.createTextNode(`${Math.max(0, ...rows.map(s => s.count))} `));
  const small = document.createElement('small'); small.textContent = 'changes'; $('best').append(small);
  $('history').replaceChildren();
  for (const row of rows.slice(0, 8)) {
    const el = document.createElement('div'); el.className = 'history-row';
    const meta = document.createElement('div'), date = document.createElement('time'), detail = document.createElement('small'), score = document.createElement('div'), unit = document.createElement('span');
    date.dateTime = row.date; date.textContent = new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    detail.textContent = new Date(row.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) + ' · 1 minute';
    score.className = 'history-score'; score.textContent = row.count; unit.textContent = 'changes'; score.append(unit); meta.append(date, detail); el.append(meta, score); $('history').append(el);
  }
  $('export').hidden = sessions.length === 0;
}
$('listen').addEventListener('click', listen); $('manual').addEventListener('click', manual);
$('cancel').addEventListener('click', () => { clearError(); reset(); }); $('discard').addEventListener('click', () => { clearError(); reset(); });
$('tap').addEventListener('click', () => registerHit(performance.now()));
document.addEventListener('keydown', event => {
  if (event.code === 'Space' && mode === 'manual' && ['armed', 'running'].includes(state) && !['INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY'].includes(event.target.tagName) && (event.target.tagName !== 'BUTTON' || event.target === $('tap'))) {
    event.preventDefault(); if (!event.repeat) registerHit(performance.now());
  }
});
$('sensitivity').addEventListener('input', () => { const value = Number($('sensitivity').value); if (detector) detector.sensitivity = value; $('sensitivity-value').textContent = value < 35 ? 'Less sensitive' : value > 70 ? 'More sensitive' : 'Balanced'; });
for (const [id, delta] of [['minus', -1], ['plus', 1]]) $(id).addEventListener('click', () => { const value = Number($('final-count').value); $('final-count').value = Math.max(0, Math.min(999, (Number.isFinite(value) ? value : 0) + delta)); });
$('save').addEventListener('click', () => {
  if (state !== 'finished') return;
  const count = Number($('final-count').value);
  if (!$('final-count').value.trim() || !Number.isInteger(count) || count < 0 || count > 999) { showError('Enter a whole number between 0 and 999 before saving.'); return; }
  const next = [...sessions, { id: crypto.randomUUID(), chords: selectedPair(), count, date: new Date().toISOString(), mode }];
  let saved = false;
  if (!storageWarning) { try { localStorage.setItem(storageKey, JSON.stringify(next)); saved = true; } catch { /* Keep session in memory for export. */ } }
  sessions = next; clearError(); reset(saved ? 'Session saved. Keep showing up.' : 'Session added for this visit.'); renderHistory();
  if (!saved) showError(storageWarning || 'Browser storage is unavailable or full. Download your practice log now to keep this result after closing the page.');
});
$('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ version: 1, sessions }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'guitar-practice-log.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.addEventListener('visibilitychange', () => { if (document.hidden && ['calibrating', 'armed', 'running'].includes(state)) interrupt('The round stopped because this page was hidden. Keep it visible while practising so no strums are missed.'); });
window.addEventListener('pagehide', () => { requestId++; releaseAudio(); });
renderHistory(); updateControls(); if (storageWarning) showError(storageWarning);
