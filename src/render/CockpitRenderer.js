/**
 * CockpitRenderer.js - First-person 3D cockpit with dynamic flight yoke,
 * Flynn's flight-gloved hands, readable instruments, and canopy framing.
 */
import * as THREE from 'three';

export class CockpitRenderer {
  constructor() {
    this.group = new THREE.Group();
    this.yokeGroup = new THREE.Group();
    this.instrumentsGroup = new THREE.Group();

    // Animated HUD elements
    this.horizonBar = null;
    this.speedTextPlane = null;
    this.hullLeds = [];
    this.boostBar = null;
    this.alarmLight = null;

    this.buildCockpit();
  }

  buildCockpit() {
    // Materials
    const metalDark = new THREE.MeshStandardMaterial({
      color: 0x181c22,
      metalness: 0.85,
      roughness: 0.25,
    });

    const strutMat = new THREE.MeshStandardMaterial({
      color: 0x242a34,
      metalness: 0.9,
      roughness: 0.2,
    });

    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0x6e3d23, // Warm leather flight gloves
      roughness: 0.75,
      metalness: 0.1,
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xe8b89d,
      roughness: 0.6,
    });

    const glowCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const glowAmber = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const glowGreen = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const glowRed = new THREE.MeshBasicMaterial({ color: 0xff2244 });

    // 1. Canopy Framing (Arched struts along periphery leaving forward view wide open)
    const canopyFrame = new THREE.Group();

    // Bottom dashboard cowl
    const cowlGeo = new THREE.CylinderGeometry(2.4, 2.6, 1.2, 16, 1, false, -Math.PI / 3, (2 * Math.PI) / 3);
    const cowl = new THREE.Mesh(cowlGeo, metalDark);
    cowl.rotation.x = Math.PI / 2;
    cowl.position.set(0, -0.65, -0.8);
    canopyFrame.add(cowl);

    // Left and right canopy pillars
    const pillarGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.2, 8);
    const leftPillar = new THREE.Mesh(pillarGeo, strutMat);
    leftPillar.position.set(-1.15, 0.45, -0.85);
    leftPillar.rotation.z = -0.32;
    leftPillar.rotation.x = -0.25;
    canopyFrame.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, strutMat);
    rightPillar.position.set(1.15, 0.45, -0.85);
    rightPillar.rotation.z = 0.32;
    rightPillar.rotation.x = -0.25;
    canopyFrame.add(rightPillar);

    // Top canopy arch
    const archGeo = new THREE.TorusGeometry(1.2, 0.04, 8, 16, Math.PI * 0.7);
    const arch = new THREE.Mesh(archGeo, strutMat);
    arch.rotation.z = -Math.PI * 0.85;
    arch.position.set(0, 0.85, -0.9);
    canopyFrame.add(arch);

    this.group.add(canopyFrame);

    // 2. Dashboard Instrument Panel (placed low so it never blocks forward hazards)
    const dash = new THREE.Group();
    dash.position.set(0, -0.42, -0.95);

    // Central instrument housing
    const housingGeo = new THREE.BoxGeometry(1.6, 0.32, 0.4);
    const housing = new THREE.Mesh(housingGeo, metalDark);
    dash.add(housing);

    // Artificial horizon indicator in center
    const horizonGeo = new THREE.BoxGeometry(0.35, 0.04, 0.02);
    this.horizonBar = new THREE.Mesh(horizonGeo, glowCyan);
    this.horizonBar.position.set(0, 0.04, 0.21);
    dash.add(this.horizonBar);

    // Horizon reticle ring
    const reticleGeo = new THREE.RingGeometry(0.18, 0.2, 16);
    const reticle = new THREE.Mesh(reticleGeo, glowCyan);
    reticle.position.set(0, 0.04, 0.205);
    dash.add(reticle);

    // Hull Integrity LEDs (Left side)
    const ledGeo = new THREE.BoxGeometry(0.04, 0.08, 0.02);
    for (let i = 0; i < 5; i++) {
      const led = new THREE.Mesh(ledGeo, glowGreen.clone());
      led.position.set(-0.65 + i * 0.06, 0.04, 0.21);
      dash.add(led);
      this.hullLeds.push(led);
    }

    // Boost Bar (Right side)
    const boostGeo = new THREE.BoxGeometry(0.3, 0.06, 0.02);
    this.boostBar = new THREE.Mesh(boostGeo, glowAmber.clone());
    this.boostBar.position.set(0.5, 0.04, 0.21);
    dash.add(this.boostBar);

    // Warning / Alarm flasher
    const alarmGeo = new THREE.SphereGeometry(0.04, 8, 8);
    this.alarmLight = new THREE.Mesh(alarmGeo, glowRed.clone());
    this.alarmLight.position.set(0, 0.15, 0.21);
    this.alarmLight.visible = false;
    dash.add(this.alarmLight);

    this.instrumentsGroup.add(dash);
    this.group.add(this.instrumentsGroup);

    // 3. Flight Yoke and Captain Flynn's Gloved Hands
    this.yokeGroup.position.set(0, -0.35, -0.55);

    // Central column
    const columnGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.6, 12);
    const column = new THREE.Mesh(columnGeo, strutMat);
    column.rotation.x = 0.2;
    column.position.set(0, -0.2, 0);
    this.yokeGroup.add(column);

    // Yoke horizontal bar
    const barGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.55, 12);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, strutMat);
    this.yokeGroup.add(bar);

    // Left and right yoke handles
    [-0.28, 0.28].forEach(x => {
      const handleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.24, 12);
      const handle = new THREE.Mesh(handleGeo, metalDark);
      handle.position.set(x, 0.05, 0);
      handle.rotation.z = x < 0 ? -0.15 : 0.15;
      this.yokeGroup.add(handle);

      // Flynn's gloved hand gripping each handle!
      const handGroup = new THREE.Group();
      handGroup.position.set(x, 0.05, 0);

      // Glove palm / fist
      const fistGeo = new THREE.BoxGeometry(0.09, 0.11, 0.12);
      const fist = new THREE.Mesh(fistGeo, gloveMat);
      handGroup.add(fist);

      // Glove cuff
      const cuffGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.1, 10);
      const cuff = new THREE.Mesh(cuffGeo, gloveMat);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.set(x < 0 ? -0.02 : 0.02, -0.04, 0.1);
      handGroup.add(cuff);

      // Glove thumb
      const thumbGeo = new THREE.BoxGeometry(0.04, 0.05, 0.07);
      const thumb = new THREE.Mesh(thumbGeo, gloveMat);
      thumb.position.set(x < 0 ? 0.05 : -0.05, 0.05, -0.02);
      handGroup.add(thumb);

      this.yokeGroup.add(handGroup);
    });

    this.group.add(this.yokeGroup);
  }

  update(ship, dt) {
    // Dynamic yoke steering and pitching animation
    const targetYokeRotZ = -ship.vx * 0.028;
    const targetYokePitch = (ship.vy * 0.02) + (ship.isBraking ? 0.08 : ship.isBoosting ? -0.08 : 0);

    this.yokeGroup.rotation.z += (targetYokeRotZ - this.yokeGroup.rotation.z) * Math.min(1, 12 * dt);
    this.yokeGroup.rotation.x += (targetYokePitch - this.yokeGroup.rotation.x) * Math.min(1, 12 * dt);

    // Artificial horizon tilt
    if (this.horizonBar) {
      this.horizonBar.rotation.z = -ship.roll;
      this.horizonBar.position.y = 0.04 + (ship.pitch * 0.15);
    }

    // Hull LEDs
    const hullRatio = Math.max(0, ship.hull / ship.maxHull);
    const activeLeds = Math.ceil(hullRatio * 5);
    this.hullLeds.forEach((led, idx) => {
      if (idx < activeLeds) {
        led.visible = true;
        led.material.color.setHex(activeLeds <= 2 ? 0xff2244 : 0x00ff88);
      } else {
        led.visible = false;
      }
    });

    // Boost Bar
    if (this.boostBar) {
      const boostRatio = Math.max(0.05, ship.boostCharge / ship.maxBoost);
      this.boostBar.scale.x = boostRatio;
      this.boostBar.material.color.setHex(ship.isBoosting ? 0xff6600 : 0xffaa00);
    }

    // Alarm light flashes when damaged or low hull
    if (this.alarmLight) {
      if (ship.damageCooldownTimer > 0 || hullRatio < 0.3) {
        this.alarmLight.visible = (Date.now() % 300) < 150;
      } else {
        this.alarmLight.visible = false;
      }
    }
  }
}
