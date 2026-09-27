import { describe, it, expect, beforeEach } from 'vitest';
import { LevelManager, GAME_STATES } from '../logic/LevelManager.js';

describe('Camera Switching Invariance', () => {
  let lm;

  beforeEach(() => {
    lm = new LevelManager();
    lm.loadLevel(2);
  });

  it('toggles camera mode between chase and cockpit instantly', () => {
    expect(lm.ship.cameraMode).toBe('chase');
    lm.ship.toggleCamera();
    expect(lm.ship.cameraMode).toBe('cockpit');
    lm.ship.toggleCamera();
    expect(lm.ship.cameraMode).toBe('chase');
  });

  it('guarantees camera switching does not alter position, velocity, hull, or level state', () => {
    lm.ship.s = 345.6;
    lm.ship.x = -4.2;
    lm.ship.y = 3.1;
    lm.ship.speed = 41.5;
    lm.ship.vx = 2.0;
    lm.ship.vy = -1.5;
    lm.ship.hull = 75;
    lm.ship.boostCharge = 82;
    const initialGameState = lm.state;
    const initialCheckpoint = lm.lastCheckpoint;

    // Toggle camera multiple times
    lm.ship.toggleCamera(); // to cockpit
    lm.ship.toggleCamera(); // to chase
    lm.ship.toggleCamera(); // to cockpit

    // Verify all gameplay variables remain completely unchanged
    expect(lm.ship.s).toBe(345.6);
    expect(lm.ship.x).toBe(-4.2);
    expect(lm.ship.y).toBe(3.1);
    expect(lm.ship.speed).toBe(41.5);
    expect(lm.ship.vx).toBe(2.0);
    expect(lm.ship.vy).toBe(-1.5);
    expect(lm.ship.hull).toBe(75);
    expect(lm.ship.boostCharge).toBe(82);
    expect(lm.state).toBe(initialGameState);
    expect(lm.lastCheckpoint).toBe(initialCheckpoint);
  });
});
