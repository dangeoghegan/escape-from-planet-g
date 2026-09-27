import { describe, it, expect, beforeEach } from 'vitest';
import { Ship } from '../logic/Ship.js';

describe('Damage and Invulnerability Cooldown', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship();
  });

  it('takes damage on first hit and sets damageCooldownTimer', () => {
    const res = ship.takeDamage(20, 'spear');
    expect(res.damaged).toBe(true);
    expect(ship.hull).toBe(80);
    expect(ship.damageCooldownTimer).toBeGreaterThan(0);
    expect(ship.damageCooldownTimer).toBe(ship.cooldownDuration);
  });

  it('ignores subsequent damage while cooldown is active', () => {
    ship.takeDamage(20, 'spear');
    expect(ship.hull).toBe(80);

    // Immediate second hit
    const secondHit = ship.takeDamage(30, 'wall');
    expect(secondHit.damaged).toBe(false);
    expect(ship.hull).toBe(80); // Still 80, not 50!

    // Partial dt tick (cooldown still active)
    ship.update(0.2, {});
    expect(ship.damageCooldownTimer).toBeGreaterThan(0);
    const thirdHit = ship.takeDamage(25, 'swinging');
    expect(thirdHit.damaged).toBe(false);
    expect(ship.hull).toBe(80);
  });

  it('allows damage again after cooldown expires', () => {
    ship.takeDamage(20, 'spear');
    expect(ship.hull).toBe(80);

    // Advance time beyond cooldown duration (0.8s)
    ship.update(1.0, {});
    expect(ship.damageCooldownTimer).toBe(0);

    const hitAfterCooldown = ship.takeDamage(25, 'falling');
    expect(hitAfterCooldown.damaged).toBe(true);
    expect(ship.hull).toBe(55);
  });
});
