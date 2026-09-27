/**
 * MenuManager.js - UI Manager handling Title Screen, Level Select, Pause Menu,
 * Failure Screen, Victory Screen, Settings Modal, and Controls Guide.
 */
import { PORTRAITS } from './Portraits.js';
import { storage } from '../logic/Storage.js';
import { sound } from '../audio/SoundSynth.js';
import { LEVELS } from '../levels/index.js';

export class MenuManager {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.element = null;

    this.activeScreen = 'title'; // 'title', 'playing', 'pause', 'failed', 'victory', 'settings', 'controls', 'level_select'
    this.prevScreen = 'title';

    this.init();
  }

  init() {
    this.element = document.createElement('div');
    this.element.id = 'menu-root';
    this.container.appendChild(this.element);
    this.render();
  }

  render() {
    const unlockedLevel = storage.getUnlockedLevel();
    const settings = storage.getSettings();

    this.element.innerHTML = `
      <!-- TITLE SCREEN -->
      <div id="screen-title" class="menu-screen ${this.activeScreen === 'title' ? 'active' : ''}">
        <div class="title-hero-card">
          <div class="title-portrait-container">
            ${PORTRAITS.flynn}
          </div>
          <div class="title-text-group">
            <h1 class="game-logo">ESCAPE FROM <span class="logo-accent">PLANET G</span></h1>
            <p class="game-tagline">Captain Flynn’s Subterranean Odyssey</p>
          </div>
        </div>

        <div class="menu-button-group">
          <button id="btn-start" class="btn btn-primary">START GAME</button>
          <button id="btn-level-select" class="btn btn-secondary">LEVEL SELECT (${unlockedLevel}/5)</button>
          <button id="btn-controls" class="btn btn-secondary">FLIGHT CONTROLS</button>
          <button id="btn-settings" class="btn btn-secondary">SETTINGS</button>
        </div>

        <div class="title-footer">
          <span>Keyboard: W/A/S/D or Arrows to Steer · Shift: Boost · Space: Brake · V: Camera</span>
        </div>
      </div>

      <!-- LEVEL SELECT SCREEN -->
      <div id="screen-level-select" class="menu-screen ${this.activeScreen === 'level_select' ? 'active' : ''}">
        <div class="menu-card modal-card">
          <h2 class="modal-title">SELECT MISSION</h2>
          <div class="level-cards-grid">
            ${LEVELS.map(lvl => {
              const isUnlocked = lvl.id <= unlockedLevel;
              return `
                <div class="level-card ${isUnlocked ? 'unlocked' : 'locked'}" data-level="${lvl.id}">
                  <div class="level-card-number">LEVEL ${lvl.id}</div>
                  <div class="level-card-title">${lvl.name}</div>
                  <div class="level-card-sub">${lvl.subtitle}</div>
                  <div class="level-card-status">${isUnlocked ? 'DEPLOY' : 'LOCKED'}</div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="modal-actions">
            <button id="btn-level-back" class="btn btn-secondary">BACK</button>
          </div>
        </div>
      </div>

      <!-- CONTROLS GUIDE MODAL -->
      <div id="screen-controls" class="menu-screen ${this.activeScreen === 'controls' ? 'active' : ''}">
        <div class="menu-card modal-card">
          <h2 class="modal-title">FLIGHT MANUAL & CONTROLS</h2>
          <table class="controls-table">
            <thead>
              <tr><th>KEY</th><th>ACTION</th><th>DESCRIPTION</th></tr>
            </thead>
            <tbody>
              <tr><td><kbd>W</kbd> / <kbd>S</kbd></td><td>Pitch Up / Down</td><td>Control vertical climb and dive</td></tr>
              <tr><td><kbd>A</kbd> / <kbd>D</kbd></td><td>Steer Left / Right</td><td>Bank and steer through caverns</td></tr>
              <tr><td><kbd>Arrow Keys</kbd></td><td>Alternate Steering</td><td>Full directional flight steering</td></tr>
              <tr><td><kbd>Shift</kbd></td><td>Boost</td><td>High-speed rocket burst (drains boost bar)</td></tr>
              <tr><td><kbd>Space</kbd></td><td>Brake / Hover</td><td>Decelerate to cruise speed; hover for extraction</td></tr>
              <tr><td><kbd>V</kbd></td><td>Toggle Camera</td><td>Switch between Cockpit and Chase views</td></tr>
              <tr><td><kbd>Esc</kbd></td><td>Pause / Resume</td><td>Pause flight and open menu</td></tr>
              <tr><td><kbd>M</kbd></td><td>Mute / Unmute</td><td>Toggle all audio synthesis</td></tr>
            </tbody>
          </table>
          <div class="modal-actions">
            <button id="btn-controls-back" class="btn btn-primary">RETURN</button>
          </div>
        </div>
      </div>

      <!-- SETTINGS MODAL -->
      <div id="screen-settings" class="menu-screen ${this.activeScreen === 'settings' ? 'active' : ''}">
        <div class="menu-card modal-card">
          <h2 class="modal-title">SETTINGS & ACCESSIBILITY</h2>
          <div class="settings-grid">
            <div class="setting-item">
              <label for="set-music-vol">Music Volume (${Math.round(settings.musicVolume * 100)}%)</label>
              <input type="range" id="set-music-vol" min="0" max="1" step="0.05" value="${settings.musicVolume}">
            </div>
            <div class="setting-item">
              <label for="set-sfx-vol">SFX Volume (${Math.round(settings.sfxVolume * 100)}%)</label>
              <input type="range" id="set-sfx-vol" min="0" max="1" step="0.05" value="${settings.sfxVolume}">
            </div>
            <div class="setting-item checkbox-item">
              <label for="set-mute">Mute All Audio</label>
              <input type="checkbox" id="set-mute" ${settings.muted ? 'checked' : ''}>
            </div>
            <div class="setting-item checkbox-item">
              <label for="set-reduced-flash">Reduced Flash Mode</label>
              <input type="checkbox" id="set-reduced-flash" ${settings.reducedFlash ? 'checked' : ''}>
            </div>
            <div class="setting-item checkbox-item">
              <label for="set-reduced-shake">Reduced Camera Shake</label>
              <input type="checkbox" id="set-reduced-shake" ${settings.reducedShake ? 'checked' : ''}>
            </div>
            <div class="setting-item checkbox-item">
              <label for="set-skip-crash">Skip Crash Cinematic</label>
              <input type="checkbox" id="set-skip-crash" ${settings.skipCrashCinematic ? 'checked' : ''}>
            </div>
            <div class="setting-item checkbox-item">
              <label for="set-invert-pitch">Invert Pitch Controls</label>
              <input type="checkbox" id="set-invert-pitch" ${settings.invertPitch ? 'checked' : ''}>
            </div>
          </div>
          <div class="modal-actions">
            <button id="btn-reset-progress" class="btn btn-danger">RESET SAVED PROGRESS</button>
            <button id="btn-settings-back" class="btn btn-primary">SAVE & CLOSE</button>
          </div>
        </div>
      </div>

      <!-- PAUSE MENU -->
      <div id="screen-pause" class="menu-screen ${this.activeScreen === 'pause' ? 'active' : ''}">
        <div class="menu-card">
          <h2 class="modal-title">MISSION PAUSED</h2>
          <div class="menu-button-group">
            <button id="btn-resume" class="btn btn-primary">RESUME FLIGHT</button>
            <button id="btn-pause-retry-cp" class="btn btn-secondary">RETRY FROM CHECKPOINT</button>
            <button id="btn-pause-restart" class="btn btn-secondary">RESTART LEVEL</button>
            <button id="btn-pause-settings" class="btn btn-secondary">SETTINGS</button>
            <button id="btn-pause-main-menu" class="btn btn-danger">ABORT TO MAIN MENU</button>
          </div>
        </div>
      </div>

      <!-- SHIP DESTROYED / FAILURE SCREEN -->
      <div id="screen-failed" class="menu-screen ${this.activeScreen === 'failed' ? 'active' : ''}">
        <div class="menu-card failure-card">
          <h2 class="failure-title">SHIP DESTROYED</h2>
          <p class="failure-sub">Captain Flynn's fighter was lost in the descent.</p>
          <div class="menu-button-group">
            <button id="btn-fail-retry-cp" class="btn btn-primary">RETRY FROM CHECKPOINT</button>
            <button id="btn-fail-restart" class="btn btn-secondary">RESTART LEVEL</button>
            <button id="btn-fail-main-menu" class="btn btn-secondary">MAIN MENU</button>
          </div>
        </div>
      </div>

      <!-- VICTORY SCREEN -->
      <div id="screen-victory" class="menu-screen ${this.activeScreen === 'victory' ? 'active' : ''}">
        <div class="menu-card victory-card">
          <div id="victory-header-portrait" class="victory-portrait-wrap">
            ${PORTRAITS.odette}
          </div>
          <h2 id="victory-title" class="victory-title">MISSION ACCOMPLISHED!</h2>
          <p id="victory-sub" class="victory-sub">Princess Odette extracted! The surface breach was successful!</p>
          <div id="victory-stats" class="victory-stats-box"></div>
          <div class="menu-button-group">
            <button id="btn-victory-next" class="btn btn-primary">CONTINUE MISSION</button>
            <button id="btn-victory-menu" class="btn btn-secondary">MAIN MENU</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const el = this.element;

    // Helper: add click with sound
    const onClick = (selector, handler) => {
      const btn = el.querySelector(selector);
      if (btn) {
        btn.addEventListener('click', e => {
          sound.ensureContext();
          sound.playButton();
          handler(e);
        });
      }
    };

    // Title buttons
    onClick('#btn-start', () => {
      this.setScreen('playing');
      if (this.callbacks.onStartGame) this.callbacks.onStartGame(storage.getUnlockedLevel());
    });

    onClick('#btn-level-select', () => this.setScreen('level_select'));
    onClick('#btn-controls', () => this.setScreen('controls'));
    onClick('#btn-settings', () => this.setScreen('settings'));

    // Level select
    el.querySelectorAll('.level-card.unlocked').forEach(card => {
      card.addEventListener('click', () => {
        sound.ensureContext();
        sound.playButton();
        const lvl = Number(card.getAttribute('data-level'));
        this.setScreen('playing');
        if (this.callbacks.onSelectLevel) this.callbacks.onSelectLevel(lvl);
      });
    });

    onClick('#btn-level-back', () => this.setScreen('title'));
    onClick('#btn-controls-back', () => this.setScreen(this.prevScreen === 'pause' ? 'pause' : 'title'));

    // Settings
    const musicSlider = el.querySelector('#set-music-vol');
    if (musicSlider) {
      musicSlider.addEventListener('input', e => {
        const val = parseFloat(e.target.value);
        storage.updateSettings({ musicVolume: val });
        sound.setMusicVolume(val);
      });
    }

    const sfxSlider = el.querySelector('#set-sfx-vol');
    if (sfxSlider) {
      sfxSlider.addEventListener('input', e => {
        const val = parseFloat(e.target.value);
        storage.updateSettings({ sfxVolume: val });
        sound.setSFXVolume(val);
      });
    }

    const muteCheckbox = el.querySelector('#set-mute');
    if (muteCheckbox) {
      muteCheckbox.addEventListener('change', e => {
        const checked = e.target.checked;
        storage.updateSettings({ muted: checked });
        sound.setMuted(checked);
      });
    }

    const flashCheckbox = el.querySelector('#set-reduced-flash');
    if (flashCheckbox) {
      flashCheckbox.addEventListener('change', e => {
        storage.updateSettings({ reducedFlash: e.target.checked });
      });
    }

    const shakeCheckbox = el.querySelector('#set-reduced-shake');
    if (shakeCheckbox) {
      shakeCheckbox.addEventListener('change', e => {
        storage.updateSettings({ reducedShake: e.target.checked });
      });
    }

    const skipCrashCheckbox = el.querySelector('#set-skip-crash');
    if (skipCrashCheckbox) {
      skipCrashCheckbox.addEventListener('change', e => {
        storage.updateSettings({ skipCrashCinematic: e.target.checked });
      });
    }

    const invertPitchCheckbox = el.querySelector('#set-invert-pitch');
    if (invertPitchCheckbox) {
      invertPitchCheckbox.addEventListener('change', e => {
        const checked = e.target.checked;
        storage.updateSettings({ invertPitch: checked });
        if (this.callbacks.onSettingsChange) this.callbacks.onSettingsChange();
      });
    }

    onClick('#btn-reset-progress', () => {
      if (confirm('Are you sure you want to reset all unlocked levels and progress?')) {
        storage.resetProgress();
        this.render();
      }
    });

    onClick('#btn-settings-back', () => {
      this.setScreen(this.prevScreen === 'pause' ? 'pause' : 'title');
    });

    // Pause buttons
    onClick('#btn-resume', () => {
      this.setScreen('playing');
      if (this.callbacks.onResume) this.callbacks.onResume();
    });

    onClick('#btn-pause-retry-cp', () => {
      this.setScreen('playing');
      if (this.callbacks.onRetryCheckpoint) this.callbacks.onRetryCheckpoint();
    });

    onClick('#btn-pause-restart', () => {
      this.setScreen('playing');
      if (this.callbacks.onRestartLevel) this.callbacks.onRestartLevel();
    });

    onClick('#btn-pause-settings', () => this.setScreen('settings'));

    onClick('#btn-pause-main-menu', () => {
      this.setScreen('title');
      if (this.callbacks.onMainMenu) this.callbacks.onMainMenu();
    });

    // Failure buttons
    onClick('#btn-fail-retry-cp', () => {
      this.setScreen('playing');
      if (this.callbacks.onRetryCheckpoint) this.callbacks.onRetryCheckpoint();
    });

    onClick('#btn-fail-restart', () => {
      this.setScreen('playing');
      if (this.callbacks.onRestartLevel) this.callbacks.onRestartLevel();
    });

    onClick('#btn-fail-main-menu', () => {
      this.setScreen('title');
      if (this.callbacks.onMainMenu) this.callbacks.onMainMenu();
    });

    // Victory buttons
    onClick('#btn-victory-next', () => {
      if (this.callbacks.onNextLevel) this.callbacks.onNextLevel();
    });

    onClick('#btn-victory-menu', () => {
      this.setScreen('title');
      if (this.callbacks.onMainMenu) this.callbacks.onMainMenu();
    });
  }

  setScreen(screenName) {
    this.prevScreen = this.activeScreen;
    this.activeScreen = screenName;
    const screens = this.element.querySelectorAll('.menu-screen');
    screens.forEach(s => s.classList.remove('active'));

    const normalized = screenName.replace(/_/g, '-');
    const target = this.element.querySelector(`#screen-${normalized}`);
    if (target) {
      target.classList.add('active');
    }
  }

  showVictory(info) {
    const isCampaign = info.isCampaignComplete;
    const title = this.element.querySelector('#victory-title');
    const sub = this.element.querySelector('#victory-sub');
    const statsBox = this.element.querySelector('#victory-stats');
    const nextBtn = this.element.querySelector('#btn-victory-next');
    const portraitWrap = this.element.querySelector('#victory-header-portrait');

    if (portraitWrap) {
      portraitWrap.innerHTML = isCampaign ? PORTRAITS.odette : PORTRAITS.flynn;
    }

    if (title) {
      title.innerText = isCampaign ? 'CAMPAIGN COMPLETE! PLANET G ESCAPED!' : `LEVEL ${info.levelId} CLEARED!`;
    }

    if (sub) {
      sub.innerText = isCampaign
        ? 'Princess Odette and Captain Flynn have breached the surface and reunited with the Resistance!'
        : 'Descent route secured! Systems ready for the next subterranean sector.';
    }

    if (statsBox) {
      statsBox.innerHTML = `
        <div class="stat-row"><span>Hull Remaining:</span> <strong>${Math.round(info.hullRemaining)}%</strong></div>
        <div class="stat-row"><span>Status:</span> <strong>${isCampaign ? 'Resistance Victorious' : 'Sector Clear'}</strong></div>
      `;
    }

    if (nextBtn) {
      nextBtn.innerText = isCampaign ? 'REPLAY CAMPAIGN' : 'PROCEED TO NEXT LEVEL';
    }

    this.setScreen('victory');
  }
}
