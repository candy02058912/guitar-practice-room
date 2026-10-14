import { t } from './i18n.js';
export const STRINGS = [
  { name: t('high E'), midi: 64 }, { name: 'B', midi: 59 }, { name: 'G', midi: 55 },
  { name: 'D', midi: 50 }, { name: 'A', midi: 45 }, { name: t('low E'), midi: 40 },
];
export const NAMES = ['C', 'C♯ / D♭', 'D', 'D♯ / E♭', 'E', 'F', 'F♯ / G♭', 'G', 'G♯ / A♭', 'A', 'A♯ / B♭', 'B'];
export const SCOPES = {
  starter: { label: t('First three notes · B string'), strings: [1], max: 5, frets: [1, 3, 5] },
  b: { label: t('B string · natural notes'), strings: [1], max: 12 },
  e: { label: t('Low E string · natural notes'), strings: [5], max: 12 },
  a: { label: t('A string · natural notes'), strings: [4], max: 12 },
  first: { label: t('All strings · natural notes, frets 0–5'), strings: [0, 1, 2, 3, 4, 5], max: 5 },
  full: { label: t('All strings · all notes, frets 0–12'), strings: [0, 1, 2, 3, 4, 5], max: 12, chromatic: true },
};
export function position(string, fret) {
  const midi = STRINGS[string].midi + fret;
  return { id: `${string}:${fret}`, string, fret, midi, name: NAMES[midi % 12] };
}
export function locations(scope) {
  return SCOPES[scope].strings.flatMap(string => Array.from({ length: SCOPES[scope].max + 1 }, (_, fret) => position(string, fret)))
    .filter(p => SCOPES[scope].frets ? SCOPES[scope].frets.includes(p.fret) : SCOPES[scope].chromatic || !p.name.includes('♯'));
}
// Every location appears before repeating; within each pass, missed notes are favored.
export function choose(pool, history, seen, previous, random = Math.random) {
  let candidates = pool.filter(p => !seen.has(p.id));
  if (!candidates.length) { seen.clear(); candidates = pool; }
  if (candidates.length > 1) candidates = candidates.filter(p => p.id !== previous);
  const weights = candidates.map(p => 1 + Math.min(5, history[p.id]?.misses || 0));
  let cursor = random() * weights.reduce((a, b) => a + b, 0);
  const result = candidates.find((p, i) => (cursor -= weights[i]) < 0) || candidates.at(-1);
  seen.add(result.id);
  return result;
}
export function readProgress(storage) {
  try {
    const data = JSON.parse(storage.getItem('practice-room.fretboard.v1'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.fromEntries(Object.entries(data).filter(([id, value]) => /^[0-5]:(?:[0-9]|1[0-2])$/.test(id)
      && value && Number.isSafeInteger(value.hits) && value.hits >= 0 && Number.isSafeInteger(value.misses) && value.misses >= 0));
  } catch { return {}; }
}

export const TIERS = [t('First notes'), t('Connect strings'), t('Learn the neck'), t('Sharps & flats')];
const natural = (label, strings, max = 5) => ({ label, strings, max });
Object.assign(SCOPES, {
  bFirst: natural(t('B string · frets 0–5'), [1]),
  highFirst: natural(t('High E · frets 0–5'), [0]),
  gFirst: natural(t('G string · frets 0–5'), [2]),
  dFirst: natural(t('D string · frets 0–5'), [3]),
  aFirst: natural(t('A string · frets 0–5'), [4]),
  lowFirst: natural(t('Low E · frets 0–5'), [5]),
  topPair: natural(t('High E + B · frets 0–5'), [0, 1]),
  middlePair: natural(t('G + D · frets 0–5'), [2, 3]),
  bottomPair: natural(t('A + low E · frets 0–5'), [4, 5]),
  high: natural(t('High E · natural notes'), [0], 12),
  g: natural(t('G string · natural notes'), [2], 12),
  d: natural(t('D string · natural notes'), [3], 12),
  naturals: natural(t('All strings · natural notes, frets 0–12'), [0, 1, 2, 3, 4, 5], 12),
  topChromatic: { ...natural(t('High E, B + G · all notes, frets 0–5'), [0, 1, 2]), chromatic: true },
  bottomChromatic: { ...natural(t('D, A + low E · all notes, frets 0–5'), [3, 4, 5]), chromatic: true },
  firstChromatic: { ...natural(t('All strings · all notes, frets 0–5'), [0, 1, 2, 3, 4, 5]), chromatic: true },
  topFull: { ...natural(t('High E, B + G · all notes, frets 0–12'), [0, 1, 2], 12), chromatic: true },
  bottomFull: { ...natural(t('D, A + low E · all notes, frets 0–12'), [3, 4, 5], 12), chromatic: true },
});
export const LEVELS = [
  ['starter', t('Your first three notes'), 0], ['bFirst', t('The B string'), 0], ['highFirst', t('The high E string'), 0],
  ['gFirst', t('The G string'), 0], ['dFirst', t('The D string'), 0], ['aFirst', t('The A string'), 0], ['lowFirst', t('The low E string'), 0],
  ['topPair', t('The top two strings'), 1], ['middlePair', t('The middle two strings'), 1], ['bottomPair', t('The bottom two strings'), 1], ['first', t('All six, one small area'), 1],
  ['b', t('B to the twelfth fret'), 2], ['high', t('High E to the twelfth fret'), 2], ['g', t('G to the twelfth fret'), 2],
  ['d', t('D to the twelfth fret'), 2], ['a', t('A to the twelfth fret'), 2], ['e', t('Low E to the twelfth fret'), 2], ['naturals', t('Natural notes across the neck'), 2],
  ['topChromatic', t('Sharps & flats on the top three'), 3], ['bottomChromatic', t('Sharps & flats on the bottom three'), 3],
  ['firstChromatic', t('Every note, frets 0–5'), 3], ['topFull', t('Top three across the neck'), 3], ['bottomFull', t('Bottom three across the neck'), 3], ['full', t('The whole fretboard, frets 0–12'), 3],
].map(([id, title, tier], index) => ({ id, title, tier, number: index + 1 }));
export const LEVEL_KEY = 'practice-room.fretboard.levels.v1';
export function readLevels(storage) {
  const clean = { selected: 'starter', levels: {} };
  try {
    const raw = JSON.parse(storage.getItem(LEVEL_KEY));
    if (LEVELS.some(l => l.id === raw?.selected)) clean.selected = raw.selected;
    for (const level of LEVELS) {
      const entry = raw?.levels?.[level.id];
      if (!entry || typeof entry !== 'object') continue;
      const hits = {};
      for (const p of locations(level.id)) {
        const count = entry.hits?.[p.id];
        if (Number.isSafeInteger(count) && count > 0) hits[p.id] = Math.min(2, count);
      }
      clean.levels[level.id] = { hits, complete: entry.complete === true && locations(level.id).every(p => hits[p.id] === 2) };
    }
  } catch { /* An unavailable or corrupt store starts a fresh path. */ }
  return clean;
}
export function levelProgress(path, id) {
  const pool = locations(id), entry = path.levels[id];
  return { earned: pool.reduce((n, p) => n + Math.min(2, entry?.hits?.[p.id] || 0), 0), total: pool.length * 2, complete: entry?.complete === true };
}
export function recordLevel(path, id, positionId) {
  const entry = path.levels[id] ||= { hits: {}, complete: false };
  entry.hits[positionId] = Math.min(2, (entry.hits[positionId] || 0) + 1);
}
export function finishLevel(path, id) {
  const progress = levelProgress(path, id);
  if (progress.earned !== progress.total || progress.complete) return false;
  path.levels[id].complete = true;
  return true;
}
export function levelPool(path, id) {
  const pool = locations(id), entry = path.levels[id];
  const minimum = Math.min(...pool.map(p => entry?.hits?.[p.id] || 0));
  return minimum < 2 ? pool.filter(p => (entry?.hits?.[p.id] || 0) === minimum) : pool;
}
