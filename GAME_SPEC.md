# Escape from Planet G

## AI coding agent implementation brief

You are an AI coding agent acting as a senior JavaScript game developer, game designer, technical artist, and QA tester. Build a complete, playable browser-based 3D arcade flight game called **Escape from Planet G**.

Do not stop at a design document, static mock-up, or partly working prototype. Implement the game, run it, test it, fix defects you find, and report honestly what was and was not verified.

### 1. Project setup

- Inspect the existing repository before changing anything. Preserve useful existing code and functionality.
- If the repository is empty, create a JavaScript project using Vite and Three.js.
- Keep game logic separate from rendering, input, audio, UI, level definitions, and tests.
- Prefer original procedural geometry, materials, effects, and generated audio so the game runs without paid assets or API keys.
- Include a README with installation, run, build, controls, gameplay, and test instructions.
- Target desktop keyboard play first. Handle browser resizing and different desktop aspect ratios.
- If a requested effect cannot be delivered to a reasonable standard, implement a working simpler version and identify the limitation in your final report.

### 2. Game premise and characters

Planet G is a fictitious world whose surface opens into an interconnected network of caverns descending toward its core. Captain Flynn, the 13-year-old leader of the resistance, pilots a small spacecraft through the planet to rescue Princess Odette and escape.

- **Captain Flynn:** A brave, handsome, red-haired boy with windswept hair. Show him in original title, portrait, or cockpit artwork where practical. His cockpit hands wear flight gloves.
- **The Tallows:** Fictional alien opponents who resemble red-haired seven-year-old children and wear simple loincloth-like garments. Depict them in a stylised, non-graphic, age-appropriate manner. They set traps and throw spears tipped with fantastical unicorn-horn-shaped points. Avoid realistic injury or gore.
- **Princess Odette:** A visibly adult, regal red-haired character wearing a flowing, glowing dress. She is imprisoned in a chamber near Planet G’s core. Flynn must land or hover at the marked extraction zone to pick her up.
- Do not copy Star Wars ships, characters, logos, music, or sound effects. Make Flynn’s ship an original four-wing, rear-engine fighter with the energetic silhouette of a retro space adventure.

### 3. Core gameplay

Build an arcade flight simulator: responsive and readable rather than a full real-world aircraft simulation.

The player must be able to:

- Steer left/right and up/down through a 3D flight corridor.
- Accelerate, decelerate, and use a short-duration boost.
- Switch instantly between a cockpit view and an outside, rear chase view.
- See speed, hull integrity, boost charge, objective, and current level.
- Pause, resume, restart, and mute audio.

The ship must have weight and momentum, but controls must remain forgiving enough for narrow caverns. Use delta-time-based movement, capped speeds, and stable collision handling. Keep the ship aligned generally with the route so players can focus on navigating hazards rather than getting lost.

Define the flight route as a continuous sequence of navigable segments. Each segment should specify its shape, width, environment, hazard placements, lighting, and transition into the next segment. Surface areas must lead naturally into caves, and caves must lead toward the core. Avoid loading screens between environments within a level.

### 4. Five-level campaign

Implement all five playable levels with increasing difficulty and distinct visual identities:

1. **The Broken Sky:** Learn flight controls above the surface; pass through storm clouds, cliffs, and the first cavern entrance.
2. **The Root Caves:** Navigate tighter tunnels, hanging formations, and the first swinging traps.
3. **The Crystal Fault:** Fly through reflective crystal chambers, falling obstacles, and more frequent spear attacks.
4. **The Ember Veins:** Avoid volcanic heat, moving rockfalls, smoke, and combinations of earlier hazards.
5. **The Heart of Planet G:** Navigate the most demanding route to Odette’s prison chamber, complete the extraction, then fly the escape route to the surface.

Within each level, introduce one environment, transition into another, and finish with a clear objective or exit. Difficulty must grow through route complexity, obstacle timing, and hazard combinations—not simply by making collisions unavoidable.

The rescue happens during Level 5, not at the start of the game. Picking up Odette changes the objective to escape. Victory requires reaching the marked surface exit with hull integrity remaining. Show a distinct ending sequence and completion screen.

### 5. Hazards, damage, and failure

Implement:

- Tallow spear throws with visible wind-up, readable projectile travel, and collision detection.
- Swinging objects with predictable motion and room to evade.
- Falling rocks or other obstacles preceded by a visible or audible warning.
- Terrain and cave-wall collisions.
- Weather and environmental effects that alter visibility or flight feel without hiding essential hazards.

