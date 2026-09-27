/**
 * Level 4: The Ember Veins
 * Avoid volcanic heat, moving rockfalls, smoke, and combinations of earlier hazards.
 */

export const level4 = {
  id: 4,
  name: 'The Ember Veins',
  subtitle: 'Volcanic Fissures & Basalt Gates',
  objective: 'Descend Ember Veins to the Core Citadel',
  musicTheme: 'ember_veins',
  ambientColor: 0x5a2318,
  fogColor: 0x240804,
  fogNear: 30,
  fogFar: 250,
  skyColor: 0x180503,
  segments: [
    {
      name: 'Magma Flume',
      theme: 'magma',
      radius: 19,
      waypoints: [
        { x: 0, y: -420, z: 0, radius: 19 },
        { x: -16, y: -445, z: -170, radius: 18 },
        { x: 18, y: -470, z: -340, radius: 18 },
        { x: -5, y: -495, z: -510, radius: 17 },
      ],
    },
    {
      name: 'Obsidian Gates',
      theme: 'obsidian',
      radius: 20,
      waypoints: [
        { x: -5, y: -495, z: -510, radius: 17 },
        { x: 20, y: -520, z: -680, radius: 19 },
        { x: 0, y: -545, z: -850, radius: 20, isCheckpoint: true, checkpointId: 'l4_cp1' },
        { x: -20, y: -570, z: -1020, radius: 19 },
      ],
    },
    {
      name: 'Thermal Caldera',
      theme: 'caldera',
      radius: 18,
      waypoints: [
        { x: -20, y: -570, z: -1020, radius: 19 },
        { x: 12, y: -600, z: -1200, radius: 18 },
        { x: -10, y: -630, z: -1380, radius: 17 },
        { x: 0, y: -665, z: -1580, radius: 17 },
      ],
    },
  ],
  hazards: [
    { type: 'vent', s: 220, x: -3, baseY: -10, height: 12, radius: 2.2, cycleTime: 3.2, timeOffset: 0.5, damage: 20 },
    { type: 'swinging', s: 380, centerX: 2, centerY: 0, amplitude: 7, frequency: 1.8, phase: 0, radius: 2.2, damage: 25 },
    { type: 'falling', s: 520, x: 4, startY: 13, targetY: -8, radius: 2.2, warningTime: 1.2, damage: 25 },
    { type: 'vent', s: 680, x: 3, baseY: -10, height: 12, radius: 2.2, cycleTime: 3.0, timeOffset: 1.5, damage: 20 },
    { type: 'spear', s: 920, ledgeX: 13, ledgeY: 3, targetX: -6, targetY: -1, triggerDist: 110, throwDist: 65, speed: 54, damage: 20 },
    { type: 'swinging', s: 1080, centerX: -2, centerY: 1, amplitude: 7.5, frequency: 1.9, phase: Math.PI / 2, radius: 2.2, damage: 25 },
    { type: 'vent', s: 1220, x: 0, baseY: -10, height: 12, radius: 2.2, cycleTime: 3.0, timeOffset: 0, damage: 20 },
    { type: 'falling', s: 1380, x: -3, startY: 13, targetY: -8, radius: 2.2, warningTime: 1.2, damage: 25 },
    { type: 'spear', s: 1470, ledgeX: -13, ledgeY: 2, targetX: 5, targetY: 0, triggerDist: 110, throwDist: 65, speed: 54, damage: 20 },
  ],
};
