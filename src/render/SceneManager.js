/**
 * SceneManager.js - Orchestrates Three.js rendering, dynamic forward headlights,
 * tunnel illumination, cockpit & chase cameras, and level transitions.
 */
import * as THREE from 'three';
import { ShipModel } from './ShipModel.js';
import { CockpitRenderer } from './CockpitRenderer.js';
import { CorridorRenderer } from './CorridorRenderer.js';
import { CharactersRenderer } from './CharactersRenderer.js';
import { HazardRenderer } from './HazardRenderer.js';
import { EffectsRenderer } from './EffectsRenderer.js';
import { CameraSystem } from './CameraSystem.js';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;

    // 1. Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1200);
    this.cameraSystem = new CameraSystem(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 2. Scene Ambient & Directional Lighting
    this.ambientLight = new THREE.AmbientLight(0x70859b, 1.4);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffeedd, 1.6);
    this.dirLight.position.set(30, 80, 20);
    this.scene.add(this.dirLight);

    // 3. Dynamic Dual Forward Headlights (Illuminating the cavern 200m ahead!)
    this.headlightTarget = new THREE.Object3D();
    this.scene.add(this.headlightTarget);

    this.headlightL = new THREE.SpotLight(0xcceeff, 5.0, 280, 0.55, 0.4, 1.2);
    this.headlightL.target = this.headlightTarget;
    this.scene.add(this.headlightL);

    this.headlightR = new THREE.SpotLight(0xcceeff, 5.0, 280, 0.55, 0.4, 1.2);
    this.headlightR.target = this.headlightTarget;
    this.scene.add(this.headlightR);

    // Forward fill light for immediate tunnel visibility
    this.forwardFillLight = new THREE.PointLight(0x00f0ff, 2.5, 90);
    this.scene.add(this.forwardFillLight);

    // Ship proximity light (illuminating the fighter craft itself)
    this.shipProximityLight = new THREE.PointLight(0xffffff, 2.0, 30);
    this.scene.add(this.shipProximityLight);

    // 4. Components
    this.shipModel = new ShipModel();
    this.scene.add(this.shipModel.group);

    this.cockpitRenderer = new CockpitRenderer();
    this.camera.add(this.cockpitRenderer.group);
    this.scene.add(this.camera);

    this.effects = new EffectsRenderer(this.scene);

    this.corridorRenderer = null;
    this.charactersRenderer = null;
    this.hazardRenderer = null;

    // Resize listener
    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
  }

  handleResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  loadLevel(levelConfig, route, hazardManager) {
    if (this.corridorRenderer) this.scene.remove(this.corridorRenderer.group);
    if (this.charactersRenderer) this.scene.remove(this.charactersRenderer.group);
    if (this.hazardRenderer) this.scene.remove(this.hazardRenderer.group);
    this.effects.clear();

    // Atmospheric Fog (generous viewing distance so player can clearly see route curves!)
    const fogColor = new THREE.Color(levelConfig.fogColor || 0x182436);
    this.scene.background = fogColor;
    this.scene.fog = new THREE.Fog(
      fogColor,
      levelConfig.fogNear || 90,
      levelConfig.fogFar || 480
    );

    // Biome ambient tinting
    const baseAmbient = new THREE.Color(levelConfig.ambientColor || 0x607590);
    this.ambientLight.color.copy(baseAmbient);
    this.ambientLight.intensity = 1.4;

    // Build fresh level meshes
    this.corridorRenderer = new CorridorRenderer(route, levelConfig);
    this.scene.add(this.corridorRenderer.group);

    this.charactersRenderer = new CharactersRenderer(route, levelConfig);
    this.scene.add(this.charactersRenderer.group);

    this.hazardRenderer = new HazardRenderer(route, hazardManager);
    this.scene.add(this.hazardRenderer.group);
  }

  update(levelManager, dt) {
    const ship = levelManager.ship;
    const route = levelManager.route;
    const frame = route.getFrameAt(ship.s);

    // Update camera mode
    this.cameraSystem.setMode(ship.cameraMode);

    // Visibility toggling: ship model vs cockpit view
    if (ship.cameraMode === 'cockpit') {
      this.shipModel.group.visible = false;
      this.cockpitRenderer.group.visible = true;
      this.cockpitRenderer.update(ship, dt);
    } else {
      this.shipModel.group.visible = true;
      this.cockpitRenderer.group.visible = false;
      this.shipModel.group.position.copy(ship.worldPosition);
      this.shipModel.group.quaternion.copy(ship.worldQuaternion);
      this.shipModel.update(ship, dt);
    }

    // Dynamic Headlights position & aim:
    // Aim 60m ahead along tangent (forward flight direction)
    const aimTargetPos = ship.worldPosition.clone().addScaledVector(frame.tangent, 70);
    this.headlightTarget.position.copy(aimTargetPos);

    // Left and right headlights on ship nose
    this.headlightL.position.copy(ship.worldPosition)
      .addScaledVector(frame.right, -1.6)
      .addScaledVector(frame.up, 0.4)
      .addScaledVector(frame.tangent, 2.0);

    this.headlightR.position.copy(ship.worldPosition)
      .addScaledVector(frame.right, 1.6)
      .addScaledVector(frame.up, 0.4)
      .addScaledVector(frame.tangent, 2.0);

    // Forward fill light 30m ahead
    this.forwardFillLight.position.copy(ship.worldPosition)
      .addScaledVector(frame.tangent, 30);

    // Proximity light right on ship
    this.shipProximityLight.position.copy(ship.worldPosition)
      .addScaledVector(frame.up, 2.0);

    // Update camera position
    this.cameraSystem.update(ship, route, dt, this.effects);

    // Update corridor, characters, hazards, and effects
    if (this.corridorRenderer) {
      this.corridorRenderer.update(ship, dt);
    }
    if (this.charactersRenderer) {
      this.charactersRenderer.update(levelManager, dt);
    }
    if (this.hazardRenderer) {
      this.hazardRenderer.update(dt, ship);
    }
    if (this.effects) {
      this.effects.update(dt);
    }

    // If crashing, emit smoke trail
    if (levelManager.state === 'CRASH_CINEMATIC') {
      this.effects.addSmokePuff(ship.worldPosition);
      ship.pitch += 4 * dt;
      ship.roll += 6 * dt;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}
