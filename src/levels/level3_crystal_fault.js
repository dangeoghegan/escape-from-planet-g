/**
 * Level 3: The Crystal Fault
 * Fly through reflective crystal chambers, falling obstacles, and more frequent spear attacks.
 */

export const level3 = {
  id: 3,
  name: 'The Crystal Fault',
  subtitle: 'Prismatic Spires & Falling Shards',
  objective: 'Traverse Crystal Fault to the Magma Chasm',
  musicTheme: 'crystal_fault',
  ambientColor: 0x3d3066,
  fogColor: 0x16122c,
  fogNear: 35,
  fogFar: 260,
  skyColor: 0x110c22,
  segments: [
    {
      name: 'Amethyst Corridor',
      theme: 'amethyst',
      radius: 19,
      waypoints: [
        { x: 0, y: -220, z: 0, radius: 19 },
        { x: 18, y: -240, z: -170, radius: 18 },
        { x: -15, y: -260, z: -340, radius: 18 },
        { x: 5, y: -280, z: -510, radius: 17 },
      ],
    },
    {
      name: 'The Great Geode',
      theme: 'geode',
      radius: 22,
      waypoints: [
        { x: 5, y: -280, z: -510, radius: 17 },
        { x: -22, y: -300, z: -680, radius: 21 },
        { x: 0, y: -320, z: -850, radius: 22, isCheckpoint: true, checkpointId: 'l3_cp1' },
        { x: 20, y: -340, z: -1020, radius: 20 },
      ],
    },
    {
      name: 'Prismatic Rift',
      theme: 'crystal_rift',
      radius: 18,
      waypoints: [
        { x: 20, y: -340, z: -1020, radius: 20 },
        { x: -10, y: -365, z: -1200, radius: 18 },
        { x: 12, y: -390, z: -1380, radius: 17 },
        { x: 0, y: -420, z: -1560, radius: 17 },
      ],
    },
  ],
  hazards: [
    // Falling crystal stalactites with clear visual warning telegraphs
    { type: 'falling', s: 300, x: -3, startY: 13, targetY: -8, radius: 2.2, warningTime: 1.2, damage: 25 },
    { type: 'spear', s: 460, ledgeX: 13, ledgeY: 3, targetX: -5, targetY: -1, triggerDist: 110, throwDist: 65, speed: 52, damage: 20 },
    { type: 'falling', s: 620, x: 4, startY: 14, targetY: -7, radius: 2.2, warningTime: 1.2, damage: 25 },
    { type: 'spear', s: 940, ledgeX: -14, ledgeY: 4, targetX: 5, targetY: 0, triggerDist: 110, throwDist: 65, speed: 52, damage: 20 },
    { type: 'falling', s: 1100, x: -4, startY: 13, targetY: -8, radius: 2.2, warningTime: 1.2, damage: 25 },
    { type: 'spear', s: 1260, ledgeX: 12, ledgeY: -1, targetX: -6, targetY: 1, triggerDist: 110, throwDist: 65, speed: 52, damage: 20 },
    { type: 'falling', s: 1390, x: 2, startY: 14, targetY: -8, radius: 2.2, warningTime: 1.2, damage: 25 },
  ],
};
