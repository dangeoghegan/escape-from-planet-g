/**
 * Hazards.js - Logic and state for all hazards: spears, swinging traps, falling rocks, and vents.
 */
import * as THREE from 'three';

export class HazardManager {
  constructor(hazardsConfig = []) {
    this.rawConfig = hazardsConfig;
    this.hazards = [];
    this.initHazards();
  }

  initHazards() {
    this.hazards = this.rawConfig.map((cfg, idx) => {
      const type = cfg.type;
      if (type === 'spear') {
        return new SpearHazard(idx, cfg);
      } else if (type === 'swinging') {
        return new SwingingTrap(idx, cfg);
      } else if (type === 'falling') {
        return new FallingObstacle(idx, cfg);
      } else if (type === 'vent') {
        return new VolcanicVent(idx, cfg);
      } else if (type === 'barrier') {
        return new BarrierHazard(idx, cfg);
      }
      return null;
    }).filter(Boolean);
  }

  reset() {
    for (const h of this.hazards) {
      h.reset();
    }
  }

  resetToCheckpoint(checkpointS) {
    // Reset hazards ahead of the checkpoint, or all of them
    for (const h of this.hazards) {
      if (h.s >= checkpointS - 20) {
        h.reset();
      }
    }
  }

  checkProjectileHits(projectiles = []) {
    const destroyedEvents = [];
    if (!projectiles || projectiles.length === 0) return destroyedEvents;

    for (let pIdx = projectiles.length - 1; pIdx >= 0; pIdx--) {
      const p = projectiles[pIdx];
      let pConsumed = false;

      for (const h of this.hazards) {
        if (!h.isDestructible || h.isDestroyed) continue;

        // Check if projectile overlaps target in s, x, y
        const ds = Math.abs(p.s - h.s);
        const targetRadius = h.targetRadius || h.radius || 2.5;

        if (ds <= (p.radius + targetRadius + 2.5)) {
          const tx = (h.ledgeX !== undefined) ? h.ledgeX : (h.x !== undefined ? h.x : 0);
          const ty = (h.ledgeY !== undefined) ? h.ledgeY : (h.y !== undefined ? h.y : 0);
          const dx = p.x - tx;
          const dy = p.y - ty;
          const dist2D = Math.sqrt(dx * dx + dy * dy);

          if (dist2D <= (p.radius + targetRadius)) {
            pConsumed = true;
            h.health -= p.damage || 25;

            if (h.health <= 0) {
              h.isDestroyed = true;
              h.state = 'finished';
              destroyedEvents.push({
                type: h.type,
                hazard: h,
                score: h.scoreVal || 100,
                x: h.x || h.ledgeX || 0,
                y: h.y || h.ledgeY || 0,
                s: h.s,
              });
            }
            break;
          }
        }
      }

      if (pConsumed) {
        projectiles.splice(pIdx, 1);
      }
    }

    return destroyedEvents;
  }

  update(dt, ship, route) {
    const hits = [];
    for (const h of this.hazards) {
      h.update(dt, ship);
      const hit = h.checkCollision(ship);
      if (hit) {
        hits.push(hit);
      }
    }
    return hits;
  }
}

export class SpearHazard {
  constructor(id, cfg) {
    this.id = id;
    this.type = 'spear';
    this.s = cfg.s; // Distance along route
    this.ledgeX = cfg.ledgeX || 12; // Tallow position on cave wall
    this.ledgeY = cfg.ledgeY || 4;
    this.targetX = cfg.targetX || 0;
    this.targetY = cfg.targetY || 0;
    this.damage = cfg.damage || 20;
    this.radius = 1.6;

    // Timing
    this.triggerDist = cfg.triggerDist || 110; // Distance at which windup begins
    this.throwDist = cfg.throwDist || 65;      // Distance at which spear releases
    this.speed = cfg.speed || 55;

    // State
    this.state = 'idle'; // idle, windup, flying, finished
    this.progress = 0; // 0 to 1 projectile flight
    this.projX = this.ledgeX;
    this.projY = this.ledgeY;
    this.projS = this.s;
    this.windupTimer = 0;
    this.hasHit = false;

    // Combat destructibility
    this.isDestructible = true;
    this.isDestroyed = false;
    this.health = 25;
    this.scoreVal = 200; // 200 points for shooting down a Tallow scout
    this.targetRadius = 3.5;
  }

