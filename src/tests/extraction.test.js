import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LevelManager, GAME_STATES } from '../logic/LevelManager.js';

describe('Level 5 Princess Odette Extraction', () => {
  let lm;
  let extractionCompleteCb;

  beforeEach(() => {
    extractionCompleteCb = vi.fn();
    lm = new LevelManager({
      onExtractionComplete: extractionCompleteCb,
    });
    lm.loadLevel(5);
  });

  it('starts Level 5 with extraction incomplete and initial objective', () => {
    expect(lm.isExtracted).toBe(false);
    expect(lm.getCurrentObjective()).toContain('Extract Princess Odette');
  });

  it('does NOT trigger extraction when far from the chamber', () => {
    // Ship is far away at s = 100
    lm.ship.s = 100;
    lm.update(1.0, {});
    expect(lm.isExtracted).toBe(false);
    expect(lm.extractionProgress).toBe(0);
    expect(extractionCompleteCb).not.toHaveBeenCalled();
  });

  it('does NOT trigger extraction if moving too fast through the chamber', () => {
    const extS = lm.levelConfig.extractionS;
    lm.ship.s = extS;
    lm.ship.speed = 60; // Boosting past!
    lm.update(0.5, {});
    expect(lm.isExtracted).toBe(false);
    expect(extractionCompleteCb).not.toHaveBeenCalled();
  });

  it('accumulates extraction and changes objective to escape upon completion', () => {
    const extS = lm.levelConfig.extractionS;
    lm.ship.s = extS;
    lm.ship.x = 0;
    lm.ship.y = 0;
    lm.ship.speed = 10; // Slow hover

    // Hover for the extraction duration (2.5s) holding brake
    for (let i = 0; i < 10; i++) {
      lm.update(0.1, { brake: true });
    }
    expect(lm.state).toBe(GAME_STATES.EXTRACTING);
    expect(lm.isExtracted).toBe(false);

    // Complete the remaining 1.6 seconds of hovering
    for (let i = 0; i < 18; i++) {
      lm.update(0.1, { brake: true });
    }
    expect(lm.isExtracted).toBe(true);
    expect(extractionCompleteCb).toHaveBeenCalledTimes(1);

    // Objective must change to escape!
    const objective = lm.getCurrentObjective();
    expect(objective).toContain('ESCAPE');
    expect(objective).not.toContain('Extract Princess Odette');
  });
});
