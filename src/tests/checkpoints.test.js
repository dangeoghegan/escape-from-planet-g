import { describe, it, expect, beforeEach } from 'vitest';
import { LevelManager, GAME_STATES } from '../logic/LevelManager.js';

describe('Checkpoint Tracking and State Restoration', () => {
  let lm;

  beforeEach(() => {
    lm = new LevelManager();
    lm.loadLevel(1);
  });

  it('starts at spawn checkpoint', () => {
    expect(lm.lastCheckpoint).toBeDefined();
    expect(lm.lastCheckpoint.s).toBe(0);
  });

  it('records new checkpoints when ship passes them', () => {
    // Level 1 has a checkpoint around s ~ 750
    expect(lm.route.checkpoints.length).toBeGreaterThan(0);
    const cp = lm.route.checkpoints[0];

    // Fly ship past the checkpoint
    lm.ship.s = cp.s + 10;
    lm.update(0.01, {});

    expect(lm.lastCheckpoint.id).toBe(cp.id);
  });

  it('restores ship to checkpoint with consistent defined hull state upon retry', () => {
    const cp = lm.route.checkpoints[0];
    lm.ship.s = cp.s + 50;
    lm.ship.x = 8.5; // pushed to side
    lm.ship.y = -4.2;
    lm.ship.hull = 15; // heavily damaged
    lm.update(0.01, {});

    // Trigger failure
    lm.ship.takeDamage(50, 'fatal');
    lm.update(0.01, {});
    lm.update(3.5, {});
    expect(lm.state).toBe(GAME_STATES.FAILED);

    // Now retry from checkpoint
    lm.retryFromCheckpoint();

    expect(lm.state).toBe(GAME_STATES.PLAYING);
    expect(lm.ship.s).toBe(cp.s);
    expect(lm.ship.x).toBe(0); // Centered
    expect(lm.ship.y).toBe(0);
    expect(lm.ship.hull).toBe(100); // Defined, consistent restored hull state
    expect(lm.ship.isAlive).toBe(true);
    expect(lm.ship.speed).toBe(lm.ship.cruiseSpeed);
  });
});
