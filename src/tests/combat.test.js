import { describe, it, expect, beforeEach } from 'vitest';
import { Ship } from '../logic/Ship.js';
import { HazardManager, SpearHazard, BarrierHazard } from '../logic/Hazards.js';

describe('Ship Combat System & Target Destruction', () => {
  let ship;
  let hazardManager;

  beforeEach(() => {
    ship = new Ship();
    hazardManager = new HazardManager([
      { type: 'spear', s: 100, ledgeX: 12, ledgeY: 2, targetX: 0, targetY: 0 },
      { type: 'barrier', s: 80, x: 0, y: 0, radius: 2.5, health: 25 },
    ]);
  });

  it('spawns twin laser bolts traveling forward when firing', () => {
    expect(ship.projectiles.length).toBe(0);
    const bolts = ship.fire();

    expect(bolts).not.toBeNull();
    expect(bolts.length).toBe(2);
    expect(ship.projectiles.length).toBe(2);

    // Twin bolts from left and right wingtips
    expect(bolts[0].x).toBeLessThan(0);
    expect(bolts[1].x).toBeGreaterThan(0);

    // Laser velocity is faster than ship forward cruise speed
    expect(bolts[0].speed).toBeGreaterThan(ship.speed + 150);
  });

  it('enforces firing rate cooldown', () => {
    ship.fire();
    expect(ship.projectiles.length).toBe(2);

    // Immediate second fire is blocked by cooldown
    const blocked = ship.fire();
    expect(blocked).toBeNull();
    expect(ship.projectiles.length).toBe(2);

    // Advance time past cooldown
    ship.update(0.2, {});
    expect(ship.fireCooldownTimer).toBe(0);

    // Can fire again
    const nextFire = ship.fire();
    expect(nextFire).not.toBeNull();
    expect(ship.projectiles.length).toBe(4);
  });

  it('hits and destroys Tallow scouts on ledges, awarding 200 points', () => {
    const tallow = hazardManager.hazards[0];
    expect(tallow.isDestroyed).toBe(false);

    // Position ship near tallow and fire laser towards ledge
    ship.s = 70;
    ship.fire();

    // Set laser coordinates to align with tallow ledge
    const laser = ship.projectiles[0];
    laser.s = tallow.s;
    laser.x = tallow.ledgeX;
    laser.y = tallow.ledgeY;

    const destroyed = hazardManager.checkProjectileHits(ship.projectiles);
    expect(destroyed.length).toBe(1);
    expect(destroyed[0].type).toBe('spear');
    expect(destroyed[0].score).toBe(200);
    expect(tallow.isDestroyed).toBe(true);

    // Destroyed tallow can no longer damage ship
    const hitRes = tallow.checkCollision(ship);
    expect(hitRes).toBeNull();
  });

  it('shatters destructible barriers and clears collision danger', () => {
    const barrier = hazardManager.hazards[1];
    expect(barrier.isDestroyed).toBe(false);

    // Laser hits barrier
    ship.fire();
    const laser = ship.projectiles[0];
    laser.s = barrier.s;
    laser.x = barrier.x;
    laser.y = barrier.y;

    const destroyed = hazardManager.checkProjectileHits(ship.projectiles);
    expect(destroyed.length).toBe(1);
    expect(destroyed[0].type).toBe('barrier');
    expect(destroyed[0].score).toBe(100);
    expect(barrier.isDestroyed).toBe(true);

    // Ship flying through previously blocked barrier takes no damage
    ship.s = barrier.s;
    ship.x = barrier.x;
    ship.y = barrier.y;
    const hitCheck = barrier.checkCollision(ship);
    expect(hitCheck).toBeNull();
  });

  it('does NOT damage the player ship with own lasers', () => {
    const initialHull = ship.hull;
    ship.fire();
    ship.update(0.5, {});
    expect(ship.hull).toBe(initialHull);
  });
});
