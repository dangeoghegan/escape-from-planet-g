import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LevelManager, GAME_STATES } from '../logic/LevelManager.js';

describe('Hull Failure & Crash Trigger', () => {
  let levelManager;
  let failureCallback;

  beforeEach(() => {
    failureCallback = vi.fn();
    levelManager = new LevelManager({
      onFailure: failureCallback,
    });
  });

  it('triggers failure sequence exactly once when hull reaches zero', () => {
    expect(levelManager.state).toBe(GAME_STATES.PLAYING);

    // Deal lethal damage
    levelManager.ship.hull = 10;
    levelManager.ship.damageCooldownTimer = 0;
    const res = levelManager.ship.takeDamage(20, 'rock');

    expect(res.died).toBe(true);
    expect(levelManager.ship.isAlive).toBe(false);

    // Update levelManager to process death
    levelManager.update(0.01, {});

    expect(levelManager.state).toBe(GAME_STATES.CRASH_CINEMATIC);

    // Try dealing more damage or triggering failure repeatedly
    levelManager.triggerFailure();
    levelManager.triggerFailure();

    // Advance through the crash cinematic timer (3.0s)
    levelManager.update(3.1, {});

    expect(levelManager.state).toBe(GAME_STATES.FAILED);
    expect(failureCallback).toHaveBeenCalledTimes(1);

    // Further updates do not re-trigger failure callback
    levelManager.update(1.0, {});
    expect(failureCallback).toHaveBeenCalledTimes(1);
  });

  it('disables ship controls upon death', () => {
    levelManager.ship.takeDamage(100, 'fatal');
    expect(levelManager.ship.isAlive).toBe(false);

    const initialX = levelManager.ship.x;
    // Attempt to steer right while dead
    levelManager.update(0.5, { steerRight: true });

    // vx should not accelerate laterally
    expect(levelManager.ship.vx).toBe(0);
    expect(levelManager.ship.x).toBe(initialX);
  });
});
