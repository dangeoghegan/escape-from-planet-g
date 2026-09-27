/**
 * CameraSystem.js - Cockpit and Chase cameras with collision prevention in tight caves.
 */
import * as THREE from 'three';

export class CameraSystem {
  constructor(camera) {
    this.camera = camera;
    this.mode = 'chase'; // 'chase' or 'cockpit'

    // Smooth follow buffers
    this.currentPos = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    // Default chase offsets
    this.baseFollowDist = 7.5;
    this.baseHeight = 2.4;
    this.minFollowDist = 3.8; // Compressed distance in tight tunnels

    // Cockpit offset inside canopy
    this.cockpitOffset = new THREE.Vector3(0, 0.45, 0.2);
  }

  setMode(mode) {
    if (mode === 'chase' || mode === 'cockpit') {
      this.mode = mode;
    }
  }

  update(ship, route, dt, effects) {
    if (!route) return;

    const frame = route.getFrameAt(ship.s);
    const shipWorldPos = ship.worldPosition;
    const forward = frame.tangent; // Forward along travel path (towards level exit!)
    const up = frame.up;
    const right = frame.right;

    if (this.mode === 'cockpit') {
      // Cockpit View: camera positioned inside the cockpit looking forward
      const cockpitPos = shipWorldPos.clone()
        .addScaledVector(right, this.cockpitOffset.x)
        .addScaledVector(up, this.cockpitOffset.y)
        .addScaledVector(forward, -this.cockpitOffset.z);

      if (effects && effects.shakeOffset) {
        cockpitPos.add(effects.shakeOffset);
      }

      this.camera.position.copy(cockpitPos);

      // Look forward along forward route + ship steering offsets
      const lookTarget = cockpitPos.clone()
        .addScaledVector(forward, 40)
        .addScaledVector(right, ship.vx * 0.15)
        .addScaledVector(up, ship.vy * 0.15);

      this.camera.lookAt(lookTarget);
      this.camera.up.copy(up);

    } else {
      // Chase View: Camera behind and slightly above the ship, looking FORWARD
      let followDist = this.baseFollowDist;
      let height = this.baseHeight;

      // Adjust distance if corridor radius is tight
      if (frame.radius < 20) {
        const factor = Math.max(0, (20 - frame.radius) / 8);
        followDist = THREE.MathUtils.lerp(this.baseFollowDist, this.minFollowDist, factor);
        height = THREE.MathUtils.lerp(this.baseHeight, 1.8, factor);
      }

      // Camera sits BEHIND the ship along the route (s - followDist)
      const camS = Math.max(0, ship.s - followDist);
      const camFrame = route.getFrameAt(camS);

      // Target camera position
      const idealCamPos = camFrame.pos.clone()
        .addScaledVector(camFrame.right, ship.x * 0.55)
        .addScaledVector(camFrame.up, ship.y * 0.55 + height);

      // Clamp inside tunnel radius to avoid clipping
      const camCenterDist = Math.sqrt(
        Math.pow(ship.x * 0.55, 2) + Math.pow(ship.y * 0.55 + height, 2)
      );
      if (camCenterDist > camFrame.radius - 2.0) {
        const clampRatio = (camFrame.radius - 2.0) / (camCenterDist || 1);
        idealCamPos.copy(camFrame.pos)
          .addScaledVector(camFrame.right, ship.x * 0.55 * clampRatio)
          .addScaledVector(camFrame.up, (ship.y * 0.55 + height) * clampRatio);
      }

      // Smooth lerp for fluid camera feel
      if (this.currentPos.lengthSq() === 0) {
        this.currentPos.copy(idealCamPos);
      } else {
        this.currentPos.lerp(idealCamPos, Math.min(1, 16 * dt));
      }

      const finalPos = this.currentPos.clone();
      if (effects && effects.shakeOffset) {
        finalPos.add(effects.shakeOffset);
      }
      this.camera.position.copy(finalPos);

      // Look ahead of the ship along flight direction!
      const targetLookAt = shipWorldPos.clone().addScaledVector(forward, 25);
      if (this.currentLookAt.lengthSq() === 0) {
        this.currentLookAt.copy(targetLookAt);
      } else {
        this.currentLookAt.lerp(targetLookAt, Math.min(1, 18 * dt));
      }

      this.camera.lookAt(this.currentLookAt);
      this.camera.up.copy(up);
    }
  }
}
