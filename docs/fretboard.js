import { t, lockLanguage } from './i18n.js';
import { staffAnswer } from './staff-answer.js?v=2';
import { STRINGS, NAMES, SCOPES, position, locations, choose, readProgress, LEVELS, TIERS, LEVEL_KEY, readLevels, levelProgress, recordLevel, finishLevel, levelPool } from './fretboard-engine.js?v=2';
const $ = id => document.getElementById(id);
let storage;
try { storage = window.localStorage; } catch { /* Practice works without storage. */ }
const onStaff = () => $('practice-mode').value === 'staff';
if (new URLSearchParams(location.search).get('answer') === 'staff') $('practice-mode').value = 'staff';
const modeKey = name => onStaff() ? name.replace('fretboard.', 'fretboard.staff.') : name;
const modeStorage = { getItem: name => storage?.getItem(modeKey(name)) };
let path = readLevels(modeStorage);
let history = readProgress(modeStorage), scope = path.selected, phase = 'learn', pool = locations(scope);
let target, question = 0, score = 0, answered = false, assisted = false, questionType = 'find';
let seen = new Set(), audio, voices = new Set();
let saved = Boolean(storage);
const key = 'practice-room.fretboard.v1';
const locationText = p => t`${STRINGS[p.string].name} string, ${p.fret === 0 ? t('open') : t`fret ${p.fret}`}`;
let notationReady = false;
const staffInput = staffAnswer($('staff-answer'), n => { if (phase === 'quiz' && !answered && onStaff()) answer(n.midi === target.midi, null, t`written ${n.id}`); });
const onGuitar = () => $('practice-mode').value === 'guitar';
for (const [tier, title] of TIERS.entries()) {
  const group = document.createElement('optgroup'); group.label = t`Tier ${tier + 1} · ${title}`;
  for (const level of LEVELS.filter(l => l.tier === tier)) group.append(new Option(`${level.number}. ${level.title}`, level.id));
  $('scope').append(group);
}
$('scope').value = scope;
function savePath() {
  try { storage.setItem(modeKey(LEVEL_KEY), JSON.stringify(path)); } catch { saved = false; }
}
const openTiers = new Set([LEVELS.find(l => l.id === scope).tier]);
function renderPath() {
  const level = LEVELS.find(l => l.id === scope), progress = levelProgress(path, scope);
  $('current-level').textContent = t`Level ${level.number} of ${LEVELS.length} · ${TIERS[level.tier]}`;
  $('level-meter').max = progress.total; $('level-meter').value = progress.earned;
  $('level-goal').textContent = t`${progress.earned} / ${progress.total} recalls earned. ${progress.complete ? t('Level complete — revisit whenever you like.') : t('Recall every location twice; finish the round to complete this level.')} ${onStaff() ? t('Staff placement progress is saved separately.') : t('Guitar self-checks count too.')}`;
  const complete = LEVELS.filter(l => levelProgress(path, l.id).complete).length;
  $('path-count').textContent = t`${complete} / ${LEVELS.length} complete`;
  $('path-list').replaceChildren();
  for (const [tier, title] of TIERS.entries()) {
    const levels = LEVELS.filter(l => l.tier === tier), done = levels.filter(l => levelProgress(path, l.id).complete).length;
    const section = document.createElement('details'); section.className = 'tier-section'; section.open = openTiers.has(tier);
    const summary = document.createElement('summary');
    const titleText = document.createElement('span'); titleText.textContent = title;
    const count = document.createElement('span'); count.className = 'tier-count'; count.textContent = `${done} / ${levels.length}`; count.setAttribute('aria-label', t`${done} of ${levels.length} levels complete`);
    summary.append(titleText, count); section.append(summary);
    section.addEventListener('toggle', () => { if (section.isConnected) { if (section.open) openTiers.add(tier); else openTiers.delete(tier); } });
    const list = document.createElement('ol'); list.className = 'level-list';
    for (const item of levels) {
      const li = document.createElement('li'), button = document.createElement('button');
      const status = levelProgress(path, item.id);
      const number = document.createElement('span'); number.className = 'level-number'; number.textContent = item.number; number.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span'); name.className = 'level-name'; name.textContent = item.title;
      const detail = document.createElement('span'); detail.className = 'level-status'; detail.textContent = status.complete ? t('Complete') : t`${status.earned} / ${status.total} recalls`;
      button.append(number, name, detail);
      button.setAttribute('aria-label', t`Level ${item.number}: ${item.title}, ${detail.textContent}`);
      button.disabled = phase === 'quiz'; if (item.id === scope) button.setAttribute('aria-current', 'step');
      button.addEventListener('click', () => { selectLevel(item.id); $('scope').focus(); }); li.append(button); list.append(li);
    }
    section.append(list); $('path-list').append(section);
  }
  const next = LEVELS.find(l => l.number > level.number && !levelProgress(path, l.id).complete) || LEVELS.find(l => !levelProgress(path, l.id).complete);
  setVisible('advance', phase !== 'quiz' && progress.complete && Boolean(next));
  if (next) { $('advance').textContent = t`Try level ${next.number}`; $('advance').dataset.level = next.id; }
}
function selectLevel(id) {
  scope = id; openTiers.add(LEVELS.find(l => l.id === scope).tier); pool = locations(scope); path.selected = scope; $('scope').value = scope; savePath();
  setVisible('level-celebration', false); explore();
}
$('advance').addEventListener('click', () => { selectLevel($('advance').dataset.level); $('start').focus(); });
function setVisible(id, visible) { $(id).hidden = !visible; }
function guide() {
  $('note-guide').replaceChildren();
  const testing = phase === 'quiz';
  $('guide-intro').textContent = testing ? t('Take your time. Picture the note, say its name, then find it. Use Show answer whenever you need it.')
    : scope === 'starter' ? t('Start small: learn C, D and E on the B string.') : t('Explore this area before testing yourself. Natural notes are the letters A through G.');
  if (!testing && pool.length <= 12) {
    for (const p of pool) {
      const row = document.createElement('div'); row.className = 'guide-row';
      const name = document.createElement('strong'); name.textContent = p.name;
      const loc = document.createElement('span'); loc.textContent = `${SCOPES[scope].strings.length > 1 ? STRINGS[p.string].name + ' · ' : ''}${p.fret ? t`Fret ${p.fret}` : t('Open string')}`;
      row.append(name, loc); $('note-guide').append(row);
    }
  } else if (!testing) {
    const p = document.createElement('p'); p.textContent = t('Thinnest string at the top, thickest at the bottom. The nut is beside fret 0. At fret 12, each open-string note repeats an octave higher.'); $('note-guide').append(p);
  }
  const hits = pool.reduce((sum, p) => sum + (history[p.id]?.hits || 0), 0);
  $('progress').textContent = saved ? (hits ? t`${hits} unassisted recalls in this area, saved on this browser.` : t('Your recall practice will be saved on this browser.')) : t('Storage is unavailable. Practice works, but progress lasts for this visit only.');
}
function board() {
  const config = SCOPES[scope], board = $('fretboard'); board.replaceChildren();
  board.classList.toggle('short-board', config.max === 5);
  board.style.gridTemplateColumns = `48px repeat(${config.max + 1}, minmax(44px, 1fr))`;
  board.style.minWidth = `${48 + (config.max + 1) * 44}px`;
  const blank = document.createElement('span'); blank.className = 'fret-label'; blank.textContent = t('Fret'); board.append(blank);
  for (let fret = 0; fret <= config.max; fret++) { const n = document.createElement('span'); n.className = 'fret-label'; n.textContent = fret; board.append(n); }
  const markerLabel = document.createElement('span'); markerLabel.className = 'marker-label'; markerLabel.textContent = t('Dots'); board.append(markerLabel);
  for (let fret = 0; fret <= config.max; fret++) {
    const marker = document.createElement('span'); marker.className = 'fret-marker';
    const count = fret === 12 ? 2 : [3, 5, 7, 9].includes(fret) ? 1 : 0;
    if (count) {
      marker.setAttribute('role', 'img');
      marker.setAttribute('aria-label', t`${count === 2 ? t('Double') : t('Single')} dot marker at fret ${fret}`);
      for (let i = 0; i < count; i++) { const dot = document.createElement('i'); dot.setAttribute('aria-hidden', 'true'); marker.append(dot); }
    } else marker.setAttribute('aria-hidden', 'true');
    board.append(marker);
  }
  for (const string of config.strings) {
    const label = document.createElement('span'); label.className = 'string-label'; label.textContent = STRINGS[string].name; board.append(label);
    for (let fret = 0; fret <= config.max; fret++) {
      const p = position(string, fret), eligible = pool.some(note => note.id === p.id);
      const b = document.createElement('button'); b.className = `fret${fret === 0 ? ' open' : ''}`; b.dataset.position = p.id;
      b.style.setProperty('--string-width', `${1 + string * .3}px`);
      const showNames = phase !== 'quiz' || answered;
      const marked = phase === 'quiz' && questionType === 'name' && p.id === target.id;
      b.disabled = phase === 'quiz' ? answered || questionType === 'name' || onGuitar() : !eligible;
      b.setAttribute('aria-label', `${locationText(p)}${showNames && eligible ? `, ${p.name}` : ''}${marked ? t(', highlighted note') : ''}`);
      if (showNames && eligible) b.classList.add('available');
      if (marked) b.classList.add('target');
      if (phase === 'quiz' && answered && p.id === target.id) b.classList.add('correct');
      const dot = document.createElement('span'); dot.textContent = showNames && eligible ? p.name.split(' / ')[0] : marked ? '?' : '';
      b.append(dot); b.addEventListener('click', () => {
        if (phase === 'quiz') {
          const correct = p.id === target.id;
          answer(correct, p);
        }
        else {
          $('feedback').textContent = t`${p.name} · ${locationText(p)}. Say it, play it, then look away and find it again.`;
          playNotes([p]);
        }
      }); board.append(b);
    }
  }
  $('board-caption').textContent = config.strings.length === 1 ? t`${STRINGS[config.strings[0]].name} string${config.strings[0] === 1 ? t(' · second-thinnest') : ''}. 0 means open. Frets increase to the right.` : t('Thinnest string at top. Thickest at bottom. 0 means open. Scroll for more frets.');
}
function nameAnswers() {
  $('note-answers').replaceChildren();
  setVisible('note-answers', phase === 'quiz' && questionType === 'name' && !onGuitar() && !onStaff());
  if ($('note-answers').hidden) return;
  const names = NAMES.filter(n => pool.some(p => p.name === n));
  for (const name of names) {
    const b = document.createElement('button'); b.textContent = name; b.disabled = answered;
    b.addEventListener('click', () => answer(name === target.name, null, name)); $('note-answers').append(b);
  }
}
function focusQuestion() {
  if (onStaff()) staffInput.focus();
  else if (onGuitar()) $('reveal').focus();
  else $('typed-answer').focus();
}
function typedAnswer() {
  const active = phase === 'quiz' && !onGuitar() && !onStaff() && !answered;
  setVisible('typed-answer-form', active);
  if (!active) return;
  const fretQuestion = questionType === 'find';
  $('typed-answer-label').textContent = fretQuestion ? t`Fret on the ${STRINGS[target.string].name} string` : t('Note name');
  $('typed-answer').inputMode = fretQuestion ? 'numeric' : 'text';
  $('typed-answer').placeholder = fretQuestion ? `0–${SCOPES[scope].max}` : t('e.g. C, C# or Db');
  $('typed-answer-help').textContent = fretQuestion ? t`Type 0–${SCOPES[scope].max}, then Enter. The string is already selected by the question.` : t('Type a note, then Enter. Use # for sharp or b for flat; either spelling works.');
}
$('typed-answer-form').addEventListener('submit', event => {
  event.preventDefault();
  if (phase !== 'quiz' || answered || onGuitar() || onStaff()) return;
  const value = $('typed-answer').value.trim();
  let valid = false, correct = false, picked = null;
  if (questionType === 'find') {
    valid = /^\d{1,2}$/.test(value) && Number(value) <= SCOPES[scope].max;
    if (valid) { picked = position(target.string, Number(value)); correct = picked.id === target.id; }
  } else {
    const normalized = value.replaceAll('♯', '#').replaceAll('♭', 'b');
    const match = /^([a-g])([#b]?)$/i.exec(normalized);
    valid = Boolean(match);
    if (match) {
      const natural = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[match[1].toUpperCase()];
      const pitch = (natural + (match[2] === '#' ? 1 : match[2] ? -1 : 0) + 12) % 12;
      correct = pitch === target.midi % 12;
    }
  }
  if (!valid) {
    $('typed-answer-error').textContent = questionType === 'find' ? t`Enter a whole fret number from 0 to ${SCOPES[scope].max}.` : t("Enter a note from A to G, with # or b if needed (for example C# or Db).");
    setVisible('typed-answer-error', true); $('typed-answer').setAttribute('aria-invalid', 'true'); $('typed-answer').focus(); return;
  }
  answer(correct, picked, value.toUpperCase());
});
$('typed-answer').addEventListener('input', () => { setVisible('typed-answer-error', false); $('typed-answer').removeAttribute('aria-invalid'); });
// Standard buttons handle Enter/Space; ignore key-repeat to avoid accidental answers.
document.addEventListener('keydown', event => {
  if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
});
function arrowNavigation(container, selector, spatial) {
  container.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const current = event.target.closest(selector);
    if (!current || current.disabled) return;
    const buttons = [...container.querySelectorAll(selector)].filter(b => !b.disabled);
    let next;
    if (spatial) {
      const [string, fret] = current.dataset.position.split(':').map(Number);
      const vertical = ['ArrowUp', 'ArrowDown'].includes(event.key);
      const line = buttons.filter(b => Number(b.dataset.position.split(':')[vertical ? 1 : 0]) === (vertical ? fret : string));
      const index = line.indexOf(current);
      const direction = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
      next = event.key === 'Home' ? line[0] : event.key === 'End' ? line.at(-1) : line[Math.max(0, Math.min(line.length - 1, index + direction))];
    } else {
      const index = buttons.indexOf(current), direction = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
      next = event.key === 'Home' ? buttons[0] : event.key === 'End' ? buttons.at(-1) : buttons[(index + direction + buttons.length) % buttons.length];
    }
    if (next) { event.preventDefault(); buttons.forEach(b => b.tabIndex = -1); next.tabIndex = 0; next.focus(); }
  });
}
arrowNavigation($('fretboard'), '.fret', true);
arrowNavigation($('note-answers'), 'button', false);
function tabStops() {
  for (const [id, selector] of [['fretboard', '.fret'], ['note-answers', 'button']]) {
    const buttons = [...$(id).querySelectorAll(selector)].filter(b => !b.disabled);
    buttons.forEach((b, i) => { b.tabIndex = i === 0 ? 0 : -1; });
  }
}
function render() {
  lockLanguage(phase === 'quiz');
  $('scope').disabled = phase === 'quiz'; $('practice-mode').disabled = phase === 'quiz';
  setVisible('start', phase !== 'quiz'); $('start').textContent = phase === 'result' ? t('Practice another 6') : t('Try 6 questions');
  setVisible('explore', phase !== 'learn');
  setVisible('reveal', phase === 'quiz' && !answered);
  setVisible('next', phase === 'quiz' && answered && !(onGuitar() && assisted));
  setVisible('remembered', phase === 'quiz' && answered && onGuitar() && assisted);
  setVisible('missed', phase === 'quiz' && answered && onGuitar() && assisted);
  $('next').textContent = question === 6 ? t('See results') : t('Next question');
  board(); nameAnswers(); guide(); renderPath(); typedAnswer(); tabStops();
  setVisible('staff-answer', onStaff() && phase === 'quiz');
  if (onStaff() && answered && target) staffInput.reveal(target.midi, assisted);
  $('start').disabled = onStaff() && !notationReady;
  $('keyboard-help').textContent = phase === 'quiz' ? (answered ? t('Press Enter to use the focused button. Tab changes your choice.') : onGuitar() ? t('Play the note, then press Enter to reveal. Tab chooses I knew it or Still learning; Enter confirms.') : onStaff() ? t("Tap the staff or use ↑ / ↓ to place a note. Enter checks it. Tab reaches the accidental selector.") : t('Type your answer, then Enter. After feedback, Enter moves on. Tab reaches Show answer and other controls.')) : t('Keyboard: Tab to a control, then Enter to use it. Arrow keys move between fret positions and note choices.');
}
function nextQuestion() {
  const previous = target?.id;
  target = choose(levelPool(path, scope), history, seen, previous); question++; answered = false; assisted = false;
  questionType = onStaff() ? 'name' : onGuitar() || question % 2 === 1 ? 'find' : 'name';
  if (onStaff()) staffInput.reset();
  $('stage-title').textContent = onGuitar() ? t('Find it on your guitar') : t('A little recall');
  $('round-count').textContent = t`${question} of 6`;
  const sameName = pool.filter(p => p.string === target.string && p.name === target.name);
  const octave = sameName.length > 1 ? (target.midi === Math.min(...sameName.map(p => p.midi)) ? t('lower') : t('higher')) : '';
  const requestedNote = octave ? t`the ${octave} ${target.name}` : target.name;
  $('prompt').textContent = questionType === 'find' ? t`${onGuitar() ? t('Play') : t('Find')} ${requestedNote} on the ${STRINGS[target.string].name} string` : t('What note is highlighted?');
  $('prompt-help').textContent = onGuitar() ? t`Play the note, say its name, then reveal the location to check yourself.${target.fret === 0 || target.fret === 12 ? t` Use fret ${target.fret === 0 ? t("0 (open)") : '12'}.` : ''}` : questionType === 'find' ? t`Tap its location on the fretboard.${target.fret === 0 || target.fret === 12 ? t` Use fret ${target.fret === 0 ? t("0 (open)") : '12'} for this question.` : ''}` : t`${locationText(target)}. Choose the note name below.`;
  if (questionType === 'find' && octave) $('prompt-help').textContent = t`This string has two ${target.name} notes in this level, an octave apart. Choose the ${octave} pitch${octave === t('lower') ? t(', nearer the nut') : t(', farther up the neck')}.`;
  if (onStaff()) { $('prompt').textContent = t('Put this guitar position on the staff'); $('prompt-help').textContent = t`${locationText(target)}. Place its written pitch in guitar treble notation, including the octave.`; }
  $('feedback').textContent = t('No timer. Give yourself a moment to remember.');
  $('typed-answer').value = ''; $('typed-answer').removeAttribute('aria-invalid'); setVisible('typed-answer-error', false);
  render();
  if (questionType === 'name') $('fretboard').querySelector('.target')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  focusQuestion();
}
function record(correct) {
  const item = history[target.id] || { hits: 0, misses: 0 };
  history[target.id] = { hits: item.hits + Number(correct), misses: correct ? Math.max(0, item.misses - 1) : item.misses + 1 };
  if (correct) { score++; recordLevel(path, scope, target.id); savePath(); }
  try { storage.setItem(modeKey(key), JSON.stringify(history)); saved = true; } catch { saved = false; }
}
function answer(correct, picked, name) {
  if (answered) return;
  answered = true; record(correct);
  $('feedback').textContent = correct ? t`Yes! ${target.name} is on the ${locationText(target)}.` : t`${picked ? t`${picked.name} is at ${locationText(picked)}.` : name ? t`You chose ${name}.` : t('Keep practicing this one.')} ${target.name} is on the ${locationText(target)}. We’ll revisit notes you miss.`;
  render();
  if (picked && !correct) $('fretboard').querySelector(`[data-position="${picked.id}"]`)?.classList.add('wrong');
  $('next').focus({ preventScroll: onStaff() });
  if (onStaff()) $('staff-answer').scrollIntoView({ block: 'start' });
}
$('reveal').addEventListener('click', () => {
  if (answered) return;
  assisted = true; answered = true;
  if (!onGuitar()) record(false);
  $('feedback').textContent = `${target.name} · ${locationText(target)}. ${onGuitar() ? t('Did you find it before revealing the answer?') : t('This counts as practice with help. Try saying the name as you play it.')}`;
  render(); $(onGuitar() ? 'remembered' : 'next').focus({ preventScroll: onStaff() });
  if (onStaff()) $('staff-answer').scrollIntoView({ block: 'start' });
});
for (const [id, correct] of [['remembered', true], ['missed', false]]) $(id).addEventListener('click', () => {
  if (!assisted || !answered) return;
  assisted = false; record(correct); render(); $('next').focus();
});
$('start').addEventListener('click', () => { if (onStaff() && !notationReady) return; stopAudio(); phase = 'quiz'; question = 0; score = 0; seen.clear(); nextQuestion(); });
$('next').addEventListener('click', () => {
  if (!answered || (onGuitar() && assisted)) return;
  if (question < 6) { nextQuestion(); }
  else {
    phase = 'result';
    const completedNow = finishLevel(path, scope); savePath();
    if (completedNow) {
      const level = LEVELS.find(l => l.id === scope);
      $('level-celebration').textContent = t`Level ${level.number} complete! Every location recalled twice. Review these notes, or try the next level.`;
      setVisible('level-celebration', true);
    }
    $('stage-title').textContent = t('Round complete'); $('round-count').textContent = t('6 questions');
    $('prompt').textContent = t`${score} of 6 recalled ${onGuitar() ? t('by self-check') : t('without help')}`;
    $('prompt-help').textContent = score === 6 ? t('Those locations are getting familiar. Keep practicing or move on when your level is complete.') : t('Every attempt is practice. Review the notes below, then try another round.');
    $('feedback').textContent = completedNow ? t('Level complete! You can try the next level or revisit these notes.') : t('Your earned recalls count toward this level. Keep going at your own pace.');
    render(); $('prompt').setAttribute('role', 'status'); $('start').focus();
  }
});
function explore() {
  stopAudio(); phase = 'learn'; target = undefined;
  $('stage-title').textContent = t('Explore your notes'); $('round-count').textContent = t('No rush');
  $('prompt').textContent = scope === 'starter' ? t('Start with C, D & E') : t('Get to know this patch of the neck');
  $('prompt-help').textContent = t('Tap a labeled note to hear it. Then find it on your guitar.');
  $('feedback').textContent = t('Learn the locations first. You can take as long as you like.');
  render();
}
$('explore').addEventListener('click', explore);
$('practice-mode').addEventListener('change', () => { path = readLevels(modeStorage); history = readProgress(modeStorage); scope = path.selected; pool = locations(scope); $('scope').value = scope; openTiers.add(LEVELS.find(l => l.id === scope).tier); setVisible('level-celebration', false); explore(); });
$('scope').addEventListener('change', () => selectLevel($('scope').value));
function stopAudio() {
  audioGeneration++;
  for (const node of voices) { try { node.stop(); } catch { /* Already stopped. */ } }
  voices.clear();
}
let audioGeneration = 0;
async function playNotes(notes) {
  stopAudio(); const generation = ++audioGeneration;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!audio || audio.state === 'closed') audio = new Audio();
    await audio.resume();
    if (generation !== audioGeneration || document.hidden) return;
    setVisible('audio-error', false);
    const start = audio.currentTime + .03;
    notes.forEach((note, index) => {
      if (!note) return;
      const oscillator = audio.createOscillator(), envelope = audio.createGain(), at = start + index * .5;
      oscillator.type = 'triangle'; oscillator.frequency.value = 440 * 2 ** ((note.midi - 69) / 12);
      envelope.gain.setValueAtTime(0, at); envelope.gain.linearRampToValueAtTime(.16, at + .015); envelope.gain.exponentialRampToValueAtTime(.001, at + .42);
      oscillator.connect(envelope); envelope.connect(audio.destination); voices.add(oscillator);
      oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(at); oscillator.stop(at + .45);
    });
  } catch { $('audio-error').textContent = t('Sound could not start in this browser. You can keep practicing visually or play the notes on your guitar.'); setVisible('audio-error', true); }
}
function releaseAudio() { audioGeneration++; stopAudio(); if (audio && audio.state !== 'closed') audio.close().catch(() => {}); audio = undefined; }
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAudio(); });
window.addEventListener('pagehide', releaseAudio);
explore();

document.fonts.load('80px Bravura', '\uE050').then(faces => { if (!faces.length) throw Error(t('Missing font')); notationReady = true; render(); }).catch(() => { $('notation-error').textContent = t('The notation font could not load. Reload to use staff answers; note-name practice is still available.'); setVisible('notation-error', true); });