  reset() {
    this.state = 'idle';
    this.progress = 0;
    this.projX = this.ledgeX;
    this.projY = this.ledgeY;
    this.projS = this.s;
    this.windupTimer = 0;
    this.hasHit = false;
    this.isDestroyed = false;
    this.health = 25;
  }

  update(dt, ship) {
    if (this.isDestroyed) {
      this.state = 'finished';
      return;
    }

    const distToShip = this.s - ship.s;

    if (this.state === 'idle') {
      if (distToShip > 0 && distToShip <= this.triggerDist) {
        this.state = 'windup';
        this.windupTimer = 0;
      }
    } else if (this.state === 'windup') {
      this.windupTimer += dt;
      if (distToShip <= this.throwDist || this.windupTimer >= 1.0) {
        this.state = 'flying';
        this.progress = 0;
        this.projX = this.ledgeX;
        this.projY = this.ledgeY;
        this.projS = this.s;
      }
    } else if (this.state === 'flying') {
      // Fly towards target across the tunnel and slightly towards the approaching ship
      const flightDuration = 1.0;
      this.progress += (dt / flightDuration);
      this.projX = this.ledgeX + (this.targetX - this.ledgeX) * Math.min(1.5, this.progress);
      this.projY = this.ledgeY + (this.targetY - this.ledgeY) * Math.min(1.5, this.progress);
      this.projS = this.s - (this.progress * 25); // Flies slightly forward/backward

      if (this.progress >= 1.5 || ship.s > this.s + 30) {
        this.state = 'finished';
      }
    }
  }

  checkCollision(ship) {
    if (this.state !== 'flying' || this.hasHit) return null;

    const ds = Math.abs(ship.s - this.projS);
    if (ds < (ship.radius + this.radius)) {
      const dx = ship.x - this.projX;
      const dy = ship.y - this.projY;
      const dist2D = Math.sqrt(dx * dx + dy * dy);

      if (dist2D < (ship.radius + this.radius)) {
        this.hasHit = true;
        return {
          type: 'spear',
          hazard: this,
          damage: this.damage,
          x: this.projX,
          y: this.projY,
          s: this.projS,
        };
      }
    }
    return null;
  }
}

export class SwingingTrap {
  constructor(id, cfg) {
    this.id = id;
    this.type = 'swinging';
    this.s = cfg.s;
    this.amplitude = cfg.amplitude || 8;
    this.frequency = cfg.frequency || 1.8; // rad/s
    this.phase = cfg.phase || 0;
    this.centerY = cfg.centerY || 0;
    this.centerX = cfg.centerX || 0;
    this.radius = cfg.radius || 2.4;
    this.damage = cfg.damage || 25;

    this.time = 0;
    this.currentX = 0;
    this.currentY = this.centerY;
  }

  reset() {
    this.time = 0;
    this.currentX = this.centerX + Math.sin(this.phase) * this.amplitude;
    this.currentY = this.centerY;
  }

  update(dt, ship) {
    this.time += dt;
    this.currentX = this.centerX + Math.sin(this.time * this.frequency + this.phase) * this.amplitude;
    // Slight pendulum arc in Y
    const normalizedOffset = (this.currentX - this.centerX) / this.amplitude;
    this.currentY = this.centerY + Math.abs(normalizedOffset) * 1.5;
  }

  checkCollision(ship) {
    const ds = Math.abs(ship.s - this.s);
    if (ds < (ship.radius + this.radius)) {
      const dx = ship.x - this.currentX;
      const dy = ship.y - this.currentY;
      const dist2D = Math.sqrt(dx * dx + dy * dy);

      if (dist2D < (ship.radius + this.radius)) {
        return {
          type: 'swinging',
          hazard: this,
          damage: this.damage,
          x: this.currentX,
          y: this.currentY,
          s: this.s,
        };
      }
    }
    return null;
  }
}

export class FallingObstacle {
  constructor(id, cfg) {
    this.id = id;
    this.type = 'falling';
    this.s = cfg.s;
    this.x = cfg.x || 0;
    this.startY = cfg.startY || 14;
    this.targetY = cfg.targetY || -8;
    this.radius = cfg.radius || 2.2;
    this.damage = cfg.damage || 30;
    this.triggerDist = cfg.triggerDist || 90;
    this.warningTime = cfg.warningTime || 1.2; // advance warning

    this.state = 'idle'; // idle, warning, falling, grounded
    this.timer = 0;
    this.currentY = this.startY;
    this.fallSpeed = 28;
    this.hasHit = false;
  }

