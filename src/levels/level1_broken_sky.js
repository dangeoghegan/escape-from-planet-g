/**
 * Level 1: The Broken Sky
 * Learn flight controls above the surface; pass through storm clouds, cliffs, and the first cavern entrance.
 */

export const level1 = {
  id: 1,
  name: 'The Broken Sky',
  subtitle: 'Surface Entry & Storm Canyon',
  objective: 'Fly through Storm Canyon and enter the Cavern Maw',
  musicTheme: 'broken_sky',
  ambientColor: 0x4a6572,
  fogColor: 0x232f34,
  fogNear: 40,
  fogFar: 280,
  skyColor: 0x1a2634,
  segments: [
    {
      name: 'Skyward Approach',
      theme: 'surface',
      radius: 26,
      waypoints: [
        { x: 0, y: 30, z: 0, radius: 26 },
        { x: 10, y: 25, z: -150, radius: 26 },
        { x: -15, y: 20, z: -300, radius: 25 },
        { x: 5, y: 15, z: -450, radius: 24 },
      ],
    },
    {
      name: 'Storm Ridge Canyon',
      theme: 'canyon',
      radius: 22,
      waypoints: [
        { x: 5, y: 15, z: -450, radius: 24 },
        { x: 25, y: 8, z: -600, radius: 22 },
        { x: 0, y: 2, z: -750, radius: 20, isCheckpoint: true, checkpointId: 'l1_cp1' },
        { x: -20, y: -5, z: -900, radius: 20 },
      ],
    },
    {
      name: 'Cavern Maw Descent',
      theme: 'cave_entrance',
      radius: 20,
      waypoints: [
        { x: -20, y: -5, z: -900, radius: 20 },
        { x: 0, y: -20, z: -1050, radius: 19 },
        { x: 15, y: -40, z: -1200, radius: 18 },
        { x: 0, y: -65, z: -1380, radius: 18 },
      ],
    },
  ],
  hazards: [
    // Gentle intro hazards - clear lateral evasion room
    { type: 'swinging', s: 620, centerX: 0, centerY: 3, amplitude: 6, frequency: 1.4, phase: 0, radius: 2.0, damage: 15 },
    { type: 'swinging', s: 820, centerX: 4, centerY: 1, amplitude: 7, frequency: 1.5, phase: Math.PI / 2, radius: 2.0, damage: 15 },
    { type: 'spear', s: 1080, ledgeX: 14, ledgeY: 0, targetX: -5, targetY: -15, triggerDist: 100, throwDist: 60, speed: 45, damage: 15 },
  ],
};
