import { describe, it, expect, beforeEach } from 'vitest';
import { Ship } from '../logic/Ship.js';

describe('Ship Movement & Speed Limits', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship();
  });

  it('initializes with cruise speed and max boost', () => {
    expect(ship.speed).toBe(ship.cruiseSpeed);
    expect(ship.boostCharge).toBe(100);
    expect(ship.hull).toBe(100);
  });

  it('stays within intended speed limits during normal cruise', () => {
    for (let i = 0; i < 50; i++) {
      ship.update(0.1, {});
    }
    expect(ship.speed).toBeGreaterThanOrEqual(ship.minSpeed);
    expect(ship.speed).toBeLessThanOrEqual(ship.maxNormalSpeed);
  });

  it('accelerates under boost but caps strictly at boostSpeed', () => {
    // Hold boost for 2 seconds
    for (let i = 0; i < 20; i++) {
      ship.update(0.1, { boost: true });
    }
    expect(ship.speed).toBeLessThanOrEqual(ship.boostSpeed);
    expect(ship.speed).toBeGreaterThan(ship.cruiseSpeed);
    expect(ship.boostCharge).toBeLessThan(100);
  });

  it('brakes when brake key is pressed and caps at minSpeed', () => {
    for (let i = 0; i < 30; i++) {
      ship.update(0.1, { brake: true });
    }
    expect(ship.speed).toBeGreaterThanOrEqual(ship.minSpeed);
    expect(ship.speed).toBeCloseTo(ship.minSpeed, 1);
  });

  it('drains boost while boosting and stops boosting when boost depleted', () => {
    // Exhaust all boost
    for (let i = 0; i < 50; i++) {
      ship.update(0.1, { boost: true });
    }
    expect(ship.boostCharge).toBe(0);
    expect(ship.isBoosting).toBe(false);
  });

  it('recharges boost when not boosting', () => {
    ship.boostCharge = 20;
    ship.update(1.0, {});
    expect(ship.boostCharge).toBeGreaterThan(20);
    expect(ship.boostCharge).toBeLessThanOrEqual(100);
  });
});