Show a hull-integrity life bar. Damage must be consistent and testable: a collision reduces hull integrity, gives brief visual/audio feedback, and applies a short damage cooldown to prevent one impact from draining the entire bar. At zero hull integrity, disable controls and trigger failure exactly once.

On failure, show a short cinematic crash sequence: the damaged ship loses control, trails smoke, strikes terrain or breaks apart, and produces a large, layered, fiery explosion with expanding light, particles, and sound. This is a spacecraft destruction effect only; do not depict graphic harm to characters. Then show Retry Level and Main Menu options. Provide an option to shorten or skip the crash cinematic.

### 6. Cameras and presentation

- **Cockpit view:** Display a steering column or flight yoke, two gloved hands, readable instruments, canopy framing, and the forward route. Instruments must not obscure hazards.
- **Chase view:** Place the camera behind and slightly above the ship, showing its original four-wing design, engine glow, and the route ahead.
- Camera switching must not change ship position, movement, collision shape, or level state.
- Give both views useful visibility through surface areas and tight caves. Prevent the chase camera from repeatedly clipping through cave geometry; move it closer when necessary.
- Use clear visual signposting for exits, objectives, spear trajectories, and imminent falling obstacles.
- Use original 1980s-inspired synth music and arcade-style sound effects. Include separate music and effects volume controls, plus mute. Audio should begin only after player interaction.
- Add reduced-flash and reduced-camera-shake options. Avoid rapidly flashing full-screen effects.

### 7. Interface and controls

Create a title screen with Start Game, Level Select (only unlocked levels), Controls, and Settings. During play, show a compact HUD and a pause menu.

Default keyboard controls:

| Key | Action |
| --- | --- |
| W / S | Pitch up / down |
| A / D | Steer left / right |
| Arrow keys | Alternate steering controls |
| Shift | Boost |
| Space | Brake |
| V | Switch cockpit/chase camera |
| Esc | Pause/resume |
| M | Mute/unmute |

Document the controls in-game. If key handling conflicts with browser behaviour, resolve it in the game rather than leaving broken controls. Save unlocked levels and settings locally. Offer a way to reset saved progress.

### 8. Level design and fairness

Before declaring a level complete:

- Confirm the full route can be flown from spawn to exit.
- Ensure the ship fits through every required passage with a reasonable safety margin.
- Ensure no required passage is blocked by an unavoidable projectile or timed obstacle.
- Place checkpoints at sensible transitions. Retry should restart from the latest checkpoint within the current level with a defined, consistent hull state.
- Make the extraction trigger obvious and verify it cannot fire from an unintended distance.
- Check that victory cannot occur before Odette has been picked up.

Tune the campaign so a player can learn each mechanic before hazards are combined. A level must be challenging because of decisions and timing, not because the route or camera is unclear.

### 9. Implementation sequence

Work in small, verifiable stages. After each stage, run the game and fix obvious defects before continuing.

1. Inspect the repository and write a short implementation plan.
2. Build a working flight loop with one test corridor, ship controls, both cameras, and a HUD.
3. Add terrain/cave collisions, hull damage, failure state, and restart.
4. Add route-based level data, transitions, and checkpoints.
5. Implement the five complete levels and their hazards.
6. Add Odette’s extraction, escape objective, victory sequence, and saved progress.
7. Add character presentation, procedural effects, music, sound, and settings.
8. Test the complete game, fix defects, and update the README.

Do not mark a stage complete merely because its code exists. Verify its behaviour in the running game.

### 10. Quality assurance and acceptance criteria

Provide automated tests for non-rendering logic, including:

- Movement stays within intended speed and boost limits.
- Damage cooldown prevents repeated damage from one collision.
- Hull reaching zero triggers one failure sequence.
- Checkpoints restore the intended state.
- Level unlocks progress in order.
- Odette’s extraction changes the objective.
- Victory is impossible before extraction.
- Camera switching does not alter gameplay state.

Provide browser-level tests where practical for launching the game, opening menus, switching cameras, pausing, restarting, and changing settings. Playwright is an appropriate option for browser tests.

Manually play through every level in both camera views. Test collision edges, cave entrances, moving hazards, checkpoint retries, extraction, escape, victory, mute, pause, and viewport resizing. Inspect the browser console for errors. Run the production build and all available tests.

If a full manual playthrough or browser test cannot be performed in the available environment, state exactly what you tested and what remains unverified. Do not claim “perfect gameplay” or “all tests pass” without evidence.

### 11. Final deliverables

When finished, provide:

- A concise description of the completed game.
- The files or modules added and changed.
- Exact commands to install, run, build, and test it.
- Test results and any known defects or incomplete requirements.
- Confirmation of which levels and camera views you actually played through.