  reset() {
    this.state = 'idle';
    this.timer = 0;
    this.currentY = this.startY;
    this.hasHit = false;
  }

  update(dt, ship) {
    const distToShip = this.s - ship.s;

    if (this.state === 'idle') {
      if (distToShip > 0 && distToShip <= this.triggerDist) {
        this.state = 'warning';
        this.timer = 0;
      }
    } else if (this.state === 'warning') {
      this.timer += dt;
      if (this.timer >= this.warningTime) {
        this.state = 'falling';
      }
    } else if (this.state === 'falling') {
      this.currentY -= this.fallSpeed * dt;
      if (this.currentY <= this.targetY) {
        this.currentY = this.targetY;
        this.state = 'grounded';
      }
    }
  }

  checkCollision(ship) {
    if ((this.state !== 'falling' && this.state !== 'grounded') || this.hasHit) return null;

    const ds = Math.abs(ship.s - this.s);
    if (ds < (ship.radius + this.radius)) {
      const dx = ship.x - this.x;
      const dy = ship.y - this.currentY;
      const dist2D = Math.sqrt(dx * dx + dy * dy);

      if (dist2D < (ship.radius + this.radius)) {
        this.hasHit = true;
        return {
          type: 'falling',
          hazard: this,
          damage: this.damage,
          x: this.x,
          y: this.currentY,
          s: this.s,
        };
      }
    }
    return null;
  }
}

export class VolcanicVent {
  constructor(id, cfg) {
    this.id = id;
    this.type = 'vent';
    this.s = cfg.s;
    this.x = cfg.x || 0;
    this.baseY = cfg.baseY || -10;
    this.height = cfg.height || 14;
    this.radius = cfg.radius || 2.0;
    this.damage = cfg.damage || 20;

    this.cycleTime = cfg.cycleTime || 3.5;
    this.warnDuration = 1.0;
    this.blastDuration = 1.2;
    this.time = cfg.timeOffset || 0;

    this.state = 'dormant'; // dormant, warning, active
  }

  reset() {
    this.time = 0;
    this.state = 'dormant';
  }

  update(dt, ship) {
    this.time = (this.time + dt) % this.cycleTime;
    const dormantTime = this.cycleTime - this.warnDuration - this.blastDuration;

    if (this.time < dormantTime) {
      this.state = 'dormant';
    } else if (this.time < dormantTime + this.warnDuration) {
      this.state = 'warning';
    } else {
      this.state = 'active';
    }
  }

  checkCollision(ship) {
    if (this.state !== 'active') return null;

    const ds = Math.abs(ship.s - this.s);
    if (ds < (ship.radius + this.radius)) {
      const dx = Math.abs(ship.x - this.x);
      const dy = ship.y - this.baseY;

      if (dx < (ship.radius + this.radius) && dy >= 0 && dy <= (this.height + ship.radius)) {
        return {
          type: 'vent',
          hazard: this,
          damage: this.damage,
          x: this.x,
          y: ship.y,
          s: this.s,
        };
      }
    }
    return null;
  }
}

export class BarrierHazard {
  constructor(id, cfg) {
    this.id = id;
    this.type = 'barrier';
    this.s = cfg.s;
    this.x = cfg.x || 0;
    this.y = cfg.y || 0;
    this.radius = cfg.radius || 3.0;
    this.targetRadius = this.radius;
    this.damage = cfg.damage || 20;
    this.health = cfg.health || 25;
    this.isDestructible = true;
    this.isDestroyed = false;
    this.scoreVal = 100;
  }

  reset() {
    this.isDestroyed = false;
    this.health = 25;
  }

  update(dt, ship) {
    // Static destructible obstacle in corridor
  }

  checkCollision(ship) {
    if (this.isDestroyed) return null;

    const ds = Math.abs(ship.s - this.s);
    if (ds < (ship.radius + this.radius)) {
      const dx = ship.x - this.x;
      const dy = ship.y - this.y;
      const dist2D = Math.sqrt(dx * dx + dy * dy);

      if (dist2D < (ship.radius + this.radius)) {
        return {
          type: 'barrier',
          hazard: this,
          damage: this.damage,
          x: this.x,
          y: this.y,
          s: this.s,
        };
      }
    }
    return null;
  }
}
