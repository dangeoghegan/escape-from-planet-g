/**
 * CharactersRenderer.js - 3D procedural characters:
 * - The Tallows: Stylized red-haired alien scouts on illuminated wall platforms with unicorn-horn spears.
 * - Princess Odette: Regal adult red-haired princess in a luminous flowing gown on the Core Dais.
 */
import * as THREE from 'three';

export class CharactersRenderer {
  constructor(route, levelConfig) {
    this.route = route;
    this.levelConfig = levelConfig;
    this.group = new THREE.Group();

    this.odetteGroup = null;
    this.containmentCage = null;
    this.extractionRing = null;
    this.tallows = []; // Array of Tallow models attached to spear hazards

    this.buildCharacters();
  }

  buildCharacters() {
    this.group.clear();
    this.tallows = [];
    this.odetteGroup = null;

    if (this.levelConfig.id === 5) {
      this.buildPrincessOdette();
    }

    this.buildTallows();
  }

  buildPrincessOdette() {
    const extS = this.levelConfig.extractionS || 820;
    const frame = this.route.getFrameAt(extS);

    this.odetteGroup = new THREE.Group();
    const daisPos = frame.pos.clone().addScaledVector(frame.up, -8.0);
    this.odetteGroup.position.copy(daisPos);

    const basis = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent);
    this.odetteGroup.setRotationFromMatrix(basis);

    // Illuminated Dais Platform
    const daisGeo = new THREE.CylinderGeometry(7.0, 8.5, 2.2, 20);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x22364c,
      metalness: 0.8,
      roughness: 0.25,
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = -1.1;
    this.odetteGroup.add(dais);

    // Glowing Platform Trim
    const trimGeo = new THREE.TorusGeometry(7.0, 0.25, 8, 32);
    trimGeo.rotateX(Math.PI / 2);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = 0.05;
    this.odetteGroup.add(trim);

    // Extraction Hover Ring (Glowing marker on the ground)
    const ringGeo = new THREE.RingGeometry(5.2, 6.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.extractionRing = new THREE.Mesh(ringGeo, ringMat);
    this.extractionRing.position.y = 0.1;
    this.odetteGroup.add(this.extractionRing);

    // Princess Odette Regal Figure
    const figureGroup = new THREE.Group();

    // Flowing glowing dress (adult regal gown)
    const gownGeo = new THREE.ConeGeometry(1.6, 4.8, 16, 4, true);
    const gownMat = new THREE.MeshStandardMaterial({
      color: 0xffe6ff,
      emissive: 0xcc44bb,
      roughness: 0.25,
      metalness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const gown = new THREE.Mesh(gownGeo, gownMat);
    gown.position.y = 2.4;
    figureGroup.add(gown);

    // Torso & Bodice
    const torsoGeo = new THREE.CylinderGeometry(0.52, 0.46, 1.5, 12);
    const bodiceMat = new THREE.MeshStandardMaterial({
      color: 0xffcceb,
      emissive: 0xaa2299,
      roughness: 0.35,
    });
    const torso = new THREE.Mesh(torsoGeo, bodiceMat);
    torso.position.y = 4.8;
    figureGroup.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.42, 12, 10);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfce0d2, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 5.9;
    figureGroup.add(head);

    // Long flowing red hair
    const hairGeo = new THREE.ConeGeometry(0.65, 2.6, 8);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xd9381e, roughness: 0.6 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 5.0, -0.25);
    hair.rotation.x = -0.15;
    figureGroup.add(hair);

    // Golden Regal Diadem / Crown
    const crownGeo = new THREE.TorusGeometry(0.42, 0.08, 6, 16);
    crownGeo.rotateX(Math.PI / 2);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.15 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 6.2;
    figureGroup.add(crown);

    this.odetteGroup.add(figureGroup);

    // Luminous Containment Energy Cage
    const cageGeo = new THREE.CylinderGeometry(2.8, 2.8, 8.5, 16, 1, true);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    this.containmentCage = new THREE.Mesh(cageGeo, cageMat);
    this.containmentCage.position.y = 4.2;
    this.odetteGroup.add(this.containmentCage);

    // Radiant core light
    const coreLight = new THREE.PointLight(0xffb703, 3.5, 50);
    coreLight.position.y = 4.5;
    this.odetteGroup.add(coreLight);

    this.group.add(this.odetteGroup);
  }

