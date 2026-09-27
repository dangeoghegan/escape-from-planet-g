/**
 * Level 3: The Crystal Fault
 * Fly through gleaming crystal geodes, dodge telegraphed falling stalactites,
 * blast crystal barriers, and engage Tallow spear snipers.
 */

export const level3 = {
  id: 3,
  name: 'The Crystal Fault',
  subtitle: 'Prismatic Spires & Falling Shards',
  objective: 'Traverse Crystal Fault to the Magma Chasm',
  musicTheme: 'crystal_fault',
  ambientColor: 0x6e528e,
  fogColor: 0x2c1e42,
  fogNear: 90,
  fogFar: 480,
  skyColor: 0x1e1230,
  segments: [
    {
      name: 'Amethyst Corridor',
      theme: 'amethyst',
      radius: 22,
      waypoints: [
        { x: 0, y: -445, z: 0, radius: 22 },
        { x: 25, y: -470, z: -220, radius: 21 },
        { x: -22, y: -495, z: -460, radius: 20 },
        { x: 10, y: -520, z: -700, radius: 20 },
      ],
    },
    {
      name: 'The Great Geode Chasm',
      theme: 'geode',
      radius: 24,
      waypoints: [
        { x: 10, y: -520, z: -700, radius: 20 },
        { x: -30, y: -550, z: -950, radius: 23, isCheckpoint: true, checkpointId: 'l3_cp1' },
        { x: 25, y: -580, z: -1200, radius: 24 },
        { x: -10, y: -610, z: -1450, radius: 22 },
      ],
    },
    {
      name: 'Prismatic Fault Slalom',
      theme: 'crystal_rift',
      radius: 20,
      waypoints: [
        { x: -10, y: -610, z: -1450, radius: 22 },
        { x: 25, y: -645, z: -1700, radius: 20, isCheckpoint: true, checkpointId: 'l3_cp2' },
        { x: -25, y: -680, z: -1950, radius: 20 },
        { x: 15, y: -715, z: -2200, radius: 19 },
      ],
    },
    {
      name: 'The Prismatic Siphon',
      theme: 'amethyst',
      radius: 21,
      waypoints: [
        { x: 15, y: -715, z: -2200, radius: 19 },
        { x: -15, y: -755, z: -2450, radius: 20 },
        { x: 10, y: -795, z: -2700, radius: 22 },
        { x: 0, y: -840, z: -2980, radius: 25 },
      ],
    },
  ],
  hazards: [
    // Act 1: Initial crystal barriers & falling stalactites
    { type: 'falling', s: 450, x: -3, startY: 15, targetY: -8, radius: 2.4, warningTime: 1.2, damage: 25 },
    { type: 'barrier', s: 650, x: 4, y: 1, radius: 3.0, health: 25, damage: 20 },

    // Act 2: Tallow snipers & geode hazards
    { type: 'spear', s: 880, ledgeX: 14, ledgeY: 3, targetX: -5, targetY: -1, triggerDist: 120, throwDist: 70, speed: 52, damage: 20 },
    { type: 'falling', s: 1120, x: 4, startY: 15, targetY: -8, radius: 2.4, warningTime: 1.2, damage: 25 },
    { type: 'barrier', s: 1380, x: -3, y: -1, radius: 2.8, health: 25, damage: 20 },

    // Act 3: Combined gauntlet
    { type: 'spear', s: 1650, ledgeX: -14, ledgeY: 4, targetX: 6, targetY: 0, triggerDist: 120, throwDist: 70, speed: 54, damage: 20 },
    { type: 'falling', s: 1880, x: -4, startY: 15, targetY: -8, radius: 2.4, warningTime: 1.1, damage: 25 },
    { type: 'barrier', s: 2120, x: 3, y: 2, radius: 3.0, health: 25, damage: 20 },
    { type: 'spear', s: 2380, ledgeX: 14, ledgeY: -1, targetX: -6, targetY: 1, triggerDist: 120, throwDist: 70, speed: 54, damage: 20 },
    { type: 'falling', s: 2650, x: 1, startY: 15, targetY: -8, radius: 2.4, warningTime: 1.1, damage: 25 },
  ],
};
