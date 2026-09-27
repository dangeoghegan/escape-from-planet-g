/**
 * LevelManager.js - Coordinates levels, checkpoints, extraction, and win/loss states.
 */
import { Route } from './Route.js';
import { HazardManager } from './Hazards.js';
import { Ship } from './Ship.js';
import { storage } from './Storage.js';
import { getLevelById, LEVELS } from '../levels/index.js';

export const GAME_STATES = {
  TITLE: 'TITLE',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  CRASH_CINEMATIC: 'CRASH_CINEMATIC',
  FAILED: 'FAILED',
  EXTRACTING: 'EXTRACTING',
  VICTORY: 'VICTORY',
};

export class LevelManager {
  constructor(options = {}) {
    this.currentLevelId = 1;
    this.levelConfig = null;
    this.route = null;
    this.hazards = null;
    this.ship = new Ship();
    this.state = GAME_STATES.TITLE;

    // Checkpoints
    this.lastCheckpoint = null;
    this.passedCheckpoints = new Set();

    // Level 5 Extraction
    this.isExtracted = false;
    this.extractionProgress = 0;
    this.extractionDuration = 2.5; // Seconds required to hover and extract
    this.extractionInRange = false;

    // Crash cinematic
    this.crashTimer = 0;
    this.crashDuration = 3.0;

    // Callbacks
    this.onStateChange = options.onStateChange || null;
    this.onDamage = options.onDamage || null;
    this.onCheckpoint = options.onCheckpoint || null;
    this.onExtractionStart = options.onExtractionStart || null;
    this.onExtractionComplete = options.onExtractionComplete || null;
    this.onVictory = options.onVictory || null;
    this.onFailure = options.onFailure || null;
    this.onTargetDestroyed = options.onTargetDestroyed || null;

    this.loadLevel(1);
  }

  loadLevel(levelId) {
    this.currentLevelId = Math.max(1, Math.min(5, levelId));
    this.levelConfig = getLevelById(this.currentLevelId);
    this.route = new Route(this.levelConfig.segments);
    this.hazards = new HazardManager(this.levelConfig.hazards || []);

    this.ship.reset(0, 0, 0, 100);
    this.lastCheckpoint = { id: 'spawn', s: 0, name: 'Spawn' };
    this.passedCheckpoints = new Set(['spawn']);

    this.isExtracted = false;
    this.extractionProgress = 0;
    this.extractionInRange = false;
    this.crashTimer = 0;

    this.setState(GAME_STATES.PLAYING);
  }

