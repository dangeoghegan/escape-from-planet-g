/**
 * Level 1: The Broken Sky
 * Learn flight controls and combat above the surface; navigate canyon bends,
 * pass through rock arches, and dive into the colossal Cavern Maw.
 */

export const level1 = {
  id: 1,
  name: 'The Broken Sky',
  subtitle: 'Surface Entry & Storm Canyon',
  objective: 'Navigate Storm Canyon and dive into the Cavern Maw',
  musicTheme: 'broken_sky',
  ambientColor: 0x8aa5be,
  fogColor: 0x3b5268,
  fogNear: 100,
  fogFar: 500,
  skyColor: 0x243b52,
  segments: [
    {
      name: 'Skyward Approach',
      theme: 'surface',
      radius: 28,
      waypoints: [
        { x: 0, y: 40, z: 0, radius: 28 },
        { x: 25, y: 35, z: -200, radius: 28 },
        { x: -20, y: 28, z: -400, radius: 26 },
        { x: 10, y: 20, z: -600, radius: 26 },
      ],
    },
    {
      name: 'Thunder Ridge Chicanes',
      theme: 'canyon',
      radius: 24,
      waypoints: [
        { x: 10, y: 20, z: -600, radius: 26 },
        { x: 35, y: 12, z: -800, radius: 24, isCheckpoint: true, checkpointId: 'l1_cp1' },
        { x: -30, y: 5, z: -1050, radius: 23 },
        { x: 15, y: -5, z: -1300, radius: 23 },
      ],
    },
    {
      name: 'Mesa Gorge Slalom',
      theme: 'canyon',
      radius: 22,
      waypoints: [
        { x: 15, y: -5, z: -1300, radius: 23 },
        { x: -25, y: -18, z: -1550, radius: 22, isCheckpoint: true, checkpointId: 'l1_cp2' },
        { x: 20, y: -30, z: -1800, radius: 21 },
        { x: -10, y: -45, z: -2050, radius: 21 },
      ],
    },
    {
      name: 'The Cavern Maw Descent',
      theme: 'cave_entrance',
      radius: 22,
      waypoints: [
        { x: -10, y: -45, z: -2050, radius: 21 },
        { x: 0, y: -75, z: -2250, radius: 22 },
        { x: 10, y: -110, z: -2450, radius: 24 },
        { x: 0, y: -150, z: -2650, radius: 26 },
      ],
    },
  ],
  hazards: [
    // Act 1: Introduction to gentle traps and destructible rock barriers
    { type: 'barrier', s: 450, x: -6, y: 3, radius: 2.5, health: 25, damage: 15 },
    { type: 'swinging', s: 720, centerX: 0, centerY: 2, amplitude: 6.5, frequency: 1.4, phase: 0, radius: 2.2, damage: 15 },
    { type: 'barrier', s: 950, x: 6, y: 1, radius: 2.5, health: 25, damage: 15 },

    // Act 2: Tallow scout outpost (can be shot down for +200 PTS!)
    { type: 'spear', s: 1220, ledgeX: 15, ledgeY: 4, targetX: -4, targetY: 0, triggerDist: 120, throwDist: 70, speed: 46, damage: 15 },
    { type: 'swinging', s: 1420, centerX: -3, centerY: 0, amplitude: 7, frequency: 1.5, phase: Math.PI / 3, radius: 2.2, damage: 15 },
    { type: 'barrier', s: 1680, x: 0, y: -2, radius: 2.8, health: 25, damage: 15 },

    // Act 3: Maw approach ambush
    { type: 'spear', s: 1950, ledgeX: -15, ledgeY: 3, targetX: 5, targetY: -2, triggerDist: 120, throwDist: 70, speed: 48, damage: 15 },
    { type: 'swinging', s: 2200, centerX: 2, centerY: 0, amplitude: 7.5, frequency: 1.6, phase: Math.PI / 2, radius: 2.4, damage: 15 },
  ],
};
