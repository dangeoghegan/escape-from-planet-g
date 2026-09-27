/**
 * HazardRenderer.js - 3D visual representations of active hazards:
 * flying spears with unicorn-horn tips, swinging pendulums, telegraphed falling rocks, and volcanic vents.
 */
import * as THREE from 'three';

export class HazardRenderer {
  constructor(route, hazardManager) {
    this.route = route;
    this.hazardManager = hazardManager;
    this.group = new THREE.Group();

    this.spearMeshes = new Map();
    this.swingMeshes = new Map();
    this.fallingMeshes = new Map();
    this.ventMeshes = new Map();

    this.buildHazardMeshes();
  }

  buildHazardMeshes() {
    this.group.clear();
    this.spearMeshes.clear();
    this.swingMeshes.clear();
    this.fallingMeshes.clear();
    this.ventMeshes.clear();

    const hazards = this.hazardManager.hazards || [];

    hazards.forEach(h => {
      if (h.type === 'spear') {
        this.createSpearVisual(h);
      } else if (h.type === 'swinging') {
        this.createSwingingVisual(h);
      } else if (h.type === 'falling') {
        this.createFallingVisual(h);
      } else if (h.type === 'vent') {
        this.createVentVisual(h);
      }
    });
  }

  createSpearVisual(h) {
    const spearGroup = new THREE.Group();

    // Spear shaft
    const shaftGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.6, 6);
    shaftGeo.rotateX(Math.PI / 2);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x5a4130, roughness: 0.8 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    spearGroup.add(shaft);

