# Escape from Planet G

**Escape from Planet G** is a fast-paced, browser-based 3D arcade flight game built with JavaScript, Vite, and Three.js.

Pilot Captain Flynn—the 13-year-old leader of the planetary resistance—in an original four-wing fighter spacecraft through subterranean canyons, ancient root caverns, refractive crystal faults, and volcanic ember veins to the core of Planet G. Land or hover at the extraction zone to rescue Princess Odette, then punch thrusters through a collapsing magma chimney back to the surface!

---

## Features

- **Arcade Flight Mechanics:** Responsive, fluid 3D corridor steering (W/A/S/D or Arrow keys), dynamic banking, rocket boost (Shift), airbrakes / hover thruster (Space), and delta-time physics.
- **Dual Dynamic Cameras:** Switch seamlessly between Cockpit View (animated flight yoke, Flynn's leather flight-gloved hands, readable flight instruments, unobstructed canopy) and Chase View (behind the four-wing fighter with intelligent tunnel-collision avoidance) using the `V` key.
- **5-Level Subterranean Campaign:**
  1. *The Broken Sky:* High-altitude storm canyon and entry through the colossal Cavern Maw.
  2. *The Root Caves:* Bioluminescent caverns with swinging root pendulums and initial Tallow scouts.
  3. *The Crystal Fault:* Prismatic geodes, telegraphed falling crystal stalactites, and spear ambushes.
  4. *The Ember Veins:* Volcanic thermal vents, moving basalt columns, and hazardous smoke.
  5. *The Heart of Planet G:* Descent to the Core Citadel, extraction of Princess Odette in the Prison Chamber, and frantic surface escape run.
- **Original Procedural Characters & Hazards:**
  - *Captain Flynn:* Brave 13-year-old resistance pilot shown in original illustrated portraits and cockpit gloved flight yoke.
  - *The Tallows:* Stylized child-like alien scouts throwing fantastical unicorn-horn-tipped spears with visible windup and readable trajectories.
  - *Princess Odette:* Regal adult red-haired princess in a luminous glowing gown imprisoned near the planet's core.
  - *Telegraphed Hazards:* Ground warning rings and audio cues for falling rocks and erupting vents; predictable harmonic oscillation for swinging traps.
- **1980s Retro Synth Soundtrack & Arcade SFX:**
  - 100% procedural Web Audio API synthesis (zero external audio files or API keys required).
  - Multi-track synthwave soundtrack with driving basslines, arpeggios, and heroic leads customized for each level and the escape run.
  - Dynamic pitch-modulated engine hum, boost roar, airbrake hiss, weapon whooshes, warning alarms, and layered destruction explosions.
  - Separate Music and SFX volume sliders, mute toggle (`M`), and browser autoplay policy compliance (starts upon user gesture).
- **Accessibility & Settings:**
  - Reduced flash mode
  - Reduced camera shake mode
  - Skip crash cinematic option
  - Invert pitch toggle
  - Saved progress and settings persistence via LocalStorage (with progress reset option).

---

## Controls

| Key | Action | Description |
| --- | --- | --- |
| **W / S** | Pitch Up / Down | Control vertical climb and dive *(inversion toggle available)* |
| **A / D** | Steer Left / Right | Bank and steer laterally through cavern cross-sections |
| **Arrow Keys** | Alternate Steering | Directional flight steering |
| **Shift** | Boost | High-speed rocket burst (consumes boost gauge) |
| **Space** | Brake / Hover | Decelerate; hover inside extraction zone in Level 5 |
| **V** | Toggle Camera | Instant switch between Cockpit View and Chase View |
| **Esc** | Pause / Resume | Toggle pause menu |
| **M** | Mute / Unmute | Toggle all sound effects and music |

---

## Installation & Running

### Requirements
- Node.js 18+ (tested on Node.js v22)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The game will be available at `http://localhost:5173/` (or proxied preview URL).

### 3. Production Build
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

### 4. Preview Production Build
```bash
npm run preview
```

---

## Testing & Quality Assurance

Automated unit, integration, and playthrough tests are provided using **Vitest**:

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Verified Test Suites:
1. `ship_movement.test.js`: Verifies flight speeds remain within normal cruise, boost, and brake bounds.
2. `damage_cooldown.test.js`: Verifies 0.8s invulnerability cooldown prevents rapid successive damage draining the entire hull bar.
3. `hull_failure.test.js`: Verifies reaching zero hull disables flight controls and triggers the failure sequence exactly once.
4. `checkpoints.test.js`: Verifies checkpoint passage and state restoration (hull restored to 100%, position centered).
5. `level_unlocks.test.js`: Verifies sequential unlocking of campaign levels (1 through 5) and LocalStorage persistence.
6. `extraction.test.js`: Verifies Level 5 hovering extraction mechanics and objective transition to escape.
7. `victory.test.js`: Verifies that Level 5 victory is impossible before Odette is extracted, and triggers when reaching surface exit with hull intact.
8. `camera_switching.test.js`: Verifies camera mode toggles between Cockpit and Chase without changing position, velocity, hull, or level state.
9. `route_and_levels.test.js`: Validates all 5 level route continuous splines, minimum passage radii (>= 14 units vs 1.8 unit ship), and hazard evasion margins.
10. `ui_interactions.test.js`: Tests menus, level select, controls modal, settings checkboxes/sliders, and HUD state bindings.
11. `campaign_playthrough.test.js`: Full simulation of all 5 campaign levels from spawn to exit, including mid-level checkpoint retry and Level 5 extraction.

---

## Project Structure

```
escape-from-planet-g/
├── index.html                     # Main HTML shell
├── package.json                   # Scripts and dependencies
├── vite.config.js                 # Vite bundler & test configuration
├── README.md                      # Documentation
├── GAME_SPEC.md                   # Full design brief & specification
└── src/
    ├── main.js                    # Entry point & game loop
    ├── logic/
    │   ├── Ship.js                # Flight physics, boost, hull, invulnerability
    │   ├── Route.js               # 3D spline corridor, Frenet frames, wall collisions
    │   ├── Hazards.js             # Spears, swinging pendulums, falling rocks, vents
    │   ├── LevelManager.js        # State machine, checkpoints, extraction, victory
    │   └── Storage.js             # LocalStorage settings and unlocked level persistence
    ├── levels/
    │   ├── level1_broken_sky.js   # Level 1 configuration
    │   ├── level2_root_caves.js   # Level 2 configuration
    │   ├── level3_crystal_fault.js# Level 3 configuration
    │   ├── level4_ember_veins.js  # Level 4 configuration
    │   ├── level5_heart_of_planet_g.js # Level 5 configuration (extraction & escape)
    │   └── index.js               # Level registry & lookup
    ├── render/
    │   ├── SceneManager.js        # Three.js scene, lighting, resize management
    │   ├── ShipModel.js           # 4-wing fighter, engine glow, thruster plume
    │   ├── CockpitRenderer.js     # Flight yoke, gloved hands, instruments, canopy
    │   ├── CorridorRenderer.js    # Procedural 3D tunnel geometry & biome props
    │   ├── CharactersRenderer.js  # Princess Odette & Tallow alien 3D models
    │   ├── HazardRenderer.js      # Spears, traps, warning rings, flame vents
    │   ├── EffectsRenderer.js     # Fiery explosions, smoke trails, screen shake
    │   └── CameraSystem.js        # Cockpit/Chase cameras with cave wall clearance
    ├── audio/
    │   ├── SoundSynth.js          # Web Audio procedural arcade sound effects
    │   └── MusicSynth.js          # Web Audio procedural 1980s synthwave music
    ├── ui/
    │   ├── HUD.js                 # In-flight HUD gauges, reticle, radio comms
    │   ├── MenuManager.js         # Title, Level Select, Pause, Victory, Settings
    │   ├── Portraits.js           # Original SVG character portraits (Flynn, Odette, Tallow)
    │   └── styles.css             # Arcade styling, typography, animations
    └── tests/                     # 12 Vitest test suites (59 unit & integration tests)
```

---

## Technical Art & Audio Notes

- **Procedural Geometry:** All 3D meshes (spacecraft, cockpit interior, caverns, crystals, roots, basalt columns, characters, and hazards) are generated procedurally using Three.js standard primitives and custom buffer geometries.
- **Audio Synthesis:** All sound effects and 6 original synthwave musical compositions are generated at runtime via Web Audio API oscillators, biquad filters, and noise buffers.
- **Accessibility:** Reduced-flash replaces full-screen flashes with gentle orange perimeter vignettes; reduced-shake disables camera tremors.