  buildTallows() {
    const hazards = this.levelConfig.hazards || [];
    hazards.filter(h => h.type === 'spear').forEach((h, idx) => {
      const frame = this.route.getFrameAt(h.s);
      const tallowGroup = new THREE.Group();

      // Platform position on the cavern wall
      const pos = frame.pos.clone()
        .addScaledVector(frame.right, h.ledgeX)
        .addScaledVector(frame.up, h.ledgeY);
      tallowGroup.position.copy(pos);

      // Face towards flight corridor center
      const targetPos = frame.pos.clone()
        .addScaledVector(frame.right, h.targetX)
        .addScaledVector(frame.up, h.targetY);
      tallowGroup.lookAt(targetPos);

      // 1. Illuminated Rock Outpost Balcony (Ensures high contrast & visibility!)
      const platformGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.8, 12);
      const platformMat = new THREE.MeshStandardMaterial({ color: 0x3d302a, roughness: 0.85 });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.y = -0.4;
      tallowGroup.add(platform);

      // Outpost crystal torch / spotlight
      const torchLight = new THREE.PointLight(0xff7700, 2.5, 25);
      torchLight.position.set(0, 1.2, 1.2);
      tallowGroup.add(torchLight);

      // 2. Stylized Tallow Alien Scout Figure (Bright, high-contrast, non-graphic)
      const figure = new THREE.Group();

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xffcaa0, roughness: 0.5 });
      const tunicMat = new THREE.MeshStandardMaterial({ color: 0x8a5234, roughness: 0.8 });
      const redHairMat = new THREE.MeshStandardMaterial({
        color: 0xff3b00,
        emissive: 0x661500,
        roughness: 0.5,
      });

      // Body / Tunic
      const bodyGeo = new THREE.CylinderGeometry(0.55, 0.65, 1.6, 8);
      const body = new THREE.Mesh(bodyGeo, tunicMat);
      body.position.y = 1.0;
      figure.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.52, 12, 10);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 2.2;
      figure.add(head);

      // Stylized large amber alien eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffd000 });
      [-0.18, 0.18].forEach(ex => {
        const eyeGeo = new THREE.SphereGeometry(0.12, 6, 6);
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(ex, 2.3, 0.44);
        figure.add(eye);
      });

      // Wild Fiery Red Hair
      const hairGeo = new THREE.DodecahedronGeometry(0.62);
      const hair = new THREE.Mesh(hairGeo, redHairMat);
      hair.position.set(0, 2.45, 0);
      figure.add(hair);

      // Right Arm holding fantastical unicorn-horn spear
      const armGroup = new THREE.Group();
      armGroup.position.set(0.6, 1.6, 0);

      const armGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 6);
      const arm = new THREE.Mesh(armGeo, skinMat);
      arm.position.y = 0.5;
      armGroup.add(arm);

      // Fantastical Spear
      const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 4.0, 6);
      shaftGeo.rotateX(Math.PI / 2);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2a, roughness: 0.8 });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.set(0, 0.9, 0.8);
      armGroup.add(shaft);

      // Glowing Unicorn-Horn Point (Spiraled radiant cone)
      const hornGeo = new THREE.ConeGeometry(0.25, 1.4, 6);
      hornGeo.rotateX(Math.PI / 2);
      const hornMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x00f0ff,
        metalness: 0.85,
        roughness: 0.15,
      });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.set(0, 0.9, 2.9);
      armGroup.add(horn);

      figure.add(armGroup);
      tallowGroup.add(figure);

      // 3. Floating Target Marker Diamond (High visibility HUD billboard)
      const markerGeo = new THREE.RingGeometry(0.7, 0.9, 4);
      markerGeo.rotateZ(Math.PI / 4); // Diamond shape
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0xff3344,
        side: THREE.DoubleSide,
      });
      const targetMarker = new THREE.Mesh(markerGeo, markerMat);
      targetMarker.position.set(0, 3.8, 0);
      tallowGroup.add(targetMarker);

      this.tallows.push({
        id: idx,
        group: tallowGroup,
        figure,
        armGroup,
        targetMarker,
        spearHazard: h,
        isDestroyed: false,
      });

      this.group.add(tallowGroup);
    });
  }

  update(levelManager, dt) {
    // 1. Update Odette in Level 5
    if (this.odetteGroup) {
      if (levelManager.isExtracted) {
        if (this.containmentCage) this.containmentCage.visible = false;
        if (this.extractionRing) this.extractionRing.material.opacity = 0.2;
      } else {
        const time = Date.now() * 0.003;
        if (this.containmentCage) {
          this.containmentCage.rotation.y += 0.8 * dt;
          this.containmentCage.material.opacity = 0.4 + 0.2 * Math.sin(time);
        }
        if (this.extractionRing) {
          this.extractionRing.rotation.z += 0.5 * dt;
          this.extractionRing.material.color.setHex(
            levelManager.state === 'EXTRACTING' ? 0x00ff88 : 0xffd700
          );
        }
      }
    }

    // 2. Animate Tallows & Target Markers
    this.tallows.forEach(item => {
      const h = item.spearHazard;

      // If destroyed by player weapon:
      if (h.isDestroyed) {
        item.group.visible = false;
        return;
      }
      item.group.visible = true;

      const dist = h.s - levelManager.ship.s;

      // Animate floating target marker
      if (item.targetMarker) {
        item.targetMarker.rotation.z += 1.5 * dt;
      }

      if (dist > 0 && dist < 120) {
        // Wind-up pose: raise spear high!
        item.armGroup.rotation.x = -Math.PI * 0.45;
      } else if (dist <= 65 && dist > 0) {
        // Throw pose: thrust spear forward!
        item.armGroup.rotation.x = 0.45;
      } else {
        item.armGroup.rotation.x = 0.0;
      }
    });
  }
}
