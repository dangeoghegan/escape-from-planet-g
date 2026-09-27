import { describe, it, expect } from 'vitest';
import { Route } from '../logic/Route.js';
import { HazardManager } from '../logic/Hazards.js';
import { LEVELS } from '../levels/index.js';

describe('Level Designs and Fairness Validation', () => {
  it('defines all 5 required campaign levels', () => {
    expect(LEVELS.length).toBe(5);
    const ids = LEVELS.map(l => l.id);
    expect(ids).toEqual([1, 2, 3, 4, 5]);
  });

  LEVELS.forEach(levelCfg => {
    describe(`Level ${levelCfg.id}: ${levelCfg.name}`, () => {
      let route;
      let hazards;

      beforeAll?.(() => {
        route = new Route(levelCfg.segments);
        hazards = new HazardManager(levelCfg.hazards || []);
      }) || (route = new Route(levelCfg.segments), hazards = new HazardManager(levelCfg.hazards || []));

      it('has a continuous route with valid total length', () => {
        expect(route.totalLength).toBeGreaterThan(800);
        expect(route.exitDistance).toBeGreaterThan(700);
        expect(route.exitDistance).toBeLessThanOrEqual(route.totalLength);
      });

      it('provides reasonable safety margins through every passage', () => {
        const shipRadius = 1.8;
        // Sample corridor at every 50m
        for (let s = 0; s < route.totalLength; s += 50) {
          const frame = route.getFrameAt(s);
          expect(frame.radius).toBeGreaterThanOrEqual(14); // Min tunnel radius 14
          // Margin = tunnel radius - ship radius >= 12
          const margin = frame.radius - shipRadius;
          expect(margin).toBeGreaterThanOrEqual(12);
        }
      });

      it('contains at least one checkpoint along the route', () => {
        expect(route.checkpoints.length).toBeGreaterThanOrEqual(1);
        for (const cp of route.checkpoints) {
          expect(cp.s).toBeGreaterThan(0);
          expect(cp.s).toBeLessThan(route.exitDistance);
        }
      });

      it('places hazards with room to evade', () => {
        for (const h of hazards.hazards) {
          expect(h.s).toBeGreaterThan(0);
          expect(h.s).toBeLessThan(route.totalLength);

          if (h.type === 'swinging') {
            // Amplitude must not block the entire tunnel width
            const frame = route.getFrameAt(h.s);
            expect(h.amplitude).toBeLessThan(frame.radius * 0.7);
          }
          if (h.type === 'falling') {
            // Must have advance warning time
            expect(h.warningTime).toBeGreaterThanOrEqual(0.8);
          }
        }
      });
    });
  });
});
