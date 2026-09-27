/**
 * CorridorRenderer.js - High-visibility 3D cavern/tunnel geometry,
 * glowing route guide tracks, perimeter biome props, checkpoints, and exit gates.
 */
import * as THREE from 'three';

export class CorridorRenderer {
  constructor(route, levelConfig) {
    this.route = route;
    this.levelConfig = levelConfig;
    this.group = new THREE.Group();

    this.tunnelMesh = null;
    this.guideTracks = null;
    this.decorationsGroup = new THREE.Group();
    this.checkpointRings = [];
    this.exitGate = null;

    this.buildCorridor();
  }

  buildCorridor() {
    this.group.clear();
    this.decorationsGroup.clear();
    this.checkpointRings = [];

    const samples = this.route.samples;
    if (samples.length < 2) return;

    const radialSegments = 20;
    const lengthSegments = samples.length - 1;

    // 1. Build Tunnel Wall Geometry
    const vertexCount = (lengthSegments + 1) * radialSegments;
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices = [];

    const palette = this.getThemePalette();

    let vertIdx = 0;
    let uvIdx = 0;

    for (let i = 0; i <= lengthSegments; i++) {
      const sample = samples[i];
      const radius = sample.radius;
      const pos = sample.pos;
      const right = sample.right;
      const up = sample.up;

      const segTheme = sample.theme || 'canyon';
      const baseCol = palette[segTheme] || palette.canyon;

      for (let j = 0; j < radialSegments; j++) {
        const theta = (j / radialSegments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        // Procedural rock facet variation (subtle, keeps corridor smooth)
        const wallRoughness = 1.0 + Math.sin(i * 0.8 + theta * 4) * 0.05;
        const r = radius * wallRoughness;

        const wallX = pos.x + (right.x * cos + up.x * sin) * r;
        const wallY = pos.y + (right.y * cos + up.y * sin) * r;
        const wallZ = pos.z + (right.z * cos + up.z * sin) * r;

        positions[vertIdx * 3] = wallX;
        positions[vertIdx * 3 + 1] = wallY;
        positions[vertIdx * 3 + 2] = wallZ;

        // Inward pointing normal
        normals[vertIdx * 3] = -(right.x * cos + up.x * sin);
        normals[vertIdx * 3 + 1] = -(right.y * cos + up.y * sin);
        normals[vertIdx * 3 + 2] = -(right.z * cos + up.z * sin);

        // Bright, readable vertex color with rock texture bands
        const band = 0.85 + 0.15 * Math.sin(i * 0.35 + theta * 2.0);
        // Floor lava or moss tinting:
        let col = baseCol.clone().multiplyScalar(band);
        if (sin < -0.7 && (segTheme === 'magma' || segTheme === 'caldera')) {
          col.lerp(new THREE.Color(0xff4400), 0.7); // Glowing lava floor!
        } else if (sin < -0.6 && (segTheme === 'root_grotto' || segTheme === 'roots')) {
          col.lerp(new THREE.Color(0x00ff88), 0.35); // Luminous moss floor!
        }

        colors[vertIdx * 3] = col.r;
        colors[vertIdx * 3 + 1] = col.g;
        colors[vertIdx * 3 + 2] = col.b;

        uvs[uvIdx * 2] = j / radialSegments;
        uvs[uvIdx * 2 + 1] = i / lengthSegments;

        vertIdx++;
        uvIdx++;
      }
    }

    // Build indices for inward-facing faces
    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const nextJ = (j + 1) % radialSegments;

        const a = i * radialSegments + j;
        const b = (i + 1) * radialSegments + j;
        const c = (i + 1) * radialSegments + nextJ;
        const d = i * radialSegments + nextJ;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const tunnelGeo = new THREE.BufferGeometry();
    tunnelGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    tunnelGeo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    tunnelGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    tunnelGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    tunnelGeo.setIndex(indices);

    const tunnelMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide, // Guarantees 100% visibility from any angle
    });

    this.tunnelMesh = new THREE.Mesh(tunnelGeo, tunnelMat);
    this.group.add(this.tunnelMesh);

    // 2. Build Glowing Route Guide Stripes (left & right flight corridors)
    this.buildGuideTracks();

    // 3. Build Checkpoints & Exits
    this.buildCheckpoints();
    this.buildExitGate();

    // 4. Build Perimeter Environmental Decorations
    this.buildThemedProps();

