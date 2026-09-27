/**
 * SceneManager.js - Orchestrates Three.js rendering, lighting, camera, and level transitions.
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
    this.camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    this.cameraSystem = new CameraSystem(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 2. Lighting
    this.ambientLight = new THREE.AmbientLight(0x405060, 1.2);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    this.dirLight.position.set(20, 50, 30);
    this.scene.add(this.dirLight);

    // Local light following the ship
    this.shipLight = new THREE.PointLight(0x00d4ff, 1.5, 35);
    this.scene.add(this.shipLight);

    // 3. Components
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
    // Clean up previous level meshes
    if (this.corridorRenderer) this.scene.remove(this.corridorRenderer.group);
    if (this.charactersRenderer) this.scene.remove(this.charactersRenderer.group);
    if (this.hazardRenderer) this.scene.remove(this.hazardRenderer.group);
    this.effects.clear();

    // Scene Fog & Ambient styling
    const fogColor = new THREE.Color(levelConfig.fogColor || 0x111622);
    this.scene.background = fogColor;
    this.scene.fog = new THREE.Fog(
      fogColor,
      levelConfig.fogNear || 35,
      levelConfig.fogFar || 260
    );

    this.ambientLight.color.setHex(levelConfig.ambientColor || 0x445566);

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

    // Ship light follows ship
    this.shipLight.position.copy(ship.worldPosition);

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
      // Tumble ship
      ship.pitch += 4 * dt;
      ship.roll += 6 * dt;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}
