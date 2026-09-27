/**
 * main.js - Entry point for Escape from Planet G.
 * Ties together logic, rendering, audio, UI, and input systems.
 */
import { LevelManager, GAME_STATES } from './logic/LevelManager.js';
import { SceneManager } from './render/SceneManager.js';
import { HUD } from './ui/HUD.js';
import { MenuManager } from './ui/MenuManager.js';
import { sound } from './audio/SoundSynth.js';
import { MusicSynth } from './audio/MusicSynth.js';
import { storage } from './logic/Storage.js';

class GameApp {
  constructor() {
    this.canvasContainer = document.getElementById('canvas-container');
    this.music = new MusicSynth(sound);

    // Input state
    this.input = {
      steerLeft: false,
      steerRight: false,
      pitchUp: false,
      pitchDown: false,
      boost: false,
      brake: false,
      fire: false,
    };

    // Game systems
    this.levelManager = new LevelManager({
      onStateChange: (newState, oldState) => this.handleStateChange(newState, oldState),
      onDamage: (amount, type) => this.handleDamage(amount, type),
      onCheckpoint: (cp) => this.handleCheckpoint(cp),
      onExtractionStart: () => this.handleExtractionStart(),
      onExtractionComplete: () => this.handleExtractionComplete(),
      onVictory: (info) => this.handleVictory(info),
      onFailure: () => this.handleFailure(),
      onTargetDestroyed: (d) => this.handleTargetDestroyed(d),
    });

    this.sceneManager = new SceneManager(this.canvasContainer);
    this.hud = new HUD(document.body);

    this.menuManager = new MenuManager(document.body, {
      onStartGame: (lvl) => this.startGame(lvl),
      onSelectLevel: (lvl) => this.startGame(lvl),
      onResume: () => this.resumeGame(),
      onRestartLevel: () => this.restartLevel(),
      onRetryCheckpoint: () => this.retryCheckpoint(),
      onNextLevel: () => this.nextLevel(),
      onMainMenu: () => this.returnToTitle(),
      onSettingsChange: () => this.applySettings(),
    });

    this.lastTime = performance.now();
    this.isAudioStarted = false;

    this.init();
  }

  init() {
    this.applySettings();
    this.setupInputListeners();
    this.setupHUDListeners();

    // Start in Title screen
    this.levelManager.setState(GAME_STATES.TITLE);
    this.hud.hide();
    this.menuManager.setScreen('title');

    // Load initial level into scene for title backdrop
    this.sceneManager.loadLevel(
      this.levelManager.levelConfig,
      this.levelManager.route,
      this.levelManager.hazards
    );

    // Start loop
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  applySettings() {
    const s = storage.getSettings();
    sound.setMusicVolume(s.musicVolume);
    sound.setSFXVolume(s.sfxVolume);
    sound.setMuted(s.muted);
    this.levelManager.ship.invertPitch = s.invertPitch;
  }

  setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.ensureAudio();

      if (e.code === 'KeyM') {
        const nextMute = !storage.getSettings().muted;
        storage.updateSettings({ muted: nextMute });
        sound.setMuted(nextMute);
        this.menuManager.render();
        return;
      }

      if (e.code === 'Escape') {
        if (this.levelManager.state === GAME_STATES.PLAYING) {
          this.pauseGame();
        } else if (this.levelManager.state === GAME_STATES.PAUSED) {
          this.resumeGame();
        }
        return;
      }

      if (e.code === 'KeyV') {
        if (this.levelManager.state === GAME_STATES.PLAYING || this.levelManager.state === GAME_STATES.EXTRACTING) {
          const mode = this.levelManager.ship.toggleCamera();
          sound.playButton();
          return;
        }
      }

      // Flight Controls
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.steerLeft = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.steerRight = true;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.input.pitchUp = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.pitchDown = true;

      // Combat Firing
      if (e.code === 'KeyF' || e.code === 'KeyJ' || e.code === 'Enter') {
        this.input.fire = true;
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (!this.input.boost && this.levelManager.ship.boostCharge > 15) {
          sound.playBoost();
        }
        this.input.boost = true;
      }

      if (e.code === 'Space') {
        if (!this.input.brake) {
          sound.playBrake();
        }
        this.input.brake = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.steerLeft = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.steerRight = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.input.pitchUp = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.pitchDown = false;
      if (e.code === 'KeyF' || e.code === 'KeyJ' || e.code === 'Enter') this.input.fire = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.input.boost = false;
      if (e.code === 'Space') this.input.brake = false;
    });

