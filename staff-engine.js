import { t } from './i18n.js';
// Positions are written pitches. Guitar sounds one octave below treble notation.
const LETTERS = 'CDEFGAB';
const PITCHES = [0, 2, 4, 5, 7, 9, 11];
export const STAFF_KEY = 'practice-room.staff.v1';
export function note(id) {
  const match = /^([A-G])([#b]?)([3-6])$/.exec(id);
  if (!match) throw new Error(t('Invalid written note'));
  const [, letter, accidental, octaveText] = match, octave = Number(octaveText);
  const index = LETTERS.indexOf(letter), step = octave * 7 + index;
  const writtenMidi = (octave + 1) * 12 + PITCHES[index] + (accidental === '#' ? 1 : accidental === 'b' ? -1 : 0);
  return { id, letter, accidental, octave, step, name: letter + accidental, label: letter + accidental.replace('#', '♯').replace('b', '♭'), writtenMidi, midi: writtenMidi - 12 };
}
function range(first, last) {
  return Array.from({ length: note(last).step - note(first).step + 1 }, (_, i) => {
    const step = note(first).step + i; return LETTERS[step % 7] + Math.floor(step / 7);
  });
}
const staff = range('E4', 'F5'), wide = range('E3', 'A5');
const alter = (ids, accidental) => ids.filter(id => !(accidental === '#' ? 'EB' : 'CF').includes(id[0])).map(id => id[0] + accidental + id.slice(1));
export const TIERS = [t('Lines & spaces'), t('Beyond the staff'), t('Sharps & flats')];
export const LEVELS = [
  ['familiar', t('Your familiar C, D & E'), 0, ['C5', 'D5', 'E5']],
  ['lower-lines', t("Lower lines: E, G & B"), 0, ['E4', 'G4', 'B4']],
  ['upper-lines', t("Upper lines: B, D & F"), 0, ['B4', 'D5', 'F5']],
  ['spaces', t('The spaces spell FACE'), 0, ['F4', 'A4', 'C5', 'E5']],
  ['inside', t('All lines and spaces'), 0, staff],
  ['below', t("Just below: C & D"), 1, ['C4', 'D4', 'E4']],
  ['above', t("Just above: G & A"), 1, ['F5', 'G5', 'A5']],
  ['open-strings', t('Your six open strings'), 1, ['E3', 'A3', 'D4', 'G4', 'B4', 'E5']],
  ['natural-range', t('Natural notes, low to high'), 1, wide],
  ['sharps', t('Read the sharps'), 2, alter(staff, '#')],
  ['flats', t('Read the flats'), 2, alter(staff, 'b')],
  ['mixed', t('Put it all together'), 2, [...wide, ...alter(wide, '#'), ...alter(wide, 'b')]],
].map(([id, title, tier, ids], index) => ({ id, title, tier, number: index + 1, notes: ids.map(note).filter(n => n.midi >= 40 && n.midi <= 76) }));
export function geometry(n) {
  const y = 160 - (n.step - 30) * 10, ledger = [];
  for (let step = 28; step >= n.step; step -= 2) ledger.push(160 - (step - 30) * 10);
  for (let step = 40; step <= n.step; step += 2) ledger.push(160 - (step - 30) * 10);
  return { y, ledger, stemDown: n.step >= 34 };
}
export function describe(n) {
  const relative = n.step - 30;
  const where = relative >= 0 && relative <= 8 ? (relative % 2 === 0 ? t`line ${relative / 2 + 1} from the bottom` : t`space ${(relative + 1) / 2} from the bottom`)
    : t`${Math.abs(relative < 0 ? relative : relative - 8)} line-or-space steps ${relative < 0 ? t('below') : t('above')} the staff`;
  return `${where}${n.accidental ? t`, with a ${n.accidental === '#' ? t('sharp') : t('flat')}` : t(', no accidental')}`;
}
export function parseAnswer(value) {
  const normalized = value.trim().replaceAll('♯', '#').replaceAll('♭', 'b');
  const match = /^([a-g])([#b]?)([0-9])?$/i.exec(normalized);
  if (!match) return null;
  return { name: match[1].toUpperCase() + match[2].toLowerCase(), octave: match[3] === undefined ? null : Number(match[3]) };
}
export function matches(value, n) {
  const parsed = parseAnswer(value);
  return Boolean(parsed && parsed.name === n.name && (parsed.octave === null || parsed.octave === n.octave));
}
const tuning = [{ name: t('high E'), midi: 64 }, { name: 'B', midi: 59 }, { name: 'G', midi: 55 }, { name: 'D', midi: 50 }, { name: 'A', midi: 45 }, { name: t('low E'), midi: 40 }];
export function guitarLocations(n) {
  return tuning.map(s => ({ string: s.name, fret: n.midi - s.midi })).filter(p => p.fret >= 0 && p.fret <= 12).sort((a, b) => a.fret - b.fret);
}
export function readState(storage) {
  const clean = { selected: LEVELS[0].id, levels: {} };
  try {
    const data = JSON.parse(storage.getItem(STAFF_KEY));
    if (LEVELS.some(l => l.id === data?.selected)) clean.selected = data.selected;
    for (const level of LEVELS) {
      const hits = {};
      for (const n of level.notes) {
        const value = data?.levels?.[level.id]?.hits?.[n.id];
        if (Number.isSafeInteger(value) && value > 0) hits[n.id] = Math.min(2, value);
      }
      clean.levels[level.id] = { hits, complete: data?.levels?.[level.id]?.complete === true && level.notes.every(n => hits[n.id] === 2) };
    }
  } catch { /* Local-only practice still works without storage. */ }
  return clean;
}
export function progress(state, level) {
  const entry = state.levels[level.id];
  return { earned: level.notes.reduce((sum, n) => sum + (entry?.hits[n.id] || 0), 0), total: level.notes.length * 2, complete: entry?.complete === true };
}
export function credit(state, level, n) {
  const entry = state.levels[level.id] ||= { hits: {}, complete: false };
  entry.hits[n.id] = Math.min(2, (entry.hits[n.id] || 0) + 1);
}
export function completeLevel(state, level) {
  const p = progress(state, level);
  if (p.earned !== p.total || p.complete) return false;
  state.levels[level.id].complete = true; return true;
}
export function pick(state, level, previous, random = Math.random) {
  const hits = state.levels[level.id]?.hits || {}, min = Math.min(...level.notes.map(n => hits[n.id] || 0));
  let candidates = level.notes.filter(n => (hits[n.id] || 0) === min);
  if (candidates.length > 1) candidates = candidates.filter(n => n.id !== previous);
  return candidates[Math.floor(random() * candidates.length)];
}
