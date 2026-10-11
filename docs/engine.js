// Detect fresh attacks rather than counting every frame of a ringing chord.
export class StrumDetector {
  constructor(sensitivity = 55) {
    this.sensitivity = sensitivity;
    this.floor = 0.003;
    this.envelope = 0;
    this.lastLevel = 0;
    this.lastHit = -Infinity;
    this.settledSince = null;
    this.ready = true;
  }
  calibrate(rms) {
    this.floor = this.floor * 0.94 + rms * 0.06;
    this.envelope = rms;
    this.lastLevel = rms;
  }
  feed(rms, now) {
    const threshold = Math.max(0.004, 0.045 * Math.pow(0.12, this.sensitivity / 100), this.floor * 3.5);
    const previous = this.envelope;
    this.envelope = previous * 0.8 + rms * 0.2;
    // Re-arm after the attack settles, even if the previous chord is still loud.
    // A continuous rise cannot re-arm itself and count as multiple strums.
    if (rms <= this.lastLevel * 1.03 || rms < threshold * 0.7) {
      if (this.settledSince === null) this.settledSince = now;
      if (now - this.settledSince >= 64) this.ready = true;
    } else {
      this.settledSince = null;
    }
    this.lastLevel = rms;
    const attack = rms > Math.max(previous * 1.3, previous + threshold * 0.4);
    const hit = this.ready && rms > threshold && attack && now - this.lastHit >= 230;
    if (hit) {
      this.lastHit = now;
      this.settledSince = null;
      this.ready = false;
    }
    return hit;
  }
}

export class PracticeRound {
  constructor() { this.startedAt = null; this.count = 0; }
  hit(now) {
    if (this.startedAt === null) this.startedAt = now;
    if (this.expired(now)) return false;
    this.count += 1;
    return true;
  }
  remaining(now) { return this.startedAt === null ? 60000 : Math.max(0, 60000 - (now - this.startedAt)); }
  expired(now) { return this.startedAt !== null && this.remaining(now) === 0; }
}
export const pairKey = (a, b) => [a, b].sort().join('|');
export function validSession(s) {
  return s && typeof s.id === 'string' && Array.isArray(s.chords) && s.chords.length === 2 && s.chords.every(c => typeof c === 'string' && c.length <= 12) && Number.isInteger(s.count) && s.count >= 0 && s.count <= 999 && typeof s.date === 'string' && Number.isFinite(Date.parse(s.date));
}
