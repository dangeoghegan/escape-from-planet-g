/**
 * Ship.js - Handles flight physics, velocity, steering, boost, hull damage, and camera modes.
 */
import * as THREE from 'three';

export class Ship {
  constructor(options = {}) {
    this.radius = options.radius || 1.8;

    // Movement speeds
    this.cruiseSpeed = 38;
    this.minSpeed = 18;
    this.maxNormalSpeed = 42;
    this.boostSpeed = 68;

    this.accelForward = 30;
    this.brakeDecel = 45;
    this.steerAccel = 85;
    this.steerDrag = 7.0;

    // State
    this.s = 0;
    this.x = 0;
    this.y = 0;
    this.speed = this.cruiseSpeed;
    this.vx = 0;
    this.vy = 0;

    // Attitude / orientation offsets
    this.roll = 0;
    this.pitch = 0;
    this.yaw = 0;

    // Hull & Health
    this.maxHull = 100;
    this.hull = 100;
    this.isAlive = true;
    this.damageCooldownTimer = 0;
    this.cooldownDuration = 0.8; // 0.8 seconds invulnerability on damage
    this.deathTriggered = false;

    // Boost
    this.maxBoost = 100;
    this.boostCharge = 100;
    this.boostDrainRate = 35;
    this.boostRechargeRate = 22;
    this.boostThreshold = 15; // Minimum charge to engage boost
    this.isBoosting = false;
    this.isBraking = false;

    // Camera mode: 'chase' or 'cockpit'
    this.cameraMode = 'chase';

    // Combat & Weapons
    this.fireCooldownTimer = 0;
    this.fireCooldown = 0.18; // ~5.5 shots per second
    this.projectiles = []; // Active laser bolts
    this.score = 0;

    // Settings ref
    this.invertPitch = false;

    // World transform cache
    this.worldPosition = new THREE.Vector3();
    this.worldQuaternion = new THREE.Quaternion();
  }

  reset(s = 0, x = 0, y = 0, hull = 100) {
    this.s = s;
    this.x = x;
    this.y = y;
    this.speed = this.cruiseSpeed;
    this.vx = 0;
    this.vy = 0;
    this.roll = 0;
    this.pitch = 0;
    this.yaw = 0;
    this.hull = Math.max(0, Math.min(this.maxHull, hull));
    this.boostCharge = this.maxBoost;
    this.isAlive = this.hull > 0;
    this.deathTriggered = false;
    this.damageCooldownTimer = 0;
    this.isBoosting = false;
    this.isBraking = false;
    this.projectiles = [];
    this.fireCooldownTimer = 0;
  }

  toggleCamera() {
    this.cameraMode = this.cameraMode === 'chase' ? 'cockpit' : 'chase';
    return this.cameraMode;
  }

  setCameraMode(mode) {
    if (mode === 'chase' || mode === 'cockpit') {
      this.cameraMode = mode;
    }
  }

  fire() {
    if (!this.isAlive || this.fireCooldownTimer > 0) return null;

    this.fireCooldownTimer = this.fireCooldown;
    const laserSpeed = this.speed + 180; // High velocity projectile

    // Left and right wingtip cannons
    const leftBolt = {
      id: Math.random(),
      s: this.s + 3.0,
      x: this.x - 2.5,
      y: this.y,
      speed: laserSpeed,
      damage: 25,
      radius: 0.9,
      age: 0,
      maxAge: 1.5,
    };

    const rightBolt = {
      id: Math.random(),
      s: this.s + 3.0,
      x: this.x + 2.5,
      y: this.y,
      speed: laserSpeed,
      damage: 25,
      radius: 0.9,
      age: 0,
      maxAge: 1.5,
    };

    this.projectiles.push(leftBolt, rightBolt);
    return [leftBolt, rightBolt];
  }

  takeDamage(amount, source = 'impact') {
    if (!this.isAlive || this.damageCooldownTimer > 0) {
      return { damaged: false, hull: this.hull, died: false };
    }

    this.hull = Math.max(0, this.hull - amount);
    this.damageCooldownTimer = this.cooldownDuration;

    let died = false;
    if (this.hull <= 0 && !this.deathTriggered) {
      this.isAlive = false;
      this.deathTriggered = true;
      died = true;
    }

    return {
      damaged: true,
      amount,
      hull: this.hull,
      source,
      died,
    };
  }

  update(dt, input = {}, route = null) {
    if (dt <= 0) return;

    // Update cooldown
    if (this.damageCooldownTimer > 0) {
      this.damageCooldownTimer = Math.max(0, this.damageCooldownTimer - dt);
    }
    if (this.fireCooldownTimer > 0) {
      this.fireCooldownTimer = Math.max(0, this.fireCooldownTimer - dt);
    }

    // Update active projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.s += p.speed * dt;
      p.age += dt;
      if (p.age >= p.maxAge) {
        this.projectiles.splice(i, 1);
      }
    }