    this.group.add(this.decorationsGroup);
  }

  getThemePalette() {
    return {
      surface: new THREE.Color(0xa0b4c8),
      canyon: new THREE.Color(0xba7c52),
      cave_entrance: new THREE.Color(0x6e6358),
      root_grotto: new THREE.Color(0x3a6046),
      roots: new THREE.Color(0x485838),
      abyss: new THREE.Color(0x284840),
      amethyst: new THREE.Color(0x6a488a),
      geode: new THREE.Color(0x386882),
      crystal_rift: new THREE.Color(0x467696),
      magma: new THREE.Color(0x8a3824),
      obsidian: new THREE.Color(0x3c3438),
      caldera: new THREE.Color(0x782818),
      citadel: new THREE.Color(0x345472),
      core_chamber: new THREE.Color(0x2d587c),
      escape_shaft: new THREE.Color(0x7c3c24),
      surface_escape: new THREE.Color(0x82a4bc),
    };
  }

  buildGuideTracks() {
    // Twin luminous neon ribbons along the left and right walls of the tunnel
    const samples = this.route.samples;
    const trackPointsLeft = [];
    const trackPointsRight = [];

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const r = s.radius * 0.95;
      trackPointsLeft.push(
        s.pos.clone().addScaledVector(s.right, -r).addScaledVector(s.up, -1.0)
      );
      trackPointsRight.push(
        s.pos.clone().addScaledVector(s.right, r).addScaledVector(s.up, -1.0)
      );
    }

    const leftCurve = new THREE.CatmullRomCurve3(trackPointsLeft);
    const rightCurve = new THREE.CatmullRomCurve3(trackPointsRight);

    const leftGeo = new THREE.TubeGeometry(leftCurve, samples.length, 0.22, 6, false);
    const rightGeo = new THREE.TubeGeometry(rightCurve, samples.length, 0.22, 6, false);

    const guideMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
    });

    const leftTrack = new THREE.Mesh(leftGeo, guideMat);
    const rightTrack = new THREE.Mesh(rightGeo, guideMat);

    this.group.add(leftTrack);
    this.group.add(rightTrack);
  }

  buildCheckpoints() {
    const ringGeo = new THREE.TorusGeometry(15, 0.8, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.85,
    });

    this.route.checkpoints.forEach((cp, idx) => {
      const frame = this.route.getFrameAt(cp.s);
      const ringGroup = new THREE.Group();
      ringGroup.position.copy(frame.pos);

      // Orient ring perpendicular to flight direction (facing tangent)
      const basis = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent);
      ringGroup.setRotationFromMatrix(basis);

      const ring = new THREE.Mesh(ringGeo, ringMat.clone());
      ringGroup.add(ring);

      // Inner glowing chevron signposts
      const chevronGeo = new THREE.ConeGeometry(1.2, 3.0, 4);
      chevronGeo.rotateZ(-Math.PI / 2); // points forward
      const chevronMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      [-8, 8].forEach(x => {
        const chev = new THREE.Mesh(chevronGeo, chevronMat);
        chev.position.set(x, 0, 0);
        ringGroup.add(chev);
      });

      this.checkpointRings.push({ group: ringGroup, mesh: ring, cp });
      this.decorationsGroup.add(ringGroup);
    });
  }

  buildExitGate() {
    const frame = this.route.getFrameAt(this.route.exitDistance);
    const gateGroup = new THREE.Group();
    gateGroup.position.copy(frame.pos);

    const basis = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent);
    gateGroup.setRotationFromMatrix(basis);

    const gateGeo = new THREE.TorusGeometry(frame.radius * 0.92, 1.6, 8, 36);
    const gateMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.9,
    });
    this.exitGate = new THREE.Mesh(gateGeo, gateMat);
    gateGroup.add(this.exitGate);

    // Radiant exit beacon light
    const exitLight = new THREE.PointLight(0xffd700, 3.0, 80);
    gateGroup.add(exitLight);

    this.decorationsGroup.add(gateGroup);
  }

  buildThemedProps() {
    const samples = this.route.samples;

    // Add perimeter props every 5 samples, strictly on the walls, floor, or ceiling!
    // NEVER in the center flight corridor!
    for (let i = 3; i < samples.length - 3; i += 5) {
      const sample = samples[i];
      const theme = sample.theme;

      if (theme === 'canyon' || theme === 'surface') {
        // Canyon Arch resting on the ceiling perimeter
        this.addCanyonPerimeterArch(sample);
      } else if (theme === 'root_grotto' || theme === 'roots' || theme === 'abyss') {
        // Hanging roots on the ceiling and glowing mushrooms on wall ledges
        this.addHangingCeilingRoots(sample);
        this.addLuminescentMushrooms(sample);
      } else if (theme === 'amethyst' || theme === 'geode' || theme === 'crystal_rift') {
        // Glowing crystal clusters on walls
        this.addWallCrystals(sample);
      } else if (theme === 'magma' || theme === 'obsidian' || theme === 'caldera') {
        // Basalt wall columns and floor lava glow
        this.addBasaltWallColumns(sample);
      } else if (theme === 'citadel' || theme === 'core_chamber') {
        // High-tech conduit rings along walls
        this.addCitadelPerimeterConduits(sample);
      }
    }
  }

  addCanyonPerimeterArch(sample) {
    const archGeo = new THREE.TorusGeometry(sample.radius * 0.95, 1.8, 6, 16, Math.PI * 0.7);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x9e6844, roughness: 0.85 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.copy(sample.pos);
    const basis = new THREE.Matrix4().makeBasis(sample.right, sample.up, sample.tangent);
    arch.setRotationFromMatrix(basis);
    arch.rotation.z = Math.PI * 0.15;
    this.decorationsGroup.add(arch);
  }

  addHangingCeilingRoots(sample) {
    // Hanging roots attached to the top wall perimeter
    [-1, 0, 1].forEach(offsetIdx => {
      const rootGeo = new THREE.ConeGeometry(0.5, 5.5, 6);
      rootGeo.rotateX(Math.PI); // Hangs downward from ceiling
      const rootMat = new THREE.MeshStandardMaterial({ color: 0x423224, roughness: 0.9 });
      const root = new THREE.Mesh(rootGeo, rootMat);

      const offset = sample.up.clone().multiplyScalar(sample.radius - 2.5)
        .addScaledVector(sample.right, offsetIdx * 6);
      root.position.copy(sample.pos).add(offset);
      this.decorationsGroup.add(root);
    });
  }

  addLuminescentMushrooms(sample) {
    // Glowing emerald fungi on side walls
    [-1, 1].forEach(side => {
      const mushGroup = new THREE.Group();
      const capGeo = new THREE.SphereGeometry(0.8, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00aa44,
        roughness: 0.3,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.6;
      mushGroup.add(cap);

      const stemGeo = new THREE.CylinderGeometry(0.18, 0.25, 1.2, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0xddffdd, roughness: 0.7 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      mushGroup.add(stem);

      const wallPos = sample.pos.clone().addScaledVector(sample.right, side * (sample.radius - 1.5))
        .addScaledVector(sample.up, -3);
      mushGroup.position.copy(wallPos);
      mushGroup.rotation.z = side * -0.4;
      this.decorationsGroup.add(mushGroup);
    });
  }

  addWallCrystals(sample) {
    // Sparkling crystals projecting inward from side walls
    [-1, 1].forEach(side => {
      const crystalGeo = new THREE.ConeGeometry(1.6, 6.5, 5);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: side > 0 ? 0x00f0ff : 0xcc44ff,
        emissive: side > 0 ? 0x005577 : 0x551177,
        roughness: 0.15,
        metalness: 0.7,
        transparent: true,
        opacity: 0.88,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      const wallPos = sample.pos.clone().addScaledVector(sample.right, side * (sample.radius - 1.8));
      crystal.position.copy(wallPos);

      // Point inward away from wall
      const inward = sample.right.clone().multiplyScalar(-side);
      crystal.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), inward);
      this.decorationsGroup.add(crystal);
    });
  }

  addBasaltWallColumns(sample) {
    [-1, 1].forEach(side => {
      const colGeo = new THREE.CylinderGeometry(1.2, 1.5, 9.0, 6);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x221a18, roughness: 0.85 });
      const col = new THREE.Mesh(colGeo, colMat);
      const wallPos = sample.pos.clone().addScaledVector(sample.right, side * (sample.radius - 2.5))
        .addScaledVector(sample.up, -sample.radius * 0.4);
      col.position.copy(wallPos);
      this.decorationsGroup.add(col);
    });
  }

  addCitadelPerimeterConduits(sample) {
    // Glowing cyan energy rings along the perimeter
    const ringGeo = new THREE.TorusGeometry(sample.radius * 0.96, 0.4, 6, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x0088cc,
      roughness: 0.3,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(sample.pos);
    const basis = new THREE.Matrix4().makeBasis(sample.right, sample.up, sample.tangent);
    ring.setRotationFromMatrix(basis);
    this.decorationsGroup.add(ring);
  }

  update(ship, dt) {
    const time = Date.now() * 0.003;

    // Animate checkpoint rings
    this.checkpointRings.forEach(item => {
      const isPassed = ship.s >= item.cp.s;
      item.mesh.material.color.setHex(isPassed ? 0x335544 : 0x00ffaa);
      item.mesh.material.opacity = isPassed ? 0.3 : 0.75 + 0.25 * Math.sin(time + item.cp.s);
    });

    if (this.exitGate) {
      this.exitGate.rotation.z += 0.8 * dt;
    }
  }
}
