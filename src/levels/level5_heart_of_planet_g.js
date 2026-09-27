/**
 * Level 5: The Heart of Planet G
 * Navigate the Core Citadel, rescue Princess Odette from the Prison Chamber,
 * and fly the desperate escape route up a collapsing magma chimney to the surface!
 */

export const level5 = {
  id: 5,
  name: 'The Heart of Planet G',
  subtitle: 'The Core Citadel & The Great Escape',
  objective: 'Reach the Core Chamber and Extract Princess Odette',
  escapeObjective: 'ESCAPE TO THE SURFACE! AVOID COLLAPSE!',
  musicTheme: 'heart_of_planet_g',
  escapeMusicTheme: 'escape_run',
  ambientColor: 0x4a729e,
  fogColor: 0x142236,
  fogNear: 90,
  fogFar: 500,
  skyColor: 0x0c182a,
  extractionS: 1050,
  extractionRadius: 10.0,
  segments: [
    {
      name: 'Citadel Conduit Approach',
      theme: 'citadel',
      radius: 23,
      waypoints: [
        { x: 0, y: -1295, z: 0, radius: 23 },
        { x: 25, y: -1330, z: -250, radius: 23 },
        { x: -25, y: -1370, z: -500, radius: 22 },
        { x: 10, y: -1410, z: -750, radius: 22, isCheckpoint: true, checkpointId: 'l5_cp1' },
      ],
    },
    {
      name: 'The Prison Chamber',
      theme: 'core_chamber',
      radius: 28, // Grand open chamber
      waypoints: [
        { x: 10, y: -1410, z: -750, radius: 22 },
        { x: 0, y: -1440, z: -920, radius: 26 },
        { x: 0, y: -1455, z: -1050, radius: 30, isExtraction: true }, // Odette's dais & extraction zone
        { x: -10, y: -1455, z: -1180, radius: 26, isCheckpoint: true, checkpointId: 'l5_cp_escape' },
      ],
    },
    {
      name: 'The Magma Chimney',
      theme: 'escape_shaft',
      radius: 22,
      waypoints: [
        { x: -10, y: -1455, z: -1180, radius: 26 },
        { x: 25, y: -1200, z: -1450, radius: 22 },
        { x: -25, y: -900, z: -1700, radius: 21 },
        { x: 20, y: -600, z: -1950, radius: 21 },
        { x: -15, y: -300, z: -2200, radius: 22 },
      ],
    },
    {
      name: 'Breach to Surface',
      theme: 'surface_escape',
      radius: 26,
      waypoints: [
        { x: -15, y: -300, z: -2200, radius: 22 },
        { x: 10, y: -50, z: -2450, radius: 24 },
        { x: -5, y: 60, z: -2700, radius: 28 },
        { x: 0, y: 140, z: -2980, radius: 32 }, // Soaring out into daylight!
      ],
    },
  ],
  hazards: [
    // Pre-chamber hazards
    { type: 'barrier', s: 350, x: -3, y: 1, radius: 3.0, health: 30, damage: 20 },
    { type: 'swinging', s: 520, centerX: 0, centerY: 0, amplitude: 8, frequency: 1.8, phase: 0, radius: 2.5, damage: 25 },
    { type: 'spear', s: 720, ledgeX: -15, ledgeY: 4, targetX: 6, targetY: 0, triggerDist: 120, throwDist: 70, speed: 56, damage: 20 },
    { type: 'vent', s: 880, x: -3, baseY: -10, height: 13, radius: 2.4, cycleTime: 2.8, timeOffset: 0.5, damage: 20 },

    // Post-extraction escape hazards (collapsing magma shaft)
    { type: 'falling', s: 1280, x: 2, startY: 15, targetY: -8, radius: 2.5, warningTime: 1.0, damage: 25 },
    { type: 'vent', s: 1480, x: 3, baseY: -10, height: 14, radius: 2.4, cycleTime: 2.6, timeOffset: 0, damage: 20 },
    { type: 'barrier', s: 1680, x: -3, y: 0, radius: 3.0, health: 30, damage: 20 },
    { type: 'falling', s: 1880, x: -3, startY: 15, targetY: -8, radius: 2.5, warningTime: 1.0, damage: 25 },
    { type: 'swinging', s: 2080, centerX: 0, centerY: 0, amplitude: 8.5, frequency: 2.0, phase: Math.PI / 4, radius: 2.5, damage: 25 },
    { type: 'spear', s: 2320, ledgeX: 15, ledgeY: 3, targetX: -6, targetY: 1, triggerDist: 120, throwDist: 70, speed: 58, damage: 20 },
    { type: 'falling', s: 2560, x: 2, startY: 15, targetY: -8, radius: 2.5, warningTime: 0.9, damage: 25 },
    { type: 'vent', s: 2780, x: -2, baseY: -10, height: 14, radius: 2.5, cycleTime: 2.4, timeOffset: 0.5, damage: 20 },
  ],
};
