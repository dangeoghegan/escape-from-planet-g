/**
 * CorridorRenderer.js - Procedural 3D corridor mesh generation,
 * biome theming, checkpoint rings, and environment decorations.
 */
import * as THREE from 'three';

export class CorridorRenderer {
  constructor(route, levelConfig) {
    this.route = route;
    this.levelConfig = levelConfig;
    this.group = new THREE.Group();

    this.tunnelMesh = null;
    this.decorationsGroup = new THREE.Group();
    this.checkpointRings = [];
    this.extractionDais = null;
    this.exitGate = null;

    this.buildCorridor();
  }

  buildCorridor() {
    this.group.clear();
    this.decorationsGroup.clear();
    this.checkpointRings = [];

    const samples = this.route.samples;
    if (samples.length < 2) return;

    const radialSegments = 16;
    const lengthSegments = samples.length - 1;

    // Build geometry buffers manually for exact cross-sections along the parallel-transport frame
    const vertexCount = (lengthSegments + 1) * radialSegments;
    const indexCount = lengthSegments * radialSegments * 6;

    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices = [];

    // Theme color palettes
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

        // Add subtle procedural noise/irregularity to cave walls
        const roughness = (segTheme === 'surface') ? 1.0 : 1.0 + (Math.sin(i * 0.7 + theta * 3) * 0.08);
        const r = radius * roughness;

        // Position on the perimeter
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

        // Color modulation
        const shade = 0.75 + 0.25 * Math.sin(i * 0.4 + theta * 2);
        colors[vertIdx * 3] = baseCol.r * shade;
        colors[vertIdx * 3 + 1] = baseCol.g * shade;
        colors[vertIdx * 3 + 2] = baseCol.b * shade;

        uvs[uvIdx * 2] = j / radialSegments;
        uvs[uvIdx * 2 + 1] = i / lengthSegments;

        vertIdx++;
        uvIdx++;
      }
    }

    // Build indices
    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const nextJ = (j + 1) % radialSegments;

        const a = i * radialSegments + j;
        const b = (i + 1) * radialSegments + j;
        const c = (i + 1) * radialSegments + nextJ;
        const d = i * radialSegments + nextJ;

        // Inward-facing triangles
        indices.push(a, d, b);
        indices.push(b, d, c);
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
      roughness: 0.85,
      metalness: 0.2,
      side: THREE.BackSide,
    });

    this.tunnelMesh = new THREE.Mesh(tunnelGeo, tunnelMat);
    this.group.add(this.tunnelMesh);

    // Add Checkpoint holographic rings along the route
    this.buildCheckpoints();

    // Add Themed Environmental Props along the route
    this.buildThemedProps();

    // Add Exit Gate at end of level
    this.buildExitGate();

    this.group.add(this.decorationsGroup);
  }

  getThemePalette() {
    return {
      surface: new THREE.Color(0x76889b),
      canyon: new THREE.Color(0x8a5d3b),
      cave_entrance: new THREE.Color(0x423d38),
      root_grotto: new THREE.Color(0x28382c),
      roots: new THREE.Color(0x32281e),
      abyss: new THREE.Color(0x192723),
      amethyst: new THREE.Color(0x3e2b58),
      geode: new THREE.Color(0x23485c),
      crystal_rift: new THREE.Color(0x31536b),
      magma: new THREE.Color(0x562319),
      obsidian: new THREE.Color(0x2b2528),
      caldera: new THREE.Color(0x4c1e14),
      citadel: new THREE.Color(0x22364c),
      core_chamber: new THREE.Color(0x1d3a52),
      escape_shaft: new THREE.Color(0x4d281a),
      surface_escape: new THREE.Color(0x5d778a),
    };
  }

  buildCheckpoints() {
    const ringGeo = new THREE.TorusGeometry(14, 0.6, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.75,
    });

    this.route.checkpoints.forEach(cp => {
      const frame = this.route.getFrameAt(cp.s);
      const ring = new THREE.Mesh(ringGeo, ringMat.clone());
      ring.position.copy(frame.pos);

      // Orient ring perpendicular to route tangent
      const basis = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent);
      ring.setRotationFromMatrix(basis);

      this.checkpointRings.push({ mesh: ring, cp });
      this.decorationsGroup.add(ring);
    });
  }

  buildThemedProps() {
    const samples = this.route.samples;
    const levelId = this.levelConfig.id;

    // Add environmental structures every ~50m
    for (let i = 2; i < samples.length - 2; i += 4) {
      const sample = samples[i];
      const theme = sample.theme;

      if (theme === 'canyon' || theme === 'surface') {
        // Canyon Rock Arch
        this.addCanyonArch(sample);
      } else if (theme === 'root_grotto' || theme === 'roots' || theme === 'abyss') {
        // Twisted Glowing Roots
        this.addCaveRoots(sample);
      } else if (theme === 'amethyst' || theme === 'geode' || theme === 'crystal_rift') {
        // Glowing Crystal Clusters
        this.addCrystalClusters(sample);
      } else if (theme === 'magma' || theme === 'obsidian' || theme === 'caldera') {
        // Basalt Pillars and Magma Vents
        this.addBasaltPillars(sample);
      } else if (theme === 'citadel' || theme === 'core_chamber') {
        // Alien Citadel Conduit Rings
        this.addCitadelConduits(sample);
      }
    }
  }

  addCanyonArch(sample) {
    const archGeo = new THREE.TorusGeometry(sample.radius * 0.95, 2.0, 6, 12, Math.PI * 0.6);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x7a4d32, roughness: 0.9 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.copy(sample.pos);
    const basis = new THREE.Matrix4().makeBasis(sample.right, sample.up, sample.tangent);
    arch.setRotationFromMatrix(basis);
    arch.rotation.z = Math.PI * 0.2;
    this.decorationsGroup.add(arch);
  }

  addCaveRoots(sample) {
    const rootGeo = new THREE.CylinderGeometry(0.35, 0.7, sample.radius * 1.8, 6);
    const rootMat = new THREE.MeshStandardMaterial({ color: 0x3e2719, roughness: 0.95 });
    const root = new THREE.Mesh(rootGeo, rootMat);
    root.position.copy(sample.pos);
    const basis = new THREE.Matrix4().makeBasis(sample.right, sample.up, sample.tangent);
    root.setRotationFromMatrix(basis);
    root.rotation.z = (Math.random() - 0.5) * 1.2;
    this.decorationsGroup.add(root);
  }

  addCrystalClusters(sample) {
    [-1, 1].forEach(side => {
      const crystalGeo = new THREE.ConeGeometry(1.4, 6.0, 5);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: side > 0 ? 0x00ffff : 0xaa00ff,
        emissive: side > 0 ? 0x004466 : 0x440066,
        roughness: 0.2,
        metalness: 0.5,
        transparent: true,
        opacity: 0.85,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      const offset = sample.right.clone().multiplyScalar(side * (sample.radius - 2.5));
      crystal.position.copy(sample.pos).add(offset);
      crystal.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), offset.clone().negate().normalize());
      this.decorationsGroup.add(crystal);
    });
  }

  addBasaltPillars(sample) {
    const colGeo = new THREE.CylinderGeometry(1.2, 1.4, 8.0, 6);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x221c1a, roughness: 0.9 });
    const col = new THREE.Mesh(colGeo, colMat);
    const offset = sample.right.clone().multiplyScalar((Math.random() > 0.5 ? 1 : -1) * (sample.radius - 3));
    offset.addScaledVector(sample.up, -sample.radius + 3.5);
    col.position.copy(sample.pos).add(offset);
    this.decorationsGroup.add(col);
  }

  addCitadelConduits(sample) {
    const conduitGeo = new THREE.BoxGeometry(0.5, 0.5, 12);
    const conduitMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x005577,
      roughness: 0.3,
    });
    const conduit = new THREE.Mesh(conduitGeo, conduitMat);
    const offset = sample.up.clone().multiplyScalar(sample.radius - 1.5);
    conduit.position.copy(sample.pos).add(offset);
    this.decorationsGroup.add(conduit);
  }

  buildExitGate() {
    const frame = this.route.getFrameAt(this.route.exitDistance);
    const gateGeo = new THREE.TorusGeometry(frame.radius * 0.9, 1.2, 8, 32);
    const gateMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.85,
    });
    this.exitGate = new THREE.Mesh(gateGeo, gateMat);
    this.exitGate.position.copy(frame.pos);
    const basis = new THREE.Matrix4().makeBasis(frame.right, frame.up, frame.tangent);
    this.exitGate.setRotationFromMatrix(basis);
    this.decorationsGroup.add(this.exitGate);
  }

  update(ship, dt) {
    // Pulse checkpoint rings
    const time = Date.now() * 0.003;
    this.checkpointRings.forEach(item => {
      const isPassed = ship.s >= item.cp.s;
      item.mesh.material.color.setHex(isPassed ? 0x445566 : 0x00ffcc);
      item.mesh.material.opacity = isPassed ? 0.25 : 0.6 + 0.3 * Math.sin(time + item.cp.s);
    });

    if (this.exitGate) {
      this.exitGate.rotation.z += 0.8 * dt;
    }
  }
}
