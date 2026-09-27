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
  ambientColor: 0x9e4834,
  fogColor: 0x3e140c,
  fogNear: 80,
  fogFar: 460,
  skyColor: 0x2a0a06,
  segments: [
    {
      name: 'Obsidian Fissure',
      theme: 'magma',
      radius: 22,
      waypoints: [
        { x: 0, y: -840, z: 0, radius: 22 },
        { x: -25, y: -870, z: -240, radius: 21 },
        { x: 25, y: -900, z: -480, radius: 20 },
        { x: -10, y: -930, z: -720, radius: 20 },
      ],
    },
    {
      name: 'Basalt Gate Gauntlet',
      theme: 'obsidian',
      radius: 21,
      waypoints: [
        { x: -10, y: -930, z: -720, radius: 20 },
        { x: 30, y: -965, z: -980, radius: 21, isCheckpoint: true, checkpointId: 'l4_cp1' },
        { x: -28, y: -1000, z: -1240, radius: 20 },
        { x: 12, y: -1035, z: -1500, radius: 20 },
      ],
    },
    {
      name: 'Magma Flume Chicanes',
      theme: 'caldera',
      radius: 20,
      waypoints: [
        { x: 12, y: -1035, z: -1500, radius: 20 },
        { x: -25, y: -1075, z: -1760, radius: 20, isCheckpoint: true, checkpointId: 'l4_cp2' },
        { x: 25, y: -1115, z: -2020, radius: 19 },
        { x: -12, y: -1155, z: -2280, radius: 19 },
      ],
    },
    {
      name: 'The Molten Caldera Breach',
      theme: 'magma',
      radius: 23,
      waypoints: [
        { x: -12, y: -1155, z: -2280, radius: 19 },
        { x: 18, y: -1200, z: -2540, radius: 22 },
        { x: -15, y: -1245, z: -2800, radius: 24 },
        { x: 0, y: -1295, z: -3080, radius: 27 },
      ],
    },
  ],
  hazards: [
    // Act 1: Initial vents & basalt barriers
    { type: 'vent', s: 420, x: -3, baseY: -10, height: 13, radius: 2.4, cycleTime: 3.2, timeOffset: 0.5, damage: 20 },
    { type: 'barrier', s: 650, x: 3, y: 1, radius: 3.0, health: 30, damage: 20 },

    // Act 2: Vents, swinging basalt, Tallows
    { type: 'swinging', s: 880, centerX: 2, centerY: 0, amplitude: 7.5, frequency: 1.8, phase: 0, radius: 2.4, damage: 25 },
    { type: 'vent', s: 1100, x: 3, baseY: -10, height: 13, radius: 2.4, cycleTime: 3.0, timeOffset: 1.2, damage: 20 },
    { type: 'spear', s: 1320, ledgeX: 14, ledgeY: 4, targetX: -6, targetY: -1, triggerDist: 120, throwDist: 70, speed: 54, damage: 20 },
    { type: 'barrier', s: 1550, x: -4, y: 0, radius: 3.0, health: 30, damage: 20 },

    // Act 3: Combined gauntlet
    { type: 'vent', s: 1820, x: -2, baseY: -10, height: 13, radius: 2.4, cycleTime: 2.8, timeOffset: 0, damage: 20 },
    { type: 'swinging', s: 2050, centerX: -2, centerY: 1, amplitude: 8, frequency: 1.9, phase: Math.PI / 2, radius: 2.5, damage: 25 },
    { type: 'spear', s: 2280, ledgeX: -14, ledgeY: 3, targetX: 6, targetY: 0, triggerDist: 120, throwDist: 70, speed: 56, damage: 20 },
    { type: 'falling', s: 2520, x: 2, startY: 15, targetY: -8, radius: 2.5, warningTime: 1.1, damage: 25 },
    { type: 'vent', s: 2750, x: 1, baseY: -10, height: 14, radius: 2.5, cycleTime: 2.6, timeOffset: 0.8, damage: 20 },
  ],
};
