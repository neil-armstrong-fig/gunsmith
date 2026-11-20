import fc from "fast-check";
import {fairStart} from "@gunsmith/engine/arena-symmetry/FairStart";
import {isPlaceToStand} from "@gunsmith/engine/arena-symmetry/spawn-pairs/IsPlaceToStand";
import {anyArena} from "@gunsmith/engine/arena-validation/property-tests/arbitrary/AnyArena";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {routeDistancesFrom} from "@gunsmith/engine/pickup/placement/RouteDistancesFrom";

/**
 * What must hold for every arena the types allow, however wild: a fair start never throws, is the same for the same seed, and when it
 * puts the two fighters down they stand on two different tiles that can be stood on, on one level, one of which the other can walk to.
 * Run with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("never throws and gives the same world for the same seed", () => {
  fc.assert(
    fc.property(anyArena(), fc.integer(), (arena, seed) => {
      expect(fairStart(arena, seed)).toEqual(fairStart(arena, seed));
    }),
    {numRuns: RUNS},
  );
});

it("puts the two fighters on different places to stand on one level, that one can walk to from the other", () => {
  fc.assert(
    fc.property(anyArena(), fc.integer(), (arena, seed) => {
      const world = fairStart(arena, seed);
      if (!world?.opponent) {
        return;
      }

      const player = indexOf(arena, world.player.position);
      const opponent = indexOf(arena, world.opponent.position);

      expect(player).not.toBe(opponent);
      expect(isPlaceToStand(arena, player)).toBe(true);
      expect(isPlaceToStand(arena, opponent)).toBe(true);
      expect(arena.levels[player]).toBe(arena.levels[opponent]);
      expect(routeDistancesFrom(arena, world.player.position).has(opponent)).toBe(true);
    }),
    {numRuns: RUNS},
  );
});

function indexOf(arena: Arena, point: Point): number {
  return Math.floor(point.y) * arena.width + Math.floor(point.x);
}
