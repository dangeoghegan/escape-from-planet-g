import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LevelManager, GAME_STATES } from '../logic/LevelManager.js';

describe('Victory Conditions & Extraction Requirement', () => {
  let lm;
  let victoryCb;

  beforeEach(() => {
    victoryCb = vi.fn();
    lm = new LevelManager({
      onVictory: victoryCb,
    });
  });

  it('allows victory upon reaching exit for standard levels (Level 1-4)', () => {
    lm.loadLevel(1);
    lm.ship.s = lm.route.exitDistance + 5;
    lm.update(0.1, {});

    expect(lm.state).toBe(GAME_STATES.VICTORY);
    expect(victoryCb).toHaveBeenCalled();
  });

  it('prevents victory in Level 5 if exit is reached BEFORE extraction', () => {
    lm.loadLevel(5);
    expect(lm.isExtracted).toBe(false);

    // Ship somehow glitches to exit without picking up Odette
    lm.ship.s = lm.route.exitDistance + 10;
    lm.update(0.1, {});

    expect(lm.state).not.toBe(GAME_STATES.VICTORY);
    expect(victoryCb).not.toHaveBeenCalled();
  });

  it('grants victory in Level 5 when exit is reached AFTER extraction', () => {
    lm.loadLevel(5);
    lm.isExtracted = true; // Odette extracted!

    lm.ship.s = lm.route.exitDistance + 10;
    lm.ship.hull = 60;
    lm.update(0.1, {});

    expect(lm.state).toBe(GAME_STATES.VICTORY);
    expect(victoryCb).toHaveBeenCalledTimes(1);
    expect(victoryCb).toHaveBeenCalledWith(expect.objectContaining({
      levelId: 5,
      isCampaignComplete: true,
    }));
  });

  it('does NOT grant victory if hull integrity is zero', () => {
    lm.loadLevel(1);
    lm.ship.s = lm.route.exitDistance + 5;
    lm.ship.hull = 0;
    lm.ship.isAlive = false;

    lm.update(0.1, {});

    expect(lm.state).not.toBe(GAME_STATES.VICTORY);
    expect(victoryCb).not.toHaveBeenCalled();
  });
});