    // Pointer click to fire in-flight
    this.canvasContainer.addEventListener('pointerdown', (e) => {
      this.ensureAudio();
      if (this.levelManager.state === GAME_STATES.PLAYING) {
        this.input.fire = true;
        setTimeout(() => { this.input.fire = false; }, 80);
      }
    });

    // Touch / pointer audio gesture trigger
    window.addEventListener('pointerdown', () => this.ensureAudio(), { once: true });
  }

  setupHUDListeners() {
    const muteBtn = document.getElementById('hud-btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        this.ensureAudio();
        const nextMute = !storage.getSettings().muted;
        storage.updateSettings({ muted: nextMute });
        sound.setMuted(nextMute);
        muteBtn.innerText = nextMute ? '🔇' : '🔊';
      });
    }

    const pauseBtn = document.getElementById('hud-btn-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.ensureAudio();
        this.pauseGame();
      });
    }

    const camBadge = document.getElementById('hud-camera-badge');
    if (camBadge) {
      camBadge.addEventListener('click', () => {
        this.ensureAudio();
        this.levelManager.ship.toggleCamera();
        sound.playButton();
      });
    }
  }

  ensureAudio() {
    if (!this.isAudioStarted) {
      sound.ensureContext();
      this.isAudioStarted = true;
    }
  }

  startGame(levelId) {
    this.ensureAudio();
    this.levelManager.loadLevel(levelId);
    this.sceneManager.loadLevel(
      this.levelManager.levelConfig,
      this.levelManager.route,
      this.levelManager.hazards
    );
    this.hud.show();
    this.menuManager.setScreen('playing');

    sound.startEngine();
    this.music.playTheme(this.levelManager.levelConfig.musicTheme);

    // Initial comms greeting
    if (levelId === 1) {
      this.hud.showComms('flynn', 'Captain Flynn checking in. Entering the surface canyon!');
    } else if (levelId === 5) {
      this.hud.showComms('flynn', 'Entering the Core Citadel! Princess Odette is held ahead!');
    }
  }

  pauseGame() {
    if (this.levelManager.state === GAME_STATES.PLAYING || this.levelManager.state === GAME_STATES.EXTRACTING) {
      this.levelManager.setState(GAME_STATES.PAUSED);
      this.menuManager.setScreen('pause');
      this.hud.hide();
      sound.stopEngine();
    }
  }

  resumeGame() {
    if (this.levelManager.state === GAME_STATES.PAUSED) {
      this.levelManager.setState(GAME_STATES.PLAYING);
      this.menuManager.setScreen('playing');
      this.hud.show();
      sound.startEngine();
    }
  }

  restartLevel() {
    this.startGame(this.levelManager.currentLevelId);
  }

  retryCheckpoint() {
    this.ensureAudio();
    this.levelManager.retryFromCheckpoint();
    this.sceneManager.effects.clear();
    this.hud.show();
    this.menuManager.setScreen('playing');
    sound.startEngine();
    this.music.playTheme(
      (this.levelManager.currentLevelId === 5 && this.levelManager.isExtracted)
        ? this.levelManager.levelConfig.escapeMusicTheme
        : this.levelManager.levelConfig.musicTheme
    );
  }

  nextLevel() {
    if (this.levelManager.currentLevelId < 5) {
      this.startGame(this.levelManager.currentLevelId + 1);
    } else {
      // Replay or return to title
      this.returnToTitle();
    }
  }

  returnToTitle() {
    sound.stopEngine();
    this.music.playTheme('broken_sky');
    this.levelManager.loadLevel(1);
    this.sceneManager.loadLevel(
      this.levelManager.levelConfig,
      this.levelManager.route,
      this.levelManager.hazards
    );
    this.levelManager.setState(GAME_STATES.TITLE);
    this.hud.hide();
    this.menuManager.render();
    this.menuManager.setScreen('title');
  }

  handleStateChange(newState, oldState) {
    if (newState === GAME_STATES.CRASH_CINEMATIC) {
      sound.stopEngine();
      sound.playExplosion();
      this.sceneManager.effects.triggerCrashExplosion(this.levelManager.ship.worldPosition);
      this.hud.triggerDamageFlash();
    }
  }

  handleDamage(amount, type) {
    sound.playHit();
    this.sceneManager.effects.triggerDamageFlash(amount);
    this.hud.triggerDamageFlash();
  }

  handleCheckpoint(cp) {
    sound.playCheckpoint();
    this.hud.showComms('flynn', `Checkpoint confirmed: ${cp.name}!`, 3.0);
  }

  handleExtractionStart() {
    sound.playExtractionBeam();
    this.hud.showComms('flynn', 'Docking tractor beam locked! Holding hover...', 3.5);
  }

  handleExtractionComplete() {
    sound.playExtractionComplete();
    this.music.playTheme(this.levelManager.levelConfig.escapeMusicTheme || 'escape_run');
    this.hud.showComms(
      'odette',
      'Flynn! You made it! The core is collapsing — punch the thrusters and ESCAPE!',
      6.0
    );
  }

  handleVictory(info) {
    sound.stopEngine();
    sound.playVictory();
    this.hud.hide();
    this.menuManager.showVictory(info);
  }

  handleFailure() {
    sound.stopEngine();
    this.hud.hide();
    this.menuManager.setScreen('failed');
  }

  handleTargetDestroyed(d) {
    sound.playTargetHit();
    const frame = this.levelManager.route.getFrameAt(d.s);
    const targetPos = frame.pos.clone()
      .addScaledVector(frame.right, d.x)
      .addScaledVector(frame.up, d.y);
    this.sceneManager.effects.triggerCrashExplosion(targetPos);
    this.hud.showScorePopup(d.score, d.type);
  }

  gameLoop(currentTime) {
    requestAnimationFrame((t) => this.gameLoop(t));

    const dt = Math.min(0.05, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // In title screen, gently rotate or float ship
    if (this.levelManager.state === GAME_STATES.TITLE) {
      this.levelManager.ship.s = (this.levelManager.ship.s + 15 * dt) % 400;
      this.levelManager.ship.updateWorldTransform(this.levelManager.route);
      this.sceneManager.update(this.levelManager, dt);
      return;
    }

    // Active gameplay update
    if (this.input.fire && this.levelManager.ship.isAlive && this.levelManager.ship.fireCooldownTimer <= 0) {
      sound.playLaser();
      this.sceneManager.shipModel.triggerMuzzleFlash();
    }

    this.levelManager.update(dt, this.input);

    // Audio engine pitch modulation
    if (this.levelManager.state === GAME_STATES.PLAYING || this.levelManager.state === GAME_STATES.EXTRACTING) {
      const speedRatio = Math.max(0, Math.min(1,
        (this.levelManager.ship.speed - this.levelManager.ship.minSpeed) /
        (this.levelManager.ship.boostSpeed - this.levelManager.ship.minSpeed)
      ));
      sound.updateEngine(speedRatio, this.levelManager.ship.isBoosting, this.levelManager.ship.isBraking);
    }

    // Update 3D Scene and HUD
    this.sceneManager.update(this.levelManager, dt);
    this.hud.update(this.levelManager);
  }
}

// Start app on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
