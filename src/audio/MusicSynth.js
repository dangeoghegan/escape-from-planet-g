/**
 * MusicSynth.js - Procedural 1980s-inspired synth soundtrack generator using Web Audio API.
 * 100% original synthwave / arcade tracks with bassline, arpeggiator, and lead melodies.
 */

// Note frequencies
const N = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
};

// Original musical patterns for each theme
const THEMES = {
  broken_sky: {
    bpm: 126,
    chords: [
      { bass: N.A2, arp: [N.A3, N.C4, N.E4, N.A4] },
      { bass: N.F2, arp: [N.F3, N.A3, N.C4, N.F4] },
      { bass: N.C2, arp: [N.C3, N.E3, N.G3, N.C4] },
      { bass: N.G2, arp: [N.G3, N.B3, N.D4, N.G4] },
    ],
    melody: [
      { note: N.E4, step: 0, dur: 3 },
      { note: N.G4, step: 3, dur: 3 },
      { note: N.A4, step: 6, dur: 4 },
      { note: N.B4, step: 10, dur: 2 },
      { note: N.C5, step: 12, dur: 4 },
      // Bar 2
      { note: N.A4, step: 16, dur: 4 },
      { note: N.F4, step: 20, dur: 4 },
      { note: N.E4, step: 24, dur: 6 },
    ],
  },
  root_caves: {
    bpm: 120,
    chords: [
      { bass: N.D2, arp: [N.D3, N.F3, N.A3, N.D4] },
      { bass: N.A2, arp: [N.A3, N.C4, N.E4, N.A4] },
      { bass: N.B2, arp: [N.B3, N.D4, N.F4, N.B4] },
      { bass: N.G2, arp: [N.G3, N.B3, N.D4, N.G4] },
    ],
    melody: [
      { note: N.D4, step: 0, dur: 4 },
      { note: N.F4, step: 4, dur: 4 },
      { note: N.E4, step: 8, dur: 4 },
      { note: N.A4, step: 12, dur: 4 },
      { note: N.D5, step: 16, dur: 6 },
      { note: N.C5, step: 22, dur: 2 },
      { note: N.B4, step: 24, dur: 6 },
    ],
  },
  crystal_fault: {
    bpm: 128,
    chords: [
      { bass: N.E2, arp: [N.E3, N.G3, N.B3, N.E4] },
      { bass: N.C2, arp: [N.C3, N.E3, N.G3, N.C4] },
      { bass: N.D2, arp: [N.D3, N.F3, N.A3, N.D4] },
      { bass: N.B2, arp: [N.B3, N.D4, N.F4, N.B4] },
    ],
    melody: [
      { note: N.B4, step: 0, dur: 2 },
      { note: N.G4, step: 2, dur: 2 },
      { note: N.E4, step: 4, dur: 4 },
      { note: N.G4, step: 8, dur: 4 },
      { note: N.B4, step: 12, dur: 4 },
      { note: N.E5, step: 16, dur: 6 },
      { note: N.D5, step: 22, dur: 2 },
      { note: N.B4, step: 24, dur: 6 },
    ],
  },
  ember_veins: {
    bpm: 132,
    chords: [
      { bass: N.F2, arp: [N.F3, N.A3, N.C4, N.F4] },
      { bass: N.E2, arp: [N.E3, N.G3, N.B3, N.E4] },
      { bass: N.D2, arp: [N.D3, N.F3, N.A3, N.D4] },
      { bass: N.E2, arp: [N.E3, N.G3, N.B3, N.E4] },
    ],
    melody: [
      { note: N.A4, step: 0, dur: 3 },
      { note: N.C5, step: 3, dur: 3 },
      { note: N.B4, step: 6, dur: 4 },
      { note: N.G4, step: 10, dur: 2 },
      { note: N.A4, step: 12, dur: 4 },
      { note: N.E4, step: 16, dur: 4 },
      { note: N.F4, step: 20, dur: 4 },
      { note: N.E4, step: 24, dur: 8 },
    ],
  },
  heart_of_planet_g: {
    bpm: 128,
    chords: [
      { bass: N.C2, arp: [N.C3, N.E3, N.G3, N.C4] },
      { bass: N.G2, arp: [N.G3, N.B3, N.D4, N.G4] },
      { bass: N.A2, arp: [N.A3, N.C4, N.E4, N.A4] },
      { bass: N.F2, arp: [N.F3, N.A3, N.C4, N.F4] },
    ],
    melody: [
      { note: N.G4, step: 0, dur: 4 },
      { note: N.C5, step: 4, dur: 4 },
      { note: N.D5, step: 8, dur: 4 },
      { note: N.E5, step: 12, dur: 4 },
      { note: N.D5, step: 16, dur: 4 },
      { note: N.C5, step: 20, dur: 4 },
      { note: N.B4, step: 24, dur: 4 },
      { note: N.C5, step: 28, dur: 4 },
    ],
  },
  escape_run: {
    bpm: 142,
    chords: [
      { bass: N.A2, arp: [N.A3, N.C4, N.E4, N.A4] },
      { bass: N.F2, arp: [N.F3, N.A3, N.C4, N.F4] },
      { bass: N.D2, arp: [N.D3, N.F3, N.A3, N.D4] },
      { bass: N.E2, arp: [N.E3, N.G3, N.B3, N.E4] },
    ],
    melody: [
      { note: N.A4, step: 0, dur: 2 },
      { note: N.C5, step: 2, dur: 2 },
      { note: N.E5, step: 4, dur: 2 },
      { note: N.D5, step: 6, dur: 2 },
      { note: N.C5, step: 8, dur: 2 },
      { note: N.B4, step: 10, dur: 2 },
      { note: N.A4, step: 12, dur: 4 },
      { note: N.F5, step: 16, dur: 4 },
      { note: N.E5, step: 20, dur: 4 },
      { note: N.D5, step: 24, dur: 4 },
      { note: N.E5, step: 28, dur: 4 },
    ],
  },
};