  setState(newState) {
    if (this.state === newState) return;
    const oldState = this.state;
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(newState, oldState);
    }
  }

  getCurrentObjective() {
    if (this.currentLevelId === 5) {
      return this.isExtracted
        ? this.levelConfig.escapeObjective
        : this.levelConfig.objective;
    }
    return this.levelConfig.objective;
  }

  retryFromCheckpoint() {
    const cpS = this.lastCheckpoint ? this.lastCheckpoint.s : 0;
    // Defined safe hull on checkpoint retry (full 100% or at least 75)
    this.ship.reset(cpS, 0, 0, 100);
    if (this.hazards) {
      this.hazards.resetToCheckpoint(cpS);
    }
    // If died after extraction in level 5 and checkpoint is post-extraction, preserve extraction
    if (this.currentLevelId === 5 && cpS >= (this.levelConfig.extractionS || 820)) {
      this.isExtracted = true;
    }
    this.crashTimer = 0;
    this.setState(GAME_STATES.PLAYING);
  }

  restartLevel() {
    this.loadLevel(this.currentLevelId);
  }

  nextLevel() {
    if (this.currentLevelId < 5) {
      this.loadLevel(this.currentLevelId + 1);
      return true;
    }
    return false;
  }

  update(dt, input = {}) {
    if (this.state === GAME_STATES.PAUSED || this.state === GAME_STATES.TITLE || this.state === GAME_STATES.FAILED || this.state === GAME_STATES.VICTORY) {
      return;
    }

    // Handle Crash Cinematic
    if (this.state === GAME_STATES.CRASH_CINEMATIC) {
      this.crashTimer += dt;
      this.ship.update(dt, {}, this.route);

      const skip = storage.getSettings().skipCrashCinematic;
      if (this.crashTimer >= this.crashDuration || skip) {
        this.setState(GAME_STATES.FAILED);
        if (this.onFailure) this.onFailure();
      }
      return;
    }

    if (this.state !== GAME_STATES.PLAYING && this.state !== GAME_STATES.EXTRACTING) {
      return;
    }

    // Update ship physics and wall collisions
    const prevHull = this.ship.hull;
    this.ship.update(dt, input, this.route);

    // Wall collision damage detection
    if (this.ship.hull < prevHull) {
      if (this.onDamage) this.onDamage(prevHull - this.ship.hull, 'wall');
    }

    // Check Death
    if (!this.ship.isAlive) {
      this.triggerFailure();
      return;
    }

    // Update hazards & collisions
    const hits = this.hazards.update(dt, this.ship, this.route);
    for (const hit of hits) {
      const dmgRes = this.ship.takeDamage(hit.damage, hit.type);
      if (dmgRes.damaged && this.onDamage) {
        this.onDamage(hit.damage, hit.type, hit);
      }
      if (dmgRes.died) {
        this.triggerFailure();
        return;
      }
    }

    // Process weapon projectile collisions with destructible targets
    const destroyedTargets = this.hazards.checkProjectileHits(this.ship.projectiles);
    for (const d of destroyedTargets) {
      this.ship.score = (this.ship.score || 0) + d.score;
      if (this.onTargetDestroyed) {
        this.onTargetDestroyed(d);
      }
    }

    // Check checkpoints along route
    for (const cp of this.route.checkpoints) {
      if (this.ship.s >= cp.s && !this.passedCheckpoints.has(cp.id)) {
        this.passedCheckpoints.add(cp.id);
        this.lastCheckpoint = cp;
        if (this.onCheckpoint) {
          this.onCheckpoint(cp);
        }
      }
    }

    // Level 5 Extraction mechanics
    if (this.currentLevelId === 5 && !this.isExtracted) {
      this.updateExtraction(dt, input);
    }

    // Check Victory / Exit Reach
    if (this.ship.s >= this.route.exitDistance) {
      this.checkExit();
    }
  }

  updateExtraction(dt, input = {}) {
    const extS = this.levelConfig.extractionS || 820;
    const extRadius = this.levelConfig.extractionRadius || 9.0;
    const distS = Math.abs(this.ship.s - extS);
    const dist2D = Math.sqrt(this.ship.x * this.ship.x + this.ship.y * this.ship.y);

    // Ship must be inside extraction zone and moving slow/braking
    const inPosition = distS <= 25 && dist2D <= extRadius;
    const isSlow = this.ship.speed <= 26 || input.brake;

    if (inPosition && isSlow) {
      this.extractionInRange = true;
      if (this.extractionProgress === 0 && this.onExtractionStart) {
        this.onExtractionStart();
      }
      this.setState(GAME_STATES.EXTRACTING);
      this.extractionProgress = Math.min(this.extractionDuration, this.extractionProgress + dt);

      // Tractor beam / hover stabilizer reduces forward drift while hovering
      this.ship.speed = Math.max(0, this.ship.speed - 35 * dt);

      if (this.extractionProgress >= this.extractionDuration) {
        this.isExtracted = true;
        this.setState(GAME_STATES.PLAYING);
        // Register post-extraction checkpoint so retry starts past the extraction dais
        this.lastCheckpoint = { id: 'l5_cp_escape', s: extS + 30, name: 'Core Escape' };
        if (this.onExtractionComplete) {
          this.onExtractionComplete();
        }
      }
    } else {
      this.extractionInRange = false;
      if (this.state === GAME_STATES.EXTRACTING) {
        this.setState(GAME_STATES.PLAYING);
      }
      // Decay extraction progress slowly if leaving zone
      this.extractionProgress = Math.max(0, this.extractionProgress - dt * 0.8);
    }
  }

  checkExit() {
    // For Level 5: Victory is IMPOSSIBLE before extraction!
    if (this.currentLevelId === 5 && !this.isExtracted) {
      return; // Cannot win Level 5 without extracting Princess Odette
    }

    if (this.ship.isAlive && this.state !== GAME_STATES.VICTORY) {
      this.setState(GAME_STATES.VICTORY);
      // Unlock next level in storage
      if (this.currentLevelId < 5) {
        storage.unlockLevel(this.currentLevelId + 1);
      } else {
        // Completed campaign!
        storage.unlockLevel(5);
      }
      if (this.onVictory) {
        this.onVictory({
          levelId: this.currentLevelId,
          hullRemaining: this.ship.hull,
          score: this.ship.score || 0,
          isCampaignComplete: this.currentLevelId === 5,
        });
      }
    }
  }

  triggerFailure() {
    if (this.state === GAME_STATES.CRASH_CINEMATIC || this.state === GAME_STATES.FAILED) return;
    this.crashTimer = 0;
    const skip = storage.getSettings().skipCrashCinematic;
    if (skip) {
      this.setState(GAME_STATES.FAILED);
      if (this.onFailure) this.onFailure();
    } else {
      this.setState(GAME_STATES.CRASH_CINEMATIC);
    }
  }
}
