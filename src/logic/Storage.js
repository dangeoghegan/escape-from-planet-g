/**
 * Storage.js - Manages local persistence for progress and settings.
 */

const STORAGE_KEY = 'escape_from_planet_g_save_v1';

const DEFAULT_DATA = {
  unlockedLevel: 1, // 1 to 5
  highScores: {},
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    muted: false,
    reducedFlash: false,
    reducedShake: false,
    skipCrashCinematic: false,
    invertPitch: false,
  },
};

export class StorageManager {
  constructor(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
    this.storage = storage;
    this.data = this.load();
  }

  load() {
    if (!this.storage) {
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
      const parsed = JSON.parse(raw);
      return {
        unlockedLevel: Math.max(1, Math.min(5, parsed.unlockedLevel || 1)),
        highScores: parsed.highScores || {},
        settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
      };
    } catch (e) {
      console.warn('Failed to load save data, resetting to defaults', e);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  save() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save data', e);
    }
  }

  getUnlockedLevel() {
    return this.data.unlockedLevel;
  }

  unlockLevel(levelNum) {
    if (levelNum > this.data.unlockedLevel && levelNum <= 5) {
      this.data.unlockedLevel = levelNum;
      this.save();
    }
  }

  getSettings() {
    return { ...this.data.settings };
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  resetProgress() {
    this.data.unlockedLevel = 1;
    this.data.highScores = {};
    this.save();
  }
}

export const storage = new StorageManager();
