/**
 * ShipModel.js - Original 4-wing, rear-engine retro sci-fi fighter spacecraft.
 */
import * as THREE from 'three';

export class ShipModel {
  constructor() {
    this.group = new THREE.Group();
    this.wings = [];
    this.thrusters = [];
    this.thrusterGlows = [];
    this.flaps = [];

    this.buildModel();
  }

  buildModel() {
    // Materials
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xd8e2ec,
      metalness: 0.7,
      roughness: 0.3,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x0088ff,
      metalness: 0.6,
      roughness: 0.4,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      metalness: 0.8,
      roughness: 0.3,
    });

    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d4ff,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.8,
      reflectivity: 0.9,
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
    });

    // 1. Fuselage
    const fuselageGeo = new THREE.ConeGeometry(1.2, 5.0, 8);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    fuselage.scale.set(1.0, 0.65, 1.0);
    this.group.add(fuselage);

    // Nose cone / sensor
    const noseGeo = new THREE.ConeGeometry(0.5, 1.5, 8);
    noseGeo.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, darkMat);
    nose.position.z = 3.0;
    this.group.add(nose);

    // 2. Cockpit Canopy (retro dome)
    const canopyGeo = new THREE.SphereGeometry(0.75, 16, 12);
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.scale.set(0.85, 0.6, 1.8);
    canopy.position.set(0, 0.45, 0.4);
    this.group.add(canopy);

    // 3. Four-Wing Configuration (Energetic X / Quad-wing retro silhouette)
    // Upper-left, upper-right, lower-left, lower-right
    const wingDefs = [
      { name: 'UL', x: -1.6, y: 0.6, z: -0.6, rotZ: 0.25, rotY: -0.2, signX: -1 },
      { name: 'UR', x: 1.6, y: 0.6, z: -0.6, rotZ: -0.25, rotY: 0.2, signX: 1 },
      { name: 'LL', x: -1.6, y: -0.5, z: -0.6, rotZ: -0.25, rotY: -0.2, signX: -1 },
      { name: 'LR', x: 1.6, y: -0.5, z: -0.6, rotZ: 0.25, rotY: 0.2, signX: 1 },
    ];

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(2.4, 0.5);
    wingShape.lineTo(2.2, 1.4);
    wingShape.lineTo(0, 1.2);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.center();

    wingDefs.forEach(def => {
      const wingGroup = new THREE.Group();
      const wingMesh = new THREE.Mesh(wingGeo, hullMat);

      if (def.signX < 0) {
        wingMesh.scale.x = -1;
      }
      wingGroup.add(wingMesh);

      // Wingtip cannon / fin
      const tipGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6);
      tipGeo.rotateX(Math.PI / 2);
      const tip = new THREE.Mesh(tipGeo, accentMat);
      tip.position.set(def.signX * 2.3, 0, 0);
      wingGroup.add(tip);

      // Tip energy emitter
      const emitterGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const emitter = new THREE.Mesh(emitterGeo, glowMat);
      emitter.position.set(def.signX * 2.3, 0, 0.85);
      wingGroup.add(emitter);

      wingGroup.position.set(def.x, def.y, def.z);
      wingGroup.rotation.z = def.rotZ;
      wingGroup.rotation.y = def.rotY;

      this.wings.push(wingGroup);
      this.group.add(wingGroup);
    });

    // 4. Rear Twin Engines
    const engineGeo = new THREE.CylinderGeometry(0.45, 0.55, 1.8, 12);
    engineGeo.rotateX(Math.PI / 2);

    const leftEngine = new THREE.Mesh(engineGeo, darkMat);
    leftEngine.position.set(-0.85, 0, -2.2);
    this.group.add(leftEngine);

    const rightEngine = new THREE.Mesh(engineGeo, darkMat);
    rightEngine.position.set(0.85, 0, -2.2);
    this.group.add(rightEngine);

    // Glowing engine nozzles & plumes
    [-0.85, 0.85].forEach(x => {
      const nozzleGeo = new THREE.RingGeometry(0.15, 0.45, 12);
      const nozzle = new THREE.Mesh(nozzleGeo, glowMat);
      nozzle.position.set(x, 0, -3.11);
      this.group.add(nozzle);

      // Thruster plume cone
      const plumeGeo = new THREE.ConeGeometry(0.4, 2.5, 8);
      plumeGeo.rotateX(-Math.PI / 2);
      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.85,
      });
      const plume = new THREE.Mesh(plumeGeo, plumeMat);
      plume.position.set(x, 0, -4.3);
      this.group.add(plume);
      this.thrusters.push(plume);
      this.thrusterGlows.push(nozzle);
    });
  }

  update(ship, dt) {
    // Dynamic thruster glow scaling with boost and brake
    let plumeScaleZ = 1.0;
    let plumeColor = 0x00e5ff;

    if (ship.isBoosting) {
      plumeScaleZ = 2.4;
      plumeColor = 0xff6600; // Orange fiery boost!
    } else if (ship.isBraking) {
      plumeScaleZ = 0.35;
      plumeColor = 0x0088cc;
    }

    this.thrusters.forEach(plume => {
      plume.scale.set(1.0, 1.0, plumeScaleZ);
      plume.material.color.setHex(plumeColor);
      // Subtle exhaust jitter
      plume.scale.x = 1.0 + (Math.random() - 0.5) * 0.15;
      plume.scale.y = 1.0 + (Math.random() - 0.5) * 0.15;
    });

    this.thrusterGlows.forEach(glow => {
      glow.material.color.setHex(plumeColor);
    });

    // Subtly animate wings with steering
    const bankFactor = ship.vx / 20;
    if (this.wings.length === 4) {
      this.wings[0].rotation.z = 0.25 - bankFactor * 0.1;
      this.wings[1].rotation.z = -0.25 - bankFactor * 0.1;
      this.wings[2].rotation.z = -0.25 - bankFactor * 0.1;
      this.wings[3].rotation.z = 0.25 - bankFactor * 0.1;
    }
  }
}