export class MusicSynth {
  constructor(soundSynth) {
    this.sound = soundSynth;
    this.isPlaying = false;
    this.currentThemeName = 'broken_sky';
    this.themeData = THEMES.broken_sky;

    this.timerId = null;
    this.nextNoteTime = 0;
    this.current16thStep = 0;
    this.lookaheadMs = 25.0;
    this.scheduleAheadSec = 0.12;
  }

  playTheme(themeName) {
    if (this.currentThemeName === themeName && this.isPlaying) return;
    this.currentThemeName = themeName;
    this.themeData = THEMES[themeName] || THEMES.broken_sky;

    if (!this.isPlaying) {
      this.sound.ensureContext();
      if (!this.sound.ctx) return;
      this.isPlaying = true;
      this.current16thStep = 0;
      this.nextNoteTime = this.sound.ctx.currentTime + 0.05;
      this.scheduler();
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  scheduler() {
    if (!this.isPlaying || !this.sound.ctx) return;

    while (this.nextNoteTime < this.sound.ctx.currentTime + this.scheduleAheadSec) {
      this.scheduleStep(this.current16thStep, this.nextNoteTime);
      this.advanceStep();
    }

    this.timerId = setTimeout(() => this.scheduler(), this.lookaheadMs);
  }

  advanceStep() {
    const secondsPerBeat = 60.0 / this.themeData.bpm;
    const secondsPer16th = 0.25 * secondsPerBeat;
    this.nextNoteTime += secondsPer16th;
    this.current16thStep = (this.current16thStep + 1) % 32; // 32 steps = 2 bars
  }

  scheduleStep(step, time) {
    const ctx = this.sound.ctx;
    const dest = this.sound.musicGain;
    if (!ctx || !dest) return;

    const chordIndex = Math.floor(step / 8) % this.themeData.chords.length;
    const chord = this.themeData.chords[chordIndex];

    // 1. Synthwave Bass (octaves pulsing on every 16th or 8th)
    if (step % 2 === 0) {
      const isUp = (step % 4 === 2);
      const bassFreq = isUp ? chord.bass * 2 : chord.bass;
      this.playSynthNote(bassFreq, time, 0.12, 'sawtooth', 0.18, 380, dest);
    }

    // 2. Arpeggiator (shimmering 16th notes)
    const arpNotes = chord.arp;
    const arpFreq = arpNotes[step % arpNotes.length];
    this.playSynthNote(arpFreq, time, 0.08, 'triangle', 0.09, 850, dest);

    // 3. Lead melody
    const melodyNotes = this.themeData.melody || [];
    const leadNote = melodyNotes.find(m => m.step === step);
    if (leadNote) {
      const durationSec = (60.0 / this.themeData.bpm) * 0.25 * leadNote.dur;
      this.playSynthNote(leadNote.note, time, durationSec, 'sawtooth', 0.14, 1400, dest);
    }
  }

  playSynthNote(freq, time, duration, waveType, volume, filterCutoff, dest) {
    const ctx = this.sound.ctx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterCutoff, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(100, filterCutoff * 0.4), time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }
}
