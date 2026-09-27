import { level1 } from './level1_broken_sky.js';
import { level2 } from './level2_root_caves.js';
import { level3 } from './level3_crystal_fault.js';
import { level4 } from './level4_ember_veins.js';
import { level5 } from './level5_heart_of_planet_g.js';

export const LEVELS = [level1, level2, level3, level4, level5];

export function getLevelById(id) {
  return LEVELS.find(l => l.id === Number(id)) || LEVELS[0];
}
