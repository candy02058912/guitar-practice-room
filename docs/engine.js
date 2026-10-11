// Half-octave bands reduce FFT-bin jitter while retaining changes in harmonics.
// Web Audio provides dB values; return linear band amplitudes on the input-boost scale.
export function guitarBands(decibels, sampleRate, boost = 1, bands = new Float32Array(16)) {
  bands.fill(0);
  const binHz = sampleRate / (decibels.length * 2);
  for (let i = 1; i < decibels.length; i++) {
    const hz = i * binHz;
    if (hz < 70 || hz >= 8000 || !Number.isFinite(decibels[i])) continue;
    const band = Math.floor(2 * Math.log2(hz / 70));
    bands[band] += 10 ** (decibels[i] / 10);
  }
  for (let i = 0; i < bands.length; i++) bands[i] = Math.sqrt(bands[i]) * boost;
  return bands;
}

class SpectralAttack {
  constructor() {
    this.noise = new Float32Array(16);
    this.previous = new Float32Array(16);
  }
  calibrate(bands) {
    if (!bands) return;
    for (let i = 0; i < bands.length; i++) {
      this.noise[i] = this.noise[i] * 0.94 + bands[i] * 0.06;
      this.previous[i] = bands[i];
    }
  }
  feed(bands, sensitivity) {
    if (!bands) return false;
    let novelty = 0, total = 0, risingBands = 0;
    for (let i = 0; i < bands.length; i++) {
      const level = bands[i], previous = this.previous[i];
      // Compress the band levels so one loud open string cannot mask softer notes.
      const weight = Math.sqrt(level);
      total += weight;
      if (level > Math.max(previous * 1.2, this.noise[i] * 3.5, 0.00001)) {
        novelty += weight - Math.sqrt(previous);
        risingBands++;
      }
      this.previous[i] = level;
    }
    // Multiple rising bands reject a lone fluctuating frequency; decreases never count.
    return risingBands >= 2 && novelty / Math.max(total, 0.00001) > 0.3 - sensitivity * 0.0012;
  }
}

// Detect fresh attacks rather than counting every frame of a ringing chord.
export class StrumDetector {
  constructor(sensitivity = 55) {
    this.sensitivity = sensitivity;
    this.spectral = new SpectralAttack();
    this.floor = 0.003;
    this.envelope = 0;
    this.lastLevel = 0;
    this.lastFrameTime = null;
    this.lastHit = -Infinity;
    this.settledSince = null;
    this.ready = true;
  }
  calibrate(rms, bands) {
    this.spectral.calibrate(bands);
    this.floor = this.floor * 0.94 + rms * 0.06;
    this.envelope = rms;
    this.lastLevel = rms;
  }
  feed(rms, now, bands) {
    const spectralAttack = this.spectral.feed(bands, this.sensitivity);
    const threshold = Math.max(0.004, 0.045 * Math.pow(0.12, this.sensitivity / 100), this.floor * 3.5);
    const previous = this.envelope;
    const elapsed = this.lastFrameTime === null ? 16 : Math.max(0, now - this.lastFrameTime);
    this.lastFrameTime = now;
    const blend = 1 - Math.exp(-elapsed / 72);
    this.envelope = previous + (rms - previous) * blend;
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
    const hit = rms > threshold && ((this.ready && attack) || spectralAttack) && now - this.lastHit >= 230;
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
