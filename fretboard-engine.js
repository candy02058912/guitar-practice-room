export const STRINGS = [
  { name: 'high E', midi: 64 }, { name: 'B', midi: 59 }, { name: 'G', midi: 55 },
  { name: 'D', midi: 50 }, { name: 'A', midi: 45 }, { name: 'low E', midi: 40 },
];
export const NAMES = ['C', 'C♯ / D♭', 'D', 'D♯ / E♭', 'E', 'F', 'F♯ / G♭', 'G', 'G♯ / A♭', 'A', 'A♯ / B♭', 'B'];
export const SCOPES = {
  starter: { label: 'First three notes · B string', strings: [1], max: 5, frets: [1, 3, 5] },
  b: { label: 'B string · natural notes', strings: [1], max: 12 },
  e: { label: 'Low E string · natural notes', strings: [5], max: 12 },
  a: { label: 'A string · natural notes', strings: [4], max: 12 },
  first: { label: 'All strings · natural notes, frets 0–5', strings: [0, 1, 2, 3, 4, 5], max: 5 },
  full: { label: 'All strings · all notes, frets 0–12', strings: [0, 1, 2, 3, 4, 5], max: 12, chromatic: true },
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

export const TIERS = ['First notes', 'Connect strings', 'Learn the neck', 'Sharps & flats'];
const natural = (label, strings, max = 5) => ({ label, strings, max });
Object.assign(SCOPES, {
  bFirst: natural('B string · frets 0–5', [1]),
  highFirst: natural('High E · frets 0–5', [0]),
  gFirst: natural('G string · frets 0–5', [2]),
  dFirst: natural('D string · frets 0–5', [3]),
  aFirst: natural('A string · frets 0–5', [4]),
  lowFirst: natural('Low E · frets 0–5', [5]),
  topPair: natural('High E + B · frets 0–5', [0, 1]),
  middlePair: natural('G + D · frets 0–5', [2, 3]),
  bottomPair: natural('A + low E · frets 0–5', [4, 5]),
  high: natural('High E · natural notes', [0], 12),
  g: natural('G string · natural notes', [2], 12),
  d: natural('D string · natural notes', [3], 12),
  naturals: natural('All strings · natural notes, frets 0–12', [0, 1, 2, 3, 4, 5], 12),
  topChromatic: { ...natural('High E, B + G · all notes, frets 0–5', [0, 1, 2]), chromatic: true },
  bottomChromatic: { ...natural('D, A + low E · all notes, frets 0–5', [3, 4, 5]), chromatic: true },
  firstChromatic: { ...natural('All strings · all notes, frets 0–5', [0, 1, 2, 3, 4, 5]), chromatic: true },
  topFull: { ...natural('High E, B + G · all notes, frets 0–12', [0, 1, 2], 12), chromatic: true },
  bottomFull: { ...natural('D, A + low E · all notes, frets 0–12', [3, 4, 5], 12), chromatic: true },
});
export const LEVELS = [
  ['starter', 'Your first three notes', 0], ['bFirst', 'The B string', 0], ['highFirst', 'The high E string', 0],
  ['gFirst', 'The G string', 0], ['dFirst', 'The D string', 0], ['aFirst', 'The A string', 0], ['lowFirst', 'The low E string', 0],
  ['topPair', 'The top two strings', 1], ['middlePair', 'The middle two strings', 1], ['bottomPair', 'The bottom two strings', 1], ['first', 'All six, one small area', 1],
  ['b', 'B to the twelfth fret', 2], ['high', 'High E to the twelfth fret', 2], ['g', 'G to the twelfth fret', 2],
  ['d', 'D to the twelfth fret', 2], ['a', 'A to the twelfth fret', 2], ['e', 'Low E to the twelfth fret', 2], ['naturals', 'Natural notes across the neck', 2],
  ['topChromatic', 'Sharps & flats on the top three', 3], ['bottomChromatic', 'Sharps & flats on the bottom three', 3],
  ['firstChromatic', 'Every note, frets 0–5', 3], ['topFull', 'Top three across the neck', 3], ['bottomFull', 'Bottom three across the neck', 3], ['full', 'The whole fretboard, frets 0–12', 3],
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