    // Fantastical Unicorn-horn Point
    const hornGeo = new THREE.ConeGeometry(0.25, 1.4, 6);
    hornGeo.rotateX(Math.PI / 2);
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x77ccff,
      metalness: 0.8,
      roughness: 0.2,
    });
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.z = 2.4;
    spearGroup.add(horn);

    // Glowing magic trail
    const trailGeo = new THREE.CylinderGeometry(0.12, 0.02, 3.0, 6);
    trailGeo.rotateX(Math.PI / 2);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.6,
    });
    const trail = new THREE.Mesh(trailGeo, trailMat);
    trail.position.z = -1.5;
    spearGroup.add(trail);

    // Warning trajectory aim line (shown during wind-up)
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
    ]);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xff3366,
      dashSize: 1.5,
      gapSize: 1.0,
      transparent: true,
      opacity: 0.8,
    });
    const aimLine = new THREE.Line(lineGeo, lineMat);
    aimLine.visible = false;
    this.group.add(aimLine);

    spearGroup.visible = false;
    this.group.add(spearGroup);

    this.spearMeshes.set(h.id, { spearGroup, aimLine, hazard: h });
  }

  createSwingingVisual(h) {
    const swingGroup = new THREE.Group();

    // Spiked boulder / pendulum bob
    const bobGeo = new THREE.DodecahedronGeometry(h.radius, 1);
    const bobMat = new THREE.MeshStandardMaterial({
      color: 0x483d35,
      roughness: 0.9,
      metalness: 0.3,
    });
    const bob = new THREE.Mesh(bobGeo, bobMat);
    swingGroup.add(bob);

    // Suspension cable/root
    const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, 12, 6);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x2e1d13, roughness: 0.9 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.y = 6;
    swingGroup.add(cable);

    this.group.add(swingGroup);
    this.swingMeshes.set(h.id, { swingGroup, hazard: h });
  }

  createFallingVisual(h) {
    const fallingGroup = new THREE.Group();

    // Falling Rock / Crystal Stalactite
    const rockGeo = new THREE.ConeGeometry(h.radius * 0.9, 5.0, 6);
    rockGeo.rotateX(Math.PI);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x584f68,
      emissive: 0x1f162e,
      roughness: 0.8,
    });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    fallingGroup.add(rock);

    // Warning Reticle on floor
    const warningRingGeo = new THREE.RingGeometry(h.radius * 0.8, h.radius * 1.3, 16);
    warningRingGeo.rotateX(-Math.PI / 2);
    const warningMat = new THREE.MeshBasicMaterial({
      color: 0xff2244,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const warningRing = new THREE.Mesh(warningRingGeo, warningMat);
    warningRing.visible = false;
    this.group.add(warningRing);

    this.group.add(fallingGroup);
    this.fallingMeshes.set(h.id, { fallingGroup, warningRing, hazard: h });
  }

  createVentVisual(h) {
    const ventGroup = new THREE.Group();

    // Vent Base
    const baseGeo = new THREE.CylinderGeometry(h.radius, h.radius * 1.3, 2.0, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x221714, roughness: 0.95 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 1.0;
    ventGroup.add(base);

    // Flame / Heat Column
    const flameGeo = new THREE.CylinderGeometry(h.radius * 0.7, h.radius * 1.1, h.height, 10, 1, true);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 1.0 + h.height / 2;
    flame.visible = false;
    ventGroup.add(flame);

    // Smoke Warning Cone
    const smokeGeo = new THREE.ConeGeometry(h.radius * 0.6, 4.0, 8);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.4,
    });
    const smoke = new THREE.Mesh(smokeGeo, smokeMat);
    smoke.position.y = 3.0;
    smoke.visible = false;
    ventGroup.add(smoke);

    this.group.add(ventGroup);
    this.ventMeshes.set(h.id, { ventGroup, flame, smoke, hazard: h });
  }

  update(dt, ship) {
    // 1. Update Spears
    this.spearMeshes.forEach(item => {
      const h = item.hazard;
      const frame = this.route.getFrameAt(h.projS || h.s);

      if (h.state === 'windup') {
        // Show glowing warning line from ledge to target
        item.aimLine.visible = true;
        const start = frame.pos.clone()
          .addScaledVector(frame.right, h.ledgeX)
          .addScaledVector(frame.up, h.ledgeY);
        const end = frame.pos.clone()
          .addScaledVector(frame.right, h.targetX)
          .addScaledVector(frame.up, h.targetY);
        item.aimLine.geometry.setFromPoints([start, end]);
        item.aimLine.computeLineDistances();
        item.spearGroup.visible = false;
      } else if (h.state === 'flying') {
        item.aimLine.visible = false;
        item.spearGroup.visible = true;

        const pos = frame.pos.clone()
          .addScaledVector(frame.right, h.projX)
          .addScaledVector(frame.up, h.projY);
        item.spearGroup.position.copy(pos);

        // Point spear in direction of travel
        const targetWorld = frame.pos.clone()
          .addScaledVector(frame.right, h.targetX)
          .addScaledVector(frame.up, h.targetY);
        item.spearGroup.lookAt(targetWorld);
      } else {
        item.aimLine.visible = false;
        item.spearGroup.visible = false;
      }
    });

    // 2. Update Swinging Traps
    this.swingMeshes.forEach(item => {
      const h = item.hazard;
      const frame = this.route.getFrameAt(h.s);
      const pos = frame.pos.clone()
        .addScaledVector(frame.right, h.currentX)
        .addScaledVector(frame.up, h.currentY);
      item.swingGroup.position.copy(pos);

      // Orient with route frame
      const basis = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent);
      item.swingGroup.setRotationFromMatrix(basis);
    });

    // 3. Update Falling Rocks
    this.fallingMeshes.forEach(item => {
      const h = item.hazard;
      const frame = this.route.getFrameAt(h.s);

      // Warning reticle on floor
      if (h.state === 'warning') {
        item.warningRing.visible = true;
        const floorPos = frame.pos.clone()
          .addScaledVector(frame.right, h.x)
          .addScaledVector(frame.up, -frame.radius + 1.0);
        item.warningRing.position.copy(floorPos);

        const basis = new THREE.Matrix4().makeBasis(frame.right, frame.tangent, frame.up);
        item.warningRing.setRotationFromMatrix(basis);

        // Pulse warning ring
        item.warningRing.scale.setScalar(1.0 + 0.2 * Math.sin(Date.now() * 0.015));
      } else {
        item.warningRing.visible = false;
      }

      // Falling rock body
      if (h.state === 'falling' || h.state === 'grounded') {
        item.fallingGroup.visible = true;
        const pos = frame.pos.clone()
          .addScaledVector(frame.right, h.x)
          .addScaledVector(frame.up, h.currentY);
        item.fallingGroup.position.copy(pos);
      } else {
        item.fallingGroup.visible = false;
      }
    });

    // 4. Update Volcanic Vents
    this.ventMeshes.forEach(item => {
      const h = item.hazard;
      const frame = this.route.getFrameAt(h.s);

      const pos = frame.pos.clone()
        .addScaledVector(frame.right, h.x)
        .addScaledVector(frame.up, h.baseY);
      item.ventGroup.position.copy(pos);

      const basis = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent);
      item.ventGroup.setRotationFromMatrix(basis);

      if (h.state === 'warning') {
        item.smoke.visible = true;
        item.flame.visible = false;
        item.smoke.scale.setScalar(1.0 + 0.3 * Math.sin(Date.now() * 0.02));
      } else if (h.state === 'active') {
        item.smoke.visible = false;
        item.flame.visible = true;
        item.flame.scale.x = 0.9 + Math.random() * 0.2;
        item.flame.scale.z = 0.9 + Math.random() * 0.2;
      } else {
        item.smoke.visible = false;
        item.flame.visible = false;
      }
    });
  }
}
