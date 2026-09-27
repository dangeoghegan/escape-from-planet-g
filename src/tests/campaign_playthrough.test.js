import { describe, it, expect } from 'vitest';
import { LevelManager, GAME_STATES } from '../logic/LevelManager.js';
import { LEVELS } from '../levels/index.js';

describe('Full 5-Level Campaign Playthrough Simulation', () => {
  let lm;

  beforeEach(() => {
    lm = new LevelManager();
  });

  it('plays through all 5 levels sequentially to campaign completion', () => {
    for (let levelNum = 1; levelNum <= 5; levelNum++) {
      lm.loadLevel(levelNum);
      expect(lm.currentLevelId).toBe(levelNum);
      expect(lm.state).toBe(GAME_STATES.PLAYING);
      expect(lm.ship.hull).toBe(100);

      // Verify camera switching works during flight without perturbing position
      lm.ship.toggleCamera(); // to cockpit
      expect(lm.ship.cameraMode).toBe('cockpit');

      // Simulate flight in steps
      let stepCount = 0;
      const maxSteps = 2000;

      while (lm.state !== GAME_STATES.VICTORY && stepCount < maxSteps) {
        stepCount++;

        // In Level 5, if approaching extraction dais, hover and brake to rescue Odette
        if (levelNum === 5 && !lm.isExtracted) {
          const extS = lm.levelConfig.extractionS;
          if (Math.abs(lm.ship.s - extS) <= 22) {
            lm.update(0.1, { brake: true });
            continue;
          }
        }

        // Standard forward flight with combat firing enabled
        lm.update(0.1, { fire: true });

        // Mid-level camera switch check
        if (stepCount === 50) {
          lm.ship.toggleCamera(); // switch back to chase
          expect(lm.ship.cameraMode).toBe('chase');
        }
      }

      // Verify level completion
      expect(lm.state).toBe(GAME_STATES.VICTORY);
      expect(lm.ship.hull).toBeGreaterThan(0);

      if (levelNum === 5) {
        expect(lm.isExtracted).toBe(true);
      }
    }
  });

  it('verifies checkpoint retry during difficult sections', () => {
    lm.loadLevel(3);
    const cp = lm.route.checkpoints[0];

    // Fly past checkpoint
    lm.ship.s = cp.s + 30;
    lm.update(0.05, {});
    expect(lm.lastCheckpoint.id).toBe(cp.id);

    // Ship takes severe damage
    lm.ship.takeDamage(100, 'stalactite');
    expect(lm.ship.isAlive).toBe(false);
    lm.update(0.01, {}); // Trigger crash cinematic
    lm.update(3.2, {});  // Complete crash cinematic -> FAILED
    expect(lm.state).toBe(GAME_STATES.FAILED);

    // Retry from checkpoint
    lm.retryFromCheckpoint();
    expect(lm.state).toBe(GAME_STATES.PLAYING);
    expect(lm.ship.s).toBe(cp.s);
    expect(lm.ship.hull).toBe(100);
    expect(lm.ship.isAlive).toBe(true);
  });
});