    // If dead, physics are locked or handled by cinematic crash tumble
    if (!this.isAlive) {
      this.speed = Math.max(0, this.speed - this.brakeDecel * dt * 0.5);
      this.s += this.speed * dt;
      return;
    }

    // Fire weapon if requested
    if (input.fire) {
      this.fire();
    }

    // Input interpretation
    const steerLeft = input.steerLeft || false;
    const steerRight = input.steerRight || false;
    const pitchUp = input.pitchUp || false;
    const pitchDown = input.pitchDown || false;
    const boostPressed = input.boost || false;
    const brakePressed = input.brake || false;

    // Boost & Brake logic
    if (boostPressed && this.boostCharge > (this.isBoosting ? 0 : this.boostThreshold)) {
      this.isBoosting = true;
      this.isBraking = false;
      this.boostCharge = Math.max(0, this.boostCharge - this.boostDrainRate * dt);
      if (this.boostCharge <= 0) {
        this.isBoosting = false;
      }
    } else {
      this.isBoosting = false;
      if (!boostPressed) {
        this.boostCharge = Math.min(this.maxBoost, this.boostCharge + this.boostRechargeRate * dt);
      }
    }

    if (brakePressed && !this.isBoosting) {
      this.isBraking = true;
    } else {
      this.isBraking = false;
    }

    // Target Speed
    let targetSpeed = this.cruiseSpeed;
    if (this.isBoosting) {
      targetSpeed = this.boostSpeed;
    } else if (this.isBraking) {
      targetSpeed = this.minSpeed;
    }

    // Speed acceleration / deceleration
    if (this.speed < targetSpeed) {
      const rate = this.isBoosting ? this.accelForward * 1.5 : this.accelForward;
      this.speed = Math.min(targetSpeed, this.speed + rate * dt);
    } else if (this.speed > targetSpeed) {
      const rate = this.isBraking ? this.brakeDecel * 1.5 : this.brakeDecel;
      this.speed = Math.max(targetSpeed, this.speed - rate * dt);
    }

    // Steering input axes (-1 to +1)
    let inputX = 0;
    if (steerRight) inputX += 1;
    if (steerLeft) inputX -= 1;

    let inputY = 0;
    if (pitchUp) inputY += 1;
    if (pitchDown) inputY -= 1;

    if (this.invertPitch) {
      inputY = -inputY;
    }

    // Lateral & Vertical acceleration
    this.vx += inputX * this.steerAccel * dt;
    this.vy += inputY * this.steerAccel * dt;

    // Natural drag
    this.vx *= Math.max(0, 1 - this.steerDrag * dt);
    this.vy *= Math.max(0, 1 - this.steerDrag * dt);

    // Apply movement
    this.s += this.speed * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Visual attitude (banking and pitching)
    const targetRoll = -inputX * 0.75; // Bank into turns
    const targetPitch = inputY * 0.45;
    const targetYaw = -inputX * 0.3;

    this.roll += (targetRoll - this.roll) * Math.min(1, 10 * dt);
    this.pitch += (targetPitch - this.pitch) * Math.min(1, 10 * dt);
    this.yaw += (targetYaw - this.yaw) * Math.min(1, 10 * dt);

    // Wall collision checks against the route if route provided
    if (route) {
      const collision = route.checkWallCollision(this.s, this.x, this.y, this.radius);
      if (collision.collided) {
        // Clamp inside corridor
        const dist = Math.sqrt(this.x * this.x + this.y * this.y);
        if (dist > 0.001) {
          this.x = (this.x / dist) * collision.maxRadius;
          this.y = (this.y / dist) * collision.maxRadius;
        }

        // Deflect velocity
        this.vx += collision.normalX * Math.abs(this.vx + 15) * 0.8;
        this.vy += collision.normalY * Math.abs(this.vy + 15) * 0.8;

        // Take collision damage
        this.takeDamage(15, 'wall');
      }
    }

    // Update world transform
    if (route) {
      this.updateWorldTransform(route);
    }
  }

  updateWorldTransform(route) {
    const frame = route.getFrameAt(this.s);
    this.worldPosition.copy(frame.pos)
      .addScaledVector(frame.right, this.x)
      .addScaledVector(frame.up, this.y);

    // Build rotation from route frame + ship attitude (yaw, pitch, roll)
    const basisMatrix = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent.clone().negate());
    const frameQuat = new THREE.Quaternion().setFromRotationMatrix(basisMatrix);

    const shipEuler = new THREE.Euler(this.pitch, this.yaw, this.roll, 'YXZ');
    const shipAttitudeQuat = new THREE.Quaternion().setFromEuler(shipEuler);

    this.worldQuaternion.multiplyQuaternions(frameQuat, shipAttitudeQuat);
  }
}
