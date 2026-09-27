/**
 * Level 2: The Root Caves
 * Navigate tighter tunnels, hanging formations, and the first swinging traps.
 */

export const level2 = {
  id: 2,
  name: 'The Root Caves',
  subtitle: 'Bioluminescent Depths',
  objective: 'Navigate Root Caves and locate the Crystal Descent',
  musicTheme: 'root_caves',
  ambientColor: 0x224433,
  fogColor: 0x0c1a14,
  fogNear: 35,
  fogFar: 260,
  skyColor: 0x050d0a,
  segments: [
    {
      name: 'Verdant Grotto',
      theme: 'root_grotto',
      radius: 20,
      waypoints: [
        { x: 0, y: -65, z: 0, radius: 20 },
        { x: -18, y: -75, z: -160, radius: 19 },
        { x: 12, y: -90, z: -320, radius: 18 },
        { x: 0, y: -105, z: -480, radius: 18 },
      ],
    },
    {
      name: 'Tangled Root Nexus',
      theme: 'roots',
      radius: 17,
      waypoints: [
        { x: 0, y: -105, z: -480, radius: 18 },
        { x: 22, y: -120, z: -640, radius: 17 },
        { x: 0, y: -135, z: -800, radius: 17, isCheckpoint: true, checkpointId: 'l2_cp1' },
        { x: -20, y: -150, z: -960, radius: 16 },
      ],
    },
    {
      name: 'Bioluminescent Abyss',
      theme: 'abyss',
      radius: 18,
      waypoints: [
        { x: -20, y: -150, z: -960, radius: 16 },
        { x: 5, y: -170, z: -1120, radius: 17 },
        { x: 18, y: -195, z: -1280, radius: 18 },
        { x: 0, y: -220, z: -1450, radius: 18 },
      ],
    },
  ],
  hazards: [
    { type: 'swinging', s: 280, centerX: -2, centerY: 0, amplitude: 7, frequency: 1.6, phase: 0, radius: 2.2, damage: 20 },
    { type: 'spear', s: 420, ledgeX: -13, ledgeY: 3, targetX: 6, targetY: -2, triggerDist: 110, throwDist: 65, speed: 50, damage: 20 },
    { type: 'swinging', s: 660, centerX: 3, centerY: -1, amplitude: 8, frequency: 1.8, phase: Math.PI / 3, radius: 2.2, damage: 20 },
    { type: 'spear', s: 920, ledgeX: 13, ledgeY: 2, targetX: -6, targetY: -1, triggerDist: 110, throwDist: 65, speed: 50, damage: 20 },
    { type: 'swinging', s: 1180, centerX: 0, centerY: 1, amplitude: 7.5, frequency: 1.7, phase: Math.PI, radius: 2.2, damage: 20 },
  ],
};
