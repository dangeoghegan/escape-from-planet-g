/**
 * CharactersRenderer.js - 3D procedural characters:
 * Princess Odette in Level 5 Core Chamber and the Tallow alien spear throwers.
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

    // 1. Build Princess Odette if Level 5
    if (this.levelConfig.id === 5) {
      this.buildPrincessOdette();
    }

    // 2. Build Tallow figures for spear hazards in this level
    this.buildTallows();
  }

  buildPrincessOdette() {
    const extS = this.levelConfig.extractionS || 820;
    const frame = this.route.getFrameAt(extS);

    this.odetteGroup = new THREE.Group();
    // Position on dais below the corridor center line
    const daisPos = frame.pos.clone().addScaledVector(frame.up, -8.0);
    this.odetteGroup.position.copy(daisPos);

    // Orient dais to match route
    const basis = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent);
    this.odetteGroup.setRotationFromMatrix(basis);

    // Dais Platform
    const daisGeo = new THREE.CylinderGeometry(6.0, 7.5, 2.0, 16);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x1d2736,
      metalness: 0.8,
      roughness: 0.3,
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = -1.0;
    this.odetteGroup.add(dais);

    // Extraction Hover Ring (Glowing marker on the ground)
    const ringGeo = new THREE.RingGeometry(5.0, 5.8, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.extractionRing = new THREE.Mesh(ringGeo, ringMat);
    this.extractionRing.position.y = 0.05;
    this.odetteGroup.add(this.extractionRing);

    // Princess Odette Regal Figure
    const figureGroup = new THREE.Group();
    figureGroup.position.y = 0.0;

    // Flowing glowing dress (adult regal gown)
    const gownGeo = new THREE.ConeGeometry(1.4, 4.2, 16, 4, true);
    const gownMat = new THREE.MeshStandardMaterial({
      color: 0xffe6ff,
      emissive: 0xbb44aa,
      roughness: 0.3,
      metalness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const gown = new THREE.Mesh(gownGeo, gownMat);
    gown.position.y = 2.1;
    figureGroup.add(gown);

    // Torso & Bodice
    const torsoGeo = new THREE.CylinderGeometry(0.5, 0.45, 1.4, 12);
    const bodiceMat = new THREE.MeshStandardMaterial({
      color: 0xffc0eb,
      emissive: 0x992288,
      roughness: 0.4,
    });
    const torso = new THREE.Mesh(torsoGeo, bodiceMat);
    torso.position.y = 4.3;
    figureGroup.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.38, 12, 10);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfce0d2, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 5.3;
    figureGroup.add(head);

    // Long flowing red hair
    const hairGeo = new THREE.ConeGeometry(0.55, 2.2, 8);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xcc2900, roughness: 0.6 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 4.6, -0.2);
    hair.rotation.x = -0.15;
    figureGroup.add(hair);

    // Golden Regal Diadem / Crown
    const crownGeo = new THREE.TorusGeometry(0.36, 0.06, 6, 12);
    crownGeo.rotateX(Math.PI / 2);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 5.55;
    figureGroup.add(crown);

    this.odetteGroup.add(figureGroup);

    // Luminous Containment Energy Cage
    const cageGeo = new THREE.CylinderGeometry(2.4, 2.4, 7.5, 16, 1, true);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    this.containmentCage = new THREE.Mesh(cageGeo, cageMat);
    this.containmentCage.position.y = 3.8;
    this.odetteGroup.add(this.containmentCage);

    this.group.add(this.odetteGroup);
  }

  buildTallows() {
    const hazards = this.levelConfig.hazards || [];
    hazards.filter(h => h.type === 'spear').forEach((h, idx) => {
      const frame = this.route.getFrameAt(h.s);
      const tallow = new THREE.Group();

      // Position on cave ledge
      const pos = frame.pos.clone()
        .addScaledVector(frame.right, h.ledgeX)
        .addScaledVector(frame.up, h.ledgeY);
      tallow.position.copy(pos);

      // Face toward center tunnel
      const targetPos = frame.pos.clone()
        .addScaledVector(frame.right, h.targetX)
        .addScaledVector(frame.up, h.targetY);
      tallow.lookAt(targetPos);

      // Stylized 3D Tallow Alien Model
      // Non-graphic, stylized childlike alien figure (7-year-old child proportions, red hair, earthen loincloth)
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8a87c, roughness: 0.7 });
      const clothMat = new THREE.MeshStandardMaterial({ color: 0x6e503b, roughness: 0.9 });
      const redHairMat = new THREE.MeshStandardMaterial({ color: 0xd63412, roughness: 0.8 });

      // Torso & Loincloth
      const bodyGeo = new THREE.CylinderGeometry(0.4, 0.45, 1.2, 8);
      const body = new THREE.Mesh(bodyGeo, clothMat);
      body.position.y = 1.0;
      tallow.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.38, 10, 8);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 1.95;
      tallow.add(head);

      // Wild windswept red hair
      const hairGeo = new THREE.DodecahedronGeometry(0.42);
      const hair = new THREE.Mesh(hairGeo, redHairMat);
      hair.position.set(0, 2.1, 0);
      tallow.add(hair);

      // Right arm holding fantastical unicorn-horn-tipped spear
      const armGroup = new THREE.Group();
      armGroup.position.set(0.45, 1.4, 0);

      const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 6);
      const arm = new THREE.Mesh(armGeo, skinMat);
      arm.position.y = 0.4;
      armGroup.add(arm);

      // Fantastical Spear with Unicorn Horn Tip
      const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 6);
      shaftGeo.rotateX(Math.PI / 2);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.8 });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.set(0, 0.75, 0.6);
      armGroup.add(shaft);

      // Unicorn-horn point (spiraled cone)
      const hornGeo = new THREE.ConeGeometry(0.18, 1.1, 6);
      hornGeo.rotateX(Math.PI / 2);
      const hornMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x88bbff,
        roughness: 0.2,
        metalness: 0.7,
      });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.set(0, 0.75, 2.2);
      armGroup.add(horn);

      tallow.add(armGroup);

      this.tallows.push({
        id: idx,
        group: tallow,
        armGroup,
        spearHazard: h,
      });

      this.group.add(tallow);
    });
  }

  update(levelManager, dt) {
    // 1. Update Odette & Extraction Effects
    if (this.odetteGroup) {
      if (levelManager.isExtracted) {
        // Disperse cage and dim ring
        if (this.containmentCage) this.containmentCage.visible = false;
        if (this.extractionRing) this.extractionRing.material.opacity = 0.2;
      } else {
        // Animate glowing cage & extraction ring
        const time = Date.now() * 0.003;
        if (this.containmentCage) {
          this.containmentCage.rotation.y += 0.8 * dt;
          this.containmentCage.material.opacity = 0.35 + 0.2 * Math.sin(time);
        }
        if (this.extractionRing) {
          this.extractionRing.rotation.z += 0.5 * dt;
          if (levelManager.state === 'EXTRACTING') {
            this.extractionRing.material.color.setHex(0x00ff88);
          } else {
            this.extractionRing.material.color.setHex(0xffd700);
          }
        }
      }
    }

    // 2. Animate Tallow throw poses
    this.tallows.forEach(item => {
      const h = item.spearHazard;
      const dist = h.s - levelManager.ship.s;

      if (dist > 0 && dist < 110) {
        // Windup pose: raise spear high!
        item.armGroup.rotation.x = -Math.PI * 0.45;
      } else if (dist <= 60 && dist > 0) {
        // Throw pose: thrust spear forward!
        item.armGroup.rotation.x = 0.4;
      } else {
        // Rest pose
        item.armGroup.rotation.x = 0.0;
      }
    });
  }
}
