/**
 * Level 2: The Root Caves
 * Navigate bioluminescent tunnels, twisting roots, swinging traps, and Tallow ambushes.
 */

export const level2 = {
  id: 2,
  name: 'The Root Caves',
  subtitle: 'Bioluminescent Depths',
  objective: 'Navigate Root Caves and locate the Crystal Descent',
  musicTheme: 'root_caves',
  ambientColor: 0x487858,
  fogColor: 0x163022,
  fogNear: 90,
  fogFar: 480,
  skyColor: 0x0c2018,
  segments: [
    {
      name: 'Verdant Grotto Entrance',
      theme: 'root_grotto',
      radius: 23,
      waypoints: [
        { x: 0, y: -150, z: 0, radius: 23 },
        { x: -25, y: -165, z: -220, radius: 22 },
        { x: 20, y: -180, z: -450, radius: 21 },
        { x: -5, y: -195, z: -700, radius: 21 },
      ],
    },
    {
      name: 'Tangled Root Labyrinth',
      theme: 'roots',
      radius: 20,
      waypoints: [
        { x: -5, y: -195, z: -700, radius: 21 },
        { x: 30, y: -215, z: -950, radius: 20, isCheckpoint: true, checkpointId: 'l2_cp1' },
        { x: -28, y: -235, z: -1200, radius: 19 },
        { x: 10, y: -255, z: -1450, radius: 19 },
      ],
    },
    {
      name: 'Subterranean River Chasm',
      theme: 'abyss',
      radius: 21,
      waypoints: [
        { x: 10, y: -255, z: -1450, radius: 19 },
        { x: -25, y: -280, z: -1700, radius: 20, isCheckpoint: true, checkpointId: 'l2_cp2' },
        { x: 25, y: -310, z: -1950, radius: 20 },
        { x: -10, y: -340, z: -2200, radius: 19 },
      ],
    },
    {
      name: 'The Deep Roots Descent',
      theme: 'roots',
      radius: 20,
      waypoints: [
        { x: -10, y: -340, z: -2200, radius: 19 },
        { x: 15, y: -375, z: -2450, radius: 20 },
        { x: -15, y: -410, z: -2700, radius: 22 },
        { x: 0, y: -445, z: -2950, radius: 24 },
      ],
    },
  ],
  hazards: [
    // Act 1: Initial pendulums and destructible root barrier
    { type: 'swinging', s: 420, centerX: -2, centerY: 0, amplitude: 7, frequency: 1.6, phase: 0, radius: 2.4, damage: 20 },
    { type: 'barrier', s: 620, x: 3, y: 1, radius: 2.8, health: 25, damage: 20 },

    // Act 2: Tallow scouts & swinging traps
    { type: 'spear', s: 860, ledgeX: -14, ledgeY: 4, targetX: 6, targetY: -1, triggerDist: 120, throwDist: 70, speed: 50, damage: 20 },
    { type: 'swinging', s: 1100, centerX: 3, centerY: -1, amplitude: 8, frequency: 1.8, phase: Math.PI / 4, radius: 2.4, damage: 20 },
    { type: 'barrier', s: 1350, x: -4, y: 0, radius: 2.8, health: 25, damage: 20 },

    // Act 3: Multiple Tallow platforms & root chasm
    { type: 'spear', s: 1620, ledgeX: 14, ledgeY: 3, targetX: -6, targetY: 0, triggerDist: 120, throwDist: 70, speed: 52, damage: 20 },
    { type: 'swinging', s: 1880, centerX: 0, centerY: 1, amplitude: 8, frequency: 1.7, phase: Math.PI, radius: 2.4, damage: 20 },
    { type: 'barrier', s: 2150, x: 2, y: -2, radius: 3.0, health: 25, damage: 20 },
    { type: 'spear', s: 2450, ledgeX: -14, ledgeY: 2, targetX: 5, targetY: 1, triggerDist: 120, throwDist: 70, speed: 52, damage: 20 },
  ],
};
