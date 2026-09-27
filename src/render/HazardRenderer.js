/**
 * HazardRenderer.js - 3D visual representations of active hazards:
 * flying spears with unicorn-horn tips, swinging pendulums, telegraphed falling rocks,
 * volcanic vents, destructible barriers, and player laser bolts.
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
    this.barrierMeshes = new Map();

    // Laser projectile meshes pool
    this.laserPool = [];
    this.initLaserPool();

    this.buildHazardMeshes();
  }

  initLaserPool() {
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
    });
    const laserGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    for (let i = 0; i < 20; i++) {
      const laserGroup = new THREE.Group();

      // Outer glowing bolt
      const boltGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 6);
      boltGeo.rotateX(Math.PI / 2);
      const bolt = new THREE.Mesh(boltGeo, laserMat);
      laserGroup.add(bolt);

      // Core bright core
      const coreGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6);
      coreGeo.rotateX(Math.PI / 2);
      const core = new THREE.Mesh(coreGeo, laserGlowMat);
      laserGroup.add(core);

      laserGroup.visible = false;
      this.laserPool.push(laserGroup);
      this.group.add(laserGroup);
    }
  }

  buildHazardMeshes() {
    this.spearMeshes.clear();
    this.swingMeshes.clear();
    this.fallingMeshes.clear();
    this.ventMeshes.clear();
    this.barrierMeshes.clear();

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
      } else if (h.type === 'barrier') {
        this.createBarrierVisual(h);
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
      emissive: 0x00f0ff,
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
      opacity: 0.85,
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
      roughness: 0.85,
      metalness: 0.3,
    });
    const bob = new THREE.Mesh(bobGeo, bobMat);
    swingGroup.add(bob);

    // Glowing warning spikes
    for (let i = 0; i < 6; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.3, 1.2, 5);
      const spikeMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(
        Math.sin(i * 1.05) * h.radius,
        Math.cos(i * 1.05) * h.radius,
        0
      );
      swingGroup.add(spike);
    }

    // Suspension cable/root
    const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, 14, 6);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x2e1d13, roughness: 0.9 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.y = 7;
    swingGroup.add(cable);

    this.group.add(swingGroup);
    this.swingMeshes.set(h.id, { swingGroup, hazard: h });
  }

  createFallingVisual(h) {
    const fallingGroup = new THREE.Group();

    // Falling Rock / Crystal Stalactite
    const rockGeo = new THREE.ConeGeometry(h.radius * 0.9, 6.0, 6);
    rockGeo.rotateX(Math.PI);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x584f68,
      emissive: 0x241838,
      roughness: 0.75,
    });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    fallingGroup.add(rock);

    // Warning Reticle on floor
    const warningRingGeo = new THREE.RingGeometry(h.radius * 0.8, h.radius * 1.4, 20);
    warningRingGeo.rotateX(-Math.PI / 2);
    const warningMat = new THREE.MeshBasicMaterial({
      color: 0xff2244,
      transparent: true,
      opacity: 0.85,
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
      opacity: 0.85,
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
      opacity: 0.45,
    });
    const smoke = new THREE.Mesh(smokeGeo, smokeMat);
    smoke.position.y = 3.0;
    smoke.visible = false;
    ventGroup.add(smoke);

    this.group.add(ventGroup);
    this.ventMeshes.set(h.id, { ventGroup, flame, smoke, hazard: h });
  }

  createBarrierVisual(h) {
    const barrierGroup = new THREE.Group();

    // Destructible Rock/Crystal Wall
    const geo = new THREE.DodecahedronGeometry(h.radius, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x6e5244,
      emissive: 0xaa4400,
      roughness: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    barrierGroup.add(mesh);

    // Target Diamond Marker
    const markerGeo = new THREE.RingGeometry(0.8, 1.0, 4);
    markerGeo.rotateZ(Math.PI / 4);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.z = -h.radius - 0.2;
    barrierGroup.add(marker);

    this.group.add(barrierGroup);
    this.barrierMeshes.set(h.id, { barrierGroup, mesh, marker, hazard: h });
  }

  update(dt, ship) {
    // 1. Update Spears
    this.spearMeshes.forEach(item => {
      const h = item.hazard;

      if (h.isDestroyed) {
        item.aimLine.visible = false;
        item.spearGroup.visible = false;
        return;
      }

      const frame = this.route.getFrameAt(h.projS || h.s);

      if (h.state === 'windup') {
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

      const basis = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent);
      item.swingGroup.setRotationFromMatrix(basis);
    });

    // 3. Update Falling Rocks
    this.fallingMeshes.forEach(item => {
      const h = item.hazard;
      const frame = this.route.getFrameAt(h.s);

      if (h.state === 'warning') {
        item.warningRing.visible = true;
        const floorPos = frame.pos.clone()
          .addScaledVector(frame.right, h.x)
          .addScaledVector(frame.up, -frame.radius + 1.2);
        item.warningRing.position.copy(floorPos);

        const basis = new THREE.Matrix4().makeBasis(frame.right, frame.tangent, frame.up);
        item.warningRing.setRotationFromMatrix(basis);
        item.warningRing.scale.setScalar(1.0 + 0.25 * Math.sin(Date.now() * 0.018));
      } else {
        item.warningRing.visible = false;
      }

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
        item.smoke.scale.setScalar(1.0 + 0.35 * Math.sin(Date.now() * 0.02));
      } else if (h.state === 'active') {
        item.smoke.visible = false;
        item.flame.visible = true;
        item.flame.scale.x = 0.9 + Math.random() * 0.25;
        item.flame.scale.z = 0.9 + Math.random() * 0.25;
      } else {
        item.smoke.visible = false;
        item.flame.visible = false;
      }
    });

    // 5. Update Destructible Barriers
    this.barrierMeshes.forEach(item => {
      const h = item.hazard;
      if (h.isDestroyed) {
        item.barrierGroup.visible = false;
        return;
      }
      item.barrierGroup.visible = true;
      const frame = this.route.getFrameAt(h.s);
      const pos = frame.pos.clone()
        .addScaledVector(frame.right, h.x)
        .addScaledVector(frame.up, h.y);
      item.barrierGroup.position.copy(pos);

      if (item.marker) {
        item.marker.rotation.z += 1.5 * dt;
      }
    });

    // 6. Update Player Laser Projectiles
    const projectiles = ship.projectiles || [];
    for (let i = 0; i < this.laserPool.length; i++) {
      const mesh = this.laserPool[i];
      if (i < projectiles.length) {
        const p = projectiles[i];
        const frame = this.route.getFrameAt(p.s);
        const worldPos = frame.pos.clone()
          .addScaledVector(frame.right, p.x)
          .addScaledVector(frame.up, p.y);
        mesh.position.copy(worldPos);

        // Orient laser along route forward tangent
        const lookTarget = worldPos.clone().addScaledVector(frame.tangent, 10);
        mesh.lookAt(lookTarget);

        mesh.visible = true;
      } else {
        mesh.visible = false;
      }
    }
  }
}
