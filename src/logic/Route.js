/**
 * Route.js - Manages the 3D flight corridor, spline interpolation, frames, and collision bounds.
 */
import * as THREE from 'three';

export class Route {
  constructor(segmentsData = []) {
    this.segments = segmentsData;
    this.samples = []; // Sampled points along the spline
    this.totalLength = 0;
    this.curve = null;
    this.checkpoints = [];
    this.extractionPoint = null;
    this.exitDistance = 0;
    this.buildRoute();
  }

  buildRoute() {
    if (!this.segments || this.segments.length === 0) {
      this.totalLength = 1000;
      return;
    }

    const controlPoints = [];
    this.checkpoints = [];

    let currentS = 0;
    const waypointMeta = [];

    for (let segIdx = 0; segIdx < this.segments.length; segIdx++) {
      const seg = this.segments[segIdx];
      const waypoints = seg.waypoints || [];

      for (let wpIdx = 0; wpIdx < waypoints.length; wpIdx++) {
        const wp = waypoints[wpIdx];
        const v = new THREE.Vector3(wp.x, wp.y, wp.z);

        // Avoid duplicate adjacent points
        if (controlPoints.length > 0) {
          const prev = controlPoints[controlPoints.length - 1];
          if (prev.distanceTo(v) < 0.1) continue;
        }

        controlPoints.push(v);
        waypointMeta.push({
          radius: wp.radius || seg.radius || 18,
          segmentIndex: segIdx,
          segmentName: seg.name || `Segment ${segIdx + 1}`,
          isCheckpoint: wp.isCheckpoint || false,
          checkpointId: wp.checkpointId || null,
          theme: seg.theme || 'canyon',
          isExtraction: wp.isExtraction || false,
        });
      }
    }

    if (controlPoints.length < 2) {
      controlPoints.push(new THREE.Vector3(0, 0, 0));
      controlPoints.push(new THREE.Vector3(0, 0, -1000));
      waypointMeta.push({ radius: 20, segmentIndex: 0, segmentName: 'Default', theme: 'canyon' });
      waypointMeta.push({ radius: 20, segmentIndex: 0, segmentName: 'Default', theme: 'canyon' });
    }

    this.curve = new THREE.CatmullRomCurve3(controlPoints, false, 'centripetal', 0.5);
    this.totalLength = this.curve.getLength();
    this.exitDistance = this.totalLength * 0.98;

    // Pre-sample frames along the route for fast query and smooth Frenet frames
    const sampleCount = Math.max(100, Math.floor(this.totalLength / 10)); // Sample every ~10 units
    this.samples = [];

    // Parallel transport frame initialization
    let prevTangent = new THREE.Vector3(0, 0, -1);
    let prevUp = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= sampleCount; i++) {
      const u = i / sampleCount;
      const s = u * this.totalLength;
      const pos = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u).normalize();

      // Parallel transport of up vector to prevent twisting
      let up = prevUp.clone();
      if (i > 0) {
        const axis = new THREE.Vector3().crossVectors(prevTangent, tangent);
        const angle = prevTangent.angleTo(tangent);
        if (axis.lengthSq() > 0.00001 && angle > 0.00001) {
          axis.normalize();
          up.applyAxisAngle(axis, angle);
        }
      }
      // Re-orthogonalize
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
      up.crossVectors(right, tangent).normalize();

      prevTangent.copy(tangent);
      prevUp.copy(up);

      // Interpolate metadata based on u
      const metaIndex = Math.min(
        waypointMeta.length - 1,
        Math.floor(u * (waypointMeta.length - 1))
      );
      const meta = waypointMeta[metaIndex];

      if (meta.isCheckpoint && (!this.checkpoints.some(cp => cp.id === meta.checkpointId))) {
        this.checkpoints.push({
          id: meta.checkpointId || `cp_${segIdx}_${i}`,
          s: s,
          position: pos.clone(),
          name: meta.segmentName,
        });
      }

      if (meta.isExtraction && !this.extractionPoint) {
        this.extractionPoint = {
          s: s,
          position: pos.clone(),
          radius: meta.radius,
        };
      }

      this.samples.push({
        u,
        s,
        pos,
        tangent,
        up,
        right,
        radius: meta.radius,
        segmentIndex: meta.segmentIndex,
        segmentName: meta.segmentName,
        theme: meta.theme,
      });
    }
  }

  getFrameAt(s) {
    if (this.samples.length === 0) {
      return {
        pos: new THREE.Vector3(0, 0, -s),
        tangent: new THREE.Vector3(0, 0, -1),
        up: new THREE.Vector3(0, 1, 0),
        right: new THREE.Vector3(1, 0, 0),
        radius: 20,
        segmentIndex: 0,
        segmentName: 'Start',
        theme: 'canyon',
      };
    }

    const clampedS = Math.max(0, Math.min(this.totalLength, s));
    const sampleIdx = (clampedS / this.totalLength) * (this.samples.length - 1);
    const low = Math.floor(sampleIdx);
    const high = Math.min(this.samples.length - 1, Math.ceil(sampleIdx));
    const alpha = sampleIdx - low;

    const s0 = this.samples[low];
    const s1 = this.samples[high];

    const pos = new THREE.Vector3().lerpVectors(s0.pos, s1.pos, alpha);
    const tangent = new THREE.Vector3().lerpVectors(s0.tangent, s1.tangent, alpha).normalize();
    const up = new THREE.Vector3().lerpVectors(s0.up, s1.up, alpha).normalize();
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const radius = s0.radius + (s1.radius - s0.radius) * alpha;

    return {
      pos,
      tangent,
      up,
      right,
      radius,
      segmentIndex: alpha > 0.5 ? s1.segmentIndex : s0.segmentIndex,
      segmentName: alpha > 0.5 ? s1.segmentName : s0.segmentName,
      theme: alpha > 0.5 ? s1.theme : s0.theme,
    };
  }

  getWorldPosition(s, x, y) {
    const frame = this.getFrameAt(s);
    return frame.pos
      .clone()
      .addScaledVector(frame.right, x)
      .addScaledVector(frame.up, y);
  }

  // Check if coordinates (x, y) exceed the tunnel boundaries at distance s
  checkWallCollision(s, x, y, shipRadius = 2.0) {
    const frame = this.getFrameAt(s);
    const distFromCenter = Math.sqrt(x * x + y * y);
    const maxRadius = Math.max(3.0, frame.radius - shipRadius);

    if (distFromCenter > maxRadius) {
      // Penetration depth and normal pointing inward
      const penetration = distFromCenter - maxRadius;
      const normalX = -x / (distFromCenter || 1);
      const normalY = -y / (distFromCenter || 1);
      return {
        collided: true,
        penetration,
        normalX,
        normalY,
        maxRadius,
      };
    }

    return { collided: false };
  }
}
