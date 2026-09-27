/**
 * ShipModel.js - Original 4-wing, rear-engine retro sci-fi fighter spacecraft.
 * Correctly oriented: Nose at -Z (forward flight direction), Engines at +Z (rear).
 */
import * as THREE from 'three';

export class ShipModel {
  constructor() {
    this.group = new THREE.Group();
    this.wings = [];
    this.thrusters = [];
    this.thrusterGlows = [];
    this.muzzleFlashes = [];
    this.muzzleTimer = 0;

    this.buildModel();
  }

  buildModel() {
    this.group.clear();
    this.wings = [];
    this.thrusters = [];
    this.thrusterGlows = [];
    this.muzzleFlashes = [];

    // Materials - High-contrast metallic retro sci-fi
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xe0e8f5,
      metalness: 0.8,
      roughness: 0.25,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x0099ff,
      metalness: 0.7,
      roughness: 0.3,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x141820,
      metalness: 0.9,
      roughness: 0.2,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.85,
      roughness: 0.2,
    });

    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.9,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.95,
    });

    const glowCyan = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const glowMuzzle = new THREE.MeshBasicMaterial({ color: 0x33ffff, transparent: true, opacity: 0 });

    // 1. Sleek Fuselage (Length ~4.8 units, Nose pointing to -Z)
    const fuselageGeo = new THREE.ConeGeometry(1.15, 4.4, 10);
    fuselageGeo.rotateX(-Math.PI / 2); // Rotates apex to -Z (FORWARD!)
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    fuselage.scale.set(1.1, 0.65, 1.0);
    fuselage.position.set(0, 0, -0.2);
    this.group.add(fuselage);

    // Forward Nose Cone Needle
    const needleGeo = new THREE.ConeGeometry(0.35, 1.4, 8);
    needleGeo.rotateX(-Math.PI / 2); // Pointing to -Z
    const needle = new THREE.Mesh(needleGeo, darkMat);
    needle.position.set(0, 0.02, -2.8);
    this.group.add(needle);

    // Intake scoops on sides
    [-0.9, 0.9].forEach(x => {
      const scoopGeo = new THREE.BoxGeometry(0.35, 0.45, 1.8);
      const scoop = new THREE.Mesh(scoopGeo, accentMat);
      scoop.position.set(x, -0.05, 0.2);
      this.group.add(scoop);
    });

    // 2. Cockpit Canopy Dome (Tinted glass bubble with internal seat silhouette)
    const canopyGeo = new THREE.SphereGeometry(0.72, 16, 12);
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.scale.set(0.75, 0.6, 1.6);
    canopy.position.set(0, 0.42, -0.5);
    this.group.add(canopy);

    // Canopy frame rib
    const frameGeo = new THREE.TorusGeometry(0.5, 0.04, 6, 16, Math.PI);
    const canopyFrame = new THREE.Mesh(frameGeo, darkMat);
    canopyFrame.rotation.x = Math.PI / 2;
    canopyFrame.position.set(0, 0.48, -0.5);
    this.group.add(canopyFrame);

    // 3. Energetic Quad-Wing Design (Distinct 4 wings angled in an aggressive X)
    const wingDefs = [
      { name: 'UpperLeft', x: -1.4, y: 0.5, z: 0.2, rotZ: 0.22, rotY: 0.15, signX: -1 },
      { name: 'UpperRight', x: 1.4, y: 0.5, z: 0.2, rotZ: -0.22, rotY: -0.15, signX: 1 },
      { name: 'LowerLeft', x: -1.4, y: -0.4, z: 0.2, rotZ: -0.22, rotY: 0.15, signX: -1 },
      { name: 'LowerRight', x: 1.4, y: -0.4, z: 0.2, rotZ: 0.22, rotY: -0.15, signX: 1 },
    ];

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, -0.6);
    wingShape.lineTo(2.5, -0.2);
    wingShape.lineTo(2.3, 0.5);
    wingShape.lineTo(0, 0.4);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.07, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.center();

    wingDefs.forEach(def => {
      const wingGroup = new THREE.Group();
      const wingMesh = new THREE.Mesh(wingGeo, hullMat);
      if (def.signX < 0) wingMesh.scale.x = -1;
      wingGroup.add(wingMesh);

      // Wing stripe accent
      const stripeGeo = new THREE.BoxGeometry(0.8, 0.02, 0.15);
      const stripe = new THREE.Mesh(stripeGeo, accentMat);
      stripe.position.set(def.signX * 1.5, 0.05, 0);
      wingGroup.add(stripe);

      // Wingtip Plasma Cannon barrel (pointing FORWARD to -Z)
      const cannonGeo = new THREE.CylinderGeometry(0.08, 0.09, 1.8, 8);
      cannonGeo.rotateX(Math.PI / 2); // Along Z axis
      const cannon = new THREE.Mesh(cannonGeo, darkMat);
      cannon.position.set(def.signX * 2.5, 0, -0.4);
      wingGroup.add(cannon);

      // Glowing emitter ring at muzzle tip (at -Z)
      const muzzleRingGeo = new THREE.TorusGeometry(0.09, 0.03, 6, 12);
      const muzzleRing = new THREE.Mesh(muzzleRingGeo, glowCyan);
      muzzleRing.position.set(def.signX * 2.5, 0, -1.3);
      wingGroup.add(muzzleRing);

      // Muzzle Flash Sprite/Mesh
      const flashGeo = new THREE.SphereGeometry(0.28, 8, 8);
      const flash = new THREE.Mesh(flashGeo, glowMuzzle.clone());
      flash.position.set(def.signX * 2.5, 0, -1.45);
      wingGroup.add(flash);
      this.muzzleFlashes.push(flash);

      wingGroup.position.set(def.x, def.y, def.z);
      wingGroup.rotation.z = def.rotZ;
      wingGroup.rotation.y = def.rotY;

      this.wings.push(wingGroup);
      this.group.add(wingGroup);
    });

    // 4. Rear Twin Engines (Positioned at +Z = REAR)
    const engineGeo = new THREE.CylinderGeometry(0.48, 0.58, 2.0, 12);
    engineGeo.rotateX(Math.PI / 2); // along Z

    [-0.85, 0.85].forEach(x => {
      const engine = new THREE.Mesh(engineGeo, darkMat);
      engine.position.set(x, 0, 1.3);
      this.group.add(engine);

      // Engine Cowling Gold Trim Ring
      const trimGeo = new THREE.TorusGeometry(0.55, 0.06, 6, 16);
      const trim = new THREE.Mesh(trimGeo, goldMat);
      trim.position.set(x, 0, 1.9);
      this.group.add(trim);

      // Glowing Exhaust Nozzle (at +Z)
      const nozzleGeo = new THREE.RingGeometry(0.15, 0.48, 16);
      const nozzle = new THREE.Mesh(nozzleGeo, glowCyan.clone());
      nozzle.position.set(x, 0, 2.31);
      this.group.add(nozzle);
      this.thrusterGlows.push(nozzle);

      // Plasma Thruster Flame Cone (expanding towards +Z, behind the ship)
      const flameGeo = new THREE.ConeGeometry(0.42, 3.2, 12, 1, true);
      flameGeo.rotateX(Math.PI / 2); // Apex at -Z, expanding out to +Z!
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(x, 0, 3.8);
      this.group.add(flame);
      this.thrusters.push(flame);

      // Inner intense core flame
      const coreFlameGeo = new THREE.ConeGeometry(0.2, 2.2, 8);
      coreFlameGeo.rotateX(Math.PI / 2);
      const coreFlameMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
      });
      const coreFlame = new THREE.Mesh(coreFlameGeo, coreFlameMat);
      coreFlame.position.set(x, 0, 3.2);
      this.group.add(coreFlame);
      this.thrusters.push(coreFlame);
    });
  }

  triggerMuzzleFlash() {
    this.muzzleTimer = 0.08;
    this.muzzleFlashes.forEach(f => {
      f.material.opacity = 0.95;
      f.scale.setScalar(1.2 + Math.random() * 0.4);
    });
  }

  update(ship, dt) {
    // 1. Muzzle Flash Decay
    if (this.muzzleTimer > 0) {
      this.muzzleTimer -= dt;
      if (this.muzzleTimer <= 0) {
        this.muzzleFlashes.forEach(f => {
          f.material.opacity = 0;
        });
      }
    }

    // 2. Thruster Flame Scaling & Color
    let plumeScaleZ = 1.0;
    let plumeColor = 0x00f0ff;

    if (ship.isBoosting) {
      plumeScaleZ = 2.5;
      plumeColor = 0xff6600; // Fiery orange rocket boost!
    } else if (ship.isBraking) {
      plumeScaleZ = 0.35;
      plumeColor = 0x0066aa;
    }

    this.thrusters.forEach(plume => {
      plume.scale.set(
        1.0 + (Math.random() - 0.5) * 0.15,
        1.0 + (Math.random() - 0.5) * 0.15,
        plumeScaleZ * (0.95 + Math.random() * 0.1)
      );
      if (plume.material.color.getHex() !== 0xffffff) {
        plume.material.color.setHex(plumeColor);
      }
    });

    this.thrusterGlows.forEach(glow => {
      glow.material.color.setHex(plumeColor);
    });

    // 3. Dynamic banking flaps / wing flutter
    const bankFactor = ship.vx / 25;
    if (this.wings.length === 4) {
      this.wings[0].rotation.z = 0.22 - bankFactor * 0.12;
      this.wings[1].rotation.z = -0.22 - bankFactor * 0.12;
      this.wings[2].rotation.z = -0.22 - bankFactor * 0.12;
      this.wings[3].rotation.z = 0.22 - bankFactor * 0.12;
    }
  }
}
