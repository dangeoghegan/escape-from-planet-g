/**
 * Level 5: The Heart of Planet G
 * Navigate to Odette's prison chamber, complete the extraction, then fly the escape route to the surface.
 */

export const level5 = {
  id: 5,
  name: 'The Heart of Planet G',
  subtitle: 'The Core Citadel & The Great Escape',
  objective: 'Reach the Core Chamber and Extract Princess Odette',
  escapeObjective: 'ESCAPE TO THE SURFACE! AVOID COLLAPSE!',
  musicTheme: 'heart_of_planet_g',
  escapeMusicTheme: 'escape_run',
  ambientColor: 0x223355,
  fogColor: 0x091424,
  fogNear: 35,
  fogFar: 280,
  skyColor: 0x050c18,
  extractionS: 820,
  extractionRadius: 9.0,
  segments: [
    {
      name: 'Citadel Conduit',
      theme: 'citadel',
      radius: 20,
      waypoints: [
        { x: 0, y: -665, z: 0, radius: 20 },
        { x: 18, y: -700, z: -180, radius: 20 },
        { x: -15, y: -740, z: -360, radius: 19 },
        { x: 0, y: -780, z: -540, radius: 19 },
      ],
    },
    {
      name: 'The Prison Chamber',
      theme: 'core_chamber',
      radius: 25, // Wide open chamber
      waypoints: [
        { x: 0, y: -780, z: -540, radius: 19 },
        { x: 10, y: -800, z: -670, radius: 23, isCheckpoint: true, checkpointId: 'l5_cp1' },
        { x: 0, y: -815, z: -820, radius: 26, isExtraction: true }, // Odette's dais & extraction zone
        { x: -10, y: -815, z: -940, radius: 23, isCheckpoint: true, checkpointId: 'l5_cp_escape' },
      ],
    },
    {
      name: 'The Magma Chimney',
      theme: 'escape_shaft',
      radius: 20,
      waypoints: [
        { x: -10, y: -815, z: -940, radius: 23 },
        { x: 15, y: -650, z: -1100, radius: 20 },
        { x: -12, y: -450, z: -1250, radius: 20 },
        { x: 20, y: -250, z: -1400, radius: 19 },
      ],
    },
    {
      name: 'Breach to Surface',
      theme: 'surface_escape',
      radius: 24,
      waypoints: [
        { x: 20, y: -250, z: -1400, radius: 19 },
        { x: -5, y: -80, z: -1550, radius: 22 },
        { x: 0, y: 40, z: -1700, radius: 26 },
        { x: 0, y: 90, z: -1850, radius: 30 }, // Exits above ground into sunlight!
      ],
    },
  ],
  hazards: [
    // Pre-chamber hazards
    { type: 'swinging', s: 240, centerX: 0, centerY: 0, amplitude: 8, frequency: 1.8, phase: 0, radius: 2.2, damage: 25 },
    { type: 'spear', s: 420, ledgeX: -14, ledgeY: 3, targetX: 6, targetY: 0, triggerDist: 110, throwDist: 65, speed: 55, damage: 20 },
    { type: 'vent', s: 580, x: -3, baseY: -10, height: 12, radius: 2.2, cycleTime: 2.8, timeOffset: 0.5, damage: 20 },

    // Post-extraction escape hazards (falling debris & collapse)
    { type: 'falling', s: 980, x: 2, startY: 14, targetY: -8, radius: 2.4, warningTime: 1.0, damage: 25 },
    { type: 'vent', s: 1120, x: 3, baseY: -10, height: 13, radius: 2.2, cycleTime: 2.6, timeOffset: 0, damage: 20 },
    { type: 'falling', s: 1250, x: -3, startY: 14, targetY: -8, radius: 2.4, warningTime: 1.0, damage: 25 },
    { type: 'swinging', s: 1380, centerX: 0, centerY: 0, amplitude: 8, frequency: 2.0, phase: Math.PI / 4, radius: 2.4, damage: 25 },
    { type: 'spear', s: 1520, ledgeX: 14, ledgeY: 2, targetX: -6, targetY: 1, triggerDist: 110, throwDist: 65, speed: 56, damage: 20 },
    { type: 'falling', s: 1650, x: 1, startY: 15, targetY: -8, radius: 2.4, warningTime: 0.9, damage: 25 },
  ],
};
