/**
 * EffectsRenderer.js - Particle explosions, crash smoke, shield flashes, and camera shake.
 */
import * as THREE from 'three';
import { storage } from '../logic/Storage.js';

export class EffectsRenderer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Active particle systems / explosions
    this.explosions = [];
    this.smokeParticles = [];

    // Camera shake state
    this.shakeIntensity = 0;
    this.shakeDecay = 4.0;
    this.shakeOffset = new THREE.Vector3();
  }

  triggerDamageFlash(amount) {
    const settings = storage.getSettings();
    if (!settings.reducedShake) {
      this.shakeIntensity = Math.min(1.2, this.shakeIntensity + 0.35 + (amount / 50));
    } else {
      this.shakeIntensity = 0.05;
    }
  }

  triggerCrashExplosion(position) {
    const settings = storage.getSettings();
    if (!settings.reducedShake) {
      this.shakeIntensity = 1.5;
    }

    const expGroup = new THREE.Group();
    expGroup.position.copy(position);

    // 1. Layered Fiery Core Sphere
    const coreGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.95,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    expGroup.add(core);

    // 2. Secondary Fire Shell
    const shellGeo = new THREE.SphereGeometry(2.4, 16, 16);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.8,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    expGroup.add(shell);

    // 3. Expanding Shockwave Ring
    const shockGeo = new THREE.RingGeometry(1.0, 1.8, 24);
    shockGeo.rotateX(Math.PI / 2);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const shock = new THREE.Mesh(shockGeo, shockMat);
    expGroup.add(shock);

    // 4. Fiery Debris Particles
    const particleCount = 45;
    const debris = [];
    const pGeo = new THREE.DodecahedronGeometry(0.35);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xaa2200,
      roughness: 0.5,
    });

    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(15 + Math.random() * 25);
      debris.push({ mesh: p, vel, rotSpeed: (Math.random() - 0.5) * 10 });
      expGroup.add(p);
    }

    // 5. Flash Light
    const light = new THREE.PointLight(0xff7700, settings.reducedFlash ? 2 : 8, 50);
    expGroup.add(light);

    this.group.add(expGroup);

    this.explosions.push({
      group: expGroup,
      core,
      shell,
      shock,
      debris,
      light,
      age: 0,
      maxAge: 2.5,
    });
  }

  addSmokePuff(position) {
    const puffGeo = new THREE.SphereGeometry(0.6 + Math.random() * 0.4, 8, 8);
    const puffMat = new THREE.MeshBasicMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.7,
    });
    const puff = new THREE.Mesh(puffGeo, puffMat);
    puff.position.copy(position).add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8
    ));
    this.group.add(puff);

    this.smokeParticles.push({
      mesh: puff,
      vel: new THREE.Vector3(0, 1.2 + Math.random(), 0),
      age: 0,
      maxAge: 1.2,
    });
  }

  update(dt) {
    // 1. Update Camera Shake
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * dt);
      const mag = this.shakeIntensity * 0.4;
      this.shakeOffset.set(
        (Math.random() - 0.5) * mag,
        (Math.random() - 0.5) * mag,
        (Math.random() - 0.5) * mag * 0.5
      );
    } else {
      this.shakeOffset.set(0, 0, 0);
    }

    // 2. Update Explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.age += dt;
      const progress = exp.age / exp.maxAge;

      // Expand core & shell
      exp.core.scale.setScalar(1 + progress * 6);
      exp.core.material.opacity = Math.max(0, 1 - progress * 1.5);

      exp.shell.scale.setScalar(1 + progress * 10);
      exp.shell.material.opacity = Math.max(0, 0.85 - progress * 1.2);

      exp.shock.scale.setScalar(1 + progress * 16);
      exp.shock.material.opacity = Math.max(0, 0.8 - progress);

      // Debris
      exp.debris.forEach(d => {
        d.mesh.position.addScaledVector(d.vel, dt);
        d.mesh.rotation.x += d.rotSpeed * dt;
        d.mesh.rotation.y += d.rotSpeed * dt;
        d.mesh.scale.setScalar(Math.max(0.1, 1 - progress));
      });

      // Light decay
      exp.light.intensity = Math.max(0, (1 - progress) * 8);

      if (exp.age >= exp.maxAge) {
        this.group.remove(exp.group);
        this.explosions.splice(i, 1);
      }
    }

    // 3. Update Smoke Puffs
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const sp = this.smokeParticles[i];
      sp.age += dt;
      const prog = sp.age / sp.maxAge;
      sp.mesh.position.addScaledVector(sp.vel, dt);
      sp.mesh.scale.setScalar(1 + prog * 2.0);
      sp.mesh.material.opacity = Math.max(0, 0.7 * (1 - prog));

      if (sp.age >= sp.maxAge) {
        this.group.remove(sp.mesh);
        this.smokeParticles.splice(i, 1);
      }
    }
  }

  clear() {
    this.explosions.forEach(exp => this.group.remove(exp.group));
    this.smokeParticles.forEach(sp => this.group.remove(sp.mesh));
    this.explosions = [];
    this.smokeParticles = [];
    this.shakeIntensity = 0;
  }
}
