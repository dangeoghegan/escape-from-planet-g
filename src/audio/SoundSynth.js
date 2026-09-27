/**
 * SoundSynth.js - Web Audio API procedural sound effects generator.
 * Zero external audio files; 100% generated in real time.
 */

export class SoundSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.sfxVolume = 0.8;
    this.musicVolume = 0.7;
    this.isMuted = false;

    // Continuous engine sound
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.updateMuteState();
    } catch (e) {
      console.warn('Web Audio not supported or blocked', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    this.updateMuteState();
  }

  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  updateMuteState() {
    if (!this.masterGain || !this.ctx) return;
    const target = this.isMuted ? 0 : 1;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
  }

  // Continuous engine hum
  startEngine() {
    if (!this.ctx || this.isEngineRunning) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 75;

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 220;

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.08;

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn('Engine sound init failed', e);
    }
  }

  updateEngine(speedRatio, isBoosting, isBraking) {
    if (!this.isEngineRunning || !this.ctx) return;
    const now = this.ctx.currentTime;
    let baseFreq = 70 + speedRatio * 85;
    let filterFreq = 180 + speedRatio * 320;
    let gain = 0.07 + speedRatio * 0.05;

    if (isBoosting) {
      baseFreq += 40;
      filterFreq += 300;
      gain += 0.05;
    } else if (isBraking) {
      baseFreq = Math.max(50, baseFreq - 20);
      filterFreq = Math.max(120, filterFreq - 80);
    }

    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);
    this.engineGain.gain.setTargetAtTime(gain, now, 0.08);
  }

  stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      }
      this.isEngineRunning = false;
    } catch (e) {}
  }

  playBoost() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.35);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playBrake() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playSpearWhoosh() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Resonant high whistle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playHit() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Low punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.26);

    // Crackle noise
    this.playNoise(0.2, 0.25, 450);
  }

  playRockWarning() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(130, now + 0.5);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.65);
  }

  playVentErupt() {
    this.ensureContext();
    if (!this.ctx) return;
    this.playNoise(0.4, 0.3, 300);
  }

  playExplosion() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Sub rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 1.2);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.5);

    // Roaring noise explosion
    this.playNoise(1.2, 0.45, 600);
  }

  playCheckpoint() {
    this.ensureContext();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.38);
    });
  }

  playExtractionBeam() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chord = [392.0, 493.88, 587.33, 783.99]; // G major
    chord.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.1);
    });
  }

  playExtractionComplete() {
    this.ensureContext();
    if (!this.ctx) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.55);
    });
  }

  playVictory() {
    this.ensureContext();
    if (!this.ctx) return;
    const notes = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.2 },
      { f: 1046.5, d: 0.6 },
    ];
    let time = this.ctx.currentTime;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = n.f;

      gain.gain.setValueAtTime(0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + n.d + 0.05);
      time += n.d;
    });
  }

  playButton() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  playNoise(duration, peakGain, filterCutoff) {
    if (!this.ctx) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterCutoff;

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + duration + 0.05);
    } catch (e) {}
  }
}

export const sound = new SoundSynth();
