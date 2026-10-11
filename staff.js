import { LEVELS, TIERS, STAFF_KEY, geometry, describe, parseAnswer, matches, guitarLocations, readState, progress, credit, completeLevel, pick } from './staff-engine.js';
const $ = id => document.getElementById(id), show = (id, visible) => { $(id).hidden = !visible; };
let storage; try { storage = localStorage; } catch { /* Keep practicing without storage. */ }
const state = readState(storage);
let level = LEVELS.find(l => l.id === state.selected), current = level.notes[0], phase = 'explore', answered = false;
let question = 0, score = 0, ready = false, audio, oscillator, audioVersion = 0;
const openTiers = new Set([level.tier]);
function save() {
  try { storage.setItem(STAFF_KEY, JSON.stringify(state)); }
  catch { $('storage-status').textContent = 'Storage is unavailable. Progress lasts for this visit only.'; }
}
if (!storage) $('storage-status').textContent = 'Storage is unavailable. Progress lasts for this visit only.';
for (const [tier, title] of TIERS.entries()) {
  const group = document.createElement('optgroup'); group.label = title;
  for (const l of LEVELS.filter(l => l.tier === tier)) group.append(new Option(`${l.number}. ${l.title}`, l.id));
  $('scope').append(group);
}
$('scope').value = level.id;
function svgElement(tag, attributes, text) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  if (text) element.textContent = text;
  $('staff').append(element); return element;
}
function draw() {
  const concealed = phase === 'quiz' && !answered, g = geometry(current);
  $('staff').replaceChildren();
  $('staff').setAttribute('aria-label', `Guitar treble clef. ${describe(current)}.${concealed ? '' : ` Written ${current.id}.`}`);
  for (let y = 80; y <= 160; y += 20) svgElement('line', { x1: 30, y1: y, x2: 370, y2: y, class: 'staff-line' });
  svgElement('text', { x: 48, y: 140, class: 'music-symbol', 'aria-hidden': 'true' }, '\uE050');
  svgElement('text', { x: 65, y: 200, class: 'octave-mark', 'aria-hidden': 'true' }, '8');
  for (const y of g.ledger) svgElement('line', { x1: 212, y1: y, x2: 250, y2: y, class: 'ledger-line' });
  if (current.accidental) svgElement('text', { x: 192, y: g.y, class: 'music-symbol', 'aria-hidden': 'true' }, current.accidental === '#' ? '\uE262' : '\uE260');
  svgElement('ellipse', { cx: 231, cy: g.y, rx: 12, ry: 8, transform: `rotate(-15 231 ${g.y})`, class: 'note-head' });
  const stemX = g.stemDown ? 220 : 242;
  svgElement('line', { x1: stemX, x2: stemX, y1: g.y, y2: g.y + (g.stemDown ? 60 : -60), class: 'note-stem' });
  $('note-caption').textContent = concealed ? 'Name this note' : `${current.label} · written ${current.id.replace('#', '♯').replace('b', '♭')}`;
  const locations = guitarLocations(current).slice(0, 3).map(p => `${p.string} string, ${p.fret ? `fret ${p.fret}` : 'open'}`);
  $('guitar-bridge').textContent = concealed ? 'After you answer, see where this pitch lives on your guitar.' : `${current.label} on your guitar: ${locations.join('; ')}. These are the same sounding pitch.`;
}
function journey() {
  const p = progress(state, level);
  $('current-level').textContent = `Level ${level.number} of 12 · ${TIERS[level.tier]}`;
  $('level-meter').max = p.total; $('level-meter').value = p.earned;
  $('level-goal').textContent = `${p.earned} / ${p.total} recalls earned. ${p.complete ? 'Level complete. Revisit whenever you like.' : 'Read every written note twice; finish the round to complete this level.'}`;
  $('path-count').textContent = `${LEVELS.filter(l => progress(state, l).complete).length} / 12 complete`;
  $('path-list').replaceChildren();
  for (const [tier, title] of TIERS.entries()) {
    const members = LEVELS.filter(l => l.tier === tier), section = document.createElement('details'); section.className = 'tier-section'; section.open = openTiers.has(tier);
    const summary = document.createElement('summary'), name = document.createElement('span'), count = document.createElement('span');
    name.textContent = title; count.className = 'tier-count'; count.textContent = `${members.filter(l => progress(state, l).complete).length} / ${members.length}`;
    summary.append(name, count); section.append(summary);
    section.addEventListener('toggle', () => { if (section.isConnected) { if (section.open) openTiers.add(tier); else openTiers.delete(tier); } });
    const list = document.createElement('ol'); list.className = 'level-list';
    for (const l of members) {
      const li = document.createElement('li'), b = document.createElement('button'), info = progress(state, l);
      for (const [className, text] of [['level-number', l.number], ['level-name', l.title], ['level-status', info.complete ? 'Complete' : `${info.earned} / ${info.total} recalls`]]) {
        const span = document.createElement('span'); span.className = className; span.textContent = text; b.append(span);
      }
      if (l.id === level.id) b.setAttribute('aria-current', 'step');
      b.disabled = phase === 'quiz'; b.addEventListener('click', () => { selectLevel(l.id); $('scope').focus(); }); li.append(b); list.append(li);
    }
    section.append(list); $('path-list').append(section);
  }
  const next = LEVELS.find(l => l.number > level.number && !progress(state, l).complete) || LEVELS.find(l => !progress(state, l).complete);
  show('advance', phase !== 'quiz' && p.complete && Boolean(next));
  if (next) { $('advance').dataset.level = next.id; $('advance').textContent = `Try level ${next.number}`; }
}
function render() {
  const testing = phase === 'quiz', concealed = testing && !answered;
  $('scope').disabled = testing;
  show('answer-form', concealed); show('reveal', concealed); show('next', testing && answered);
  show('start', !testing); $('start').disabled = !ready; $('start').textContent = ready ? phase === 'result' ? 'Practice another 6' : 'Try 6 questions' : 'Loading notation…';
  show('listen', !concealed); $('listen').disabled = !ready;
  show('explore', phase !== 'explore'); show('reference', !testing); show('explore-notes', !testing);
  $('next').textContent = question === 6 ? 'See results' : 'Next question';
  $('explore-notes').replaceChildren();
  if (!testing) for (const n of level.notes) {
    const b = document.createElement('button'); b.textContent = n.id.replace('#', '♯').replace('b', '♭'); b.setAttribute('aria-pressed', String(current.id === n.id));
    b.addEventListener('click', () => { current = n; draw(); [...$('explore-notes').children].forEach(el => el.setAttribute('aria-pressed', String(el === b))); });
    $('explore-notes').append(b);
  }
  draw(); journey();
}
function explore() {
  stopSound(); phase = 'explore'; answered = false;
  $('stage-title').textContent = 'Explore the staff'; $('round-count').textContent = 'No rush';
  $('prompt').textContent = level.title;
  $('prompt-help').textContent = level.id === 'familiar' ? 'C, D and E: the same notes at frets 1, 3 and 5 on your B string.' : 'Choose a note to see its position. Every neighboring line or space moves one letter.';
  $('feedback').textContent = 'Look at the note’s position, say its name, then find it on your guitar.';
  render();
}
function selectLevel(id) {
  level = LEVELS.find(l => l.id === id); state.selected = id; current = level.notes[0]; openTiers.add(level.tier); $('scope').value = id;
  show('level-celebration', false); save(); explore();
}
function nextQuestion() {
  current = pick(state, level, current.id); question++; answered = false;
  $('stage-title').textContent = 'A little sight-reading'; $('round-count').textContent = `${question} of 6`;
  $('prompt').textContent = 'What note is written here?'; $('prompt-help').textContent = 'Read its position and any sharp or flat. Type the note name, then Enter.';
  $('answer').value = ''; $('answer').removeAttribute('aria-invalid'); show('answer-error', false);
  $('feedback').textContent = 'No timer. Give yourself a moment to read it.';
  render(); $('answer').focus();
}
function grade(value, reveal = false) {
  if (phase !== 'quiz' || answered) return;
  answered = true; const correct = !reveal && matches(value, current);
  if (correct) { score++; credit(state, level, current); save(); }
  $('feedback').textContent = `${correct ? 'Yes!' : reveal ? 'With help:' : 'Keep practicing:'} This is ${current.label}, ${describe(current)}. ${correct ? '' : 'Read the spelling shown on the staff; an equivalent-sounding note can be written differently.'}`;
  render(); $('next').focus();
}
$('answer-form').addEventListener('submit', e => {
  e.preventDefault(); if (phase !== 'quiz' || answered) return;
  if (!parseAnswer($('answer').value)) { $('answer-error').textContent = 'Enter A–G, with # for sharp or b for flat if shown (for example F# or Bb).'; show('answer-error', true); $('answer').setAttribute('aria-invalid', 'true'); $('answer').focus(); return; }
  grade($('answer').value);
});
$('answer').addEventListener('input', () => { show('answer-error', false); $('answer').removeAttribute('aria-invalid'); });
$('start').addEventListener('click', () => { if (!ready) return; stopSound(); phase = 'quiz'; question = score = 0; show('level-celebration', false); nextQuestion(); });
$('reveal').addEventListener('click', () => grade('', true));
$('next').addEventListener('click', () => {
  if (phase !== 'quiz' || !answered) return;
  if (question < 6) { nextQuestion(); return; }
  phase = 'result'; const completed = completeLevel(state, level); save();
  $('stage-title').textContent = 'Round complete'; $('round-count').textContent = '6 questions';
  $('prompt').textContent = `${score} of 6 read without help`; $('prompt-help').textContent = 'Review these written notes or practice another round.';
  $('feedback').textContent = completed ? 'Level complete! You can move on or revisit these notes.' : 'Your earned recalls count toward this level. Keep going at your own pace.';
  if (completed) { $('level-celebration').textContent = `Level ${level.number} complete! Every written note read twice.`; show('level-celebration', true); }
  render(); $('start').focus();
});
$('explore').addEventListener('click', () => { explore(); $('start').focus(); });
$('scope').addEventListener('change', () => selectLevel($('scope').value));
$('advance').addEventListener('click', () => { selectLevel($('advance').dataset.level); $('start').focus(); });
document.addEventListener('keydown', e => { if (e.repeat && (e.key === 'Enter' || e.key === ' ')) e.preventDefault(); });
function stopSound() { audioVersion++; if (oscillator) { try { oscillator.stop(); } catch { /* Already stopped. */ } oscillator = undefined; } }
$('listen').addEventListener('click', async () => {
  stopSound(); const version = audioVersion;
  try {
    if (!audio || audio.state === 'closed') audio = new (window.AudioContext || window.webkitAudioContext)();
    await audio.resume(); if (version !== audioVersion || document.hidden) return;
    const voice = audio.createOscillator(), gain = audio.createGain(), time = audio.currentTime;
    voice.type = 'triangle'; voice.frequency.value = 440 * 2 ** ((current.midi - 69) / 12);
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.15, time + .015); gain.gain.exponentialRampToValueAtTime(.001, time + .65);
    voice.connect(gain); gain.connect(audio.destination); voice.start(); voice.stop(time + .7); oscillator = voice;
    voice.onended = () => { voice.disconnect(); gain.disconnect(); if (oscillator === voice) oscillator = undefined; }; show('sound-error', false);
  } catch { $('sound-error').textContent = 'Sound could not start. You can keep practicing visually or play the displayed fingering on your guitar.'; show('sound-error', true); }
});
function releaseAudio() { stopSound(); if (audio && audio.state !== 'closed') audio.close().catch(() => {}); audio = undefined; }
window.addEventListener('pagehide', releaseAudio); document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAudio(); });
explore();
try {
  const faces = await document.fonts.load('80px Bravura', '\uE050');
  if (!faces.length) throw new Error('Missing notation font');
  ready = true; render();
} catch { $('font-error').textContent = 'The notation font could not load. Reload this page to try again before starting a round.'; show('font-error', true); }
