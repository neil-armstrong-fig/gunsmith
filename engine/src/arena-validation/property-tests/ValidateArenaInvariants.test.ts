import fc from "fast-check";
import {anyArena} from "@gunsmith/engine/arena-validation/property-tests/arbitrary/AnyArena";
import {flatArena} from "@gunsmith/engine/arena-validation/property-tests/arbitrary/FlatArena";
import {flatRegionSizes} from "@gunsmith/engine/arena-validation/property-tests/oracle/FlatRegionSizes";
import {hasOpenNeighbour} from "@gunsmith/engine/arena-validation/property-tests/oracle/HasOpenNeighbour";
import {ARENA_TRANSFORMS} from "@gunsmith/engine/arena-symmetry/transform/ArenaTransforms";
import {transformArena} from "@gunsmith/engine/arena-symmetry/transform/TransformArena";
import {openRegionsOf} from "@gunsmith/engine/arena-validation/regions/OpenRegionsOf";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {tileKeyOf} from "@gunsmith/engine/route/TileKeyOf";
import {walkableNeighbours} from "@gunsmith/engine/route/walking/WalkableNeighbours";

/**
 * What must hold for every arena, not only the drawings someone wrote down. The unit tests (`ValidateArena.test.ts`) say what
 * one drawing is reported as; this draws random arenas, flat ones where the answer can be worked out another way and wild ones
 * with stairs and heights anywhere, and says what is true of every one. When a property fails, fast-check shrinks the arena to
 * the smallest that still breaks it and prints a seed to replay it.
 *
 * Deliberately outside `pnpm checks`, as the weapon properties are (`vitest.config.ts`): run it with `pnpm test:properties`;
 * `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("never throws, whatever it is given, and only ever names floor inside the arena", () => {
  fc.assert(
    fc.property(anyArena(), arena => {
      for (const problem of validateArena(arena)) {
        if (problem.tile) {
          const column = Math.floor(problem.tile.x);
          const row = Math.floor(problem.tile.y);

          expect(column).toBeGreaterThanOrEqual(0);
          expect(column).toBeLessThan(arena.width);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThan(arena.height);
          expect(arena.solid[row * arena.width + column]).toBe(false);
        }
      }
    }),
    {numRuns: RUNS},
  );
});

it("says there is no floor exactly when every tile is a wall, and then says nothing else", () => {
  fc.assert(
    fc.property(anyArena(), arena => {
      const problems = validateArena(arena);
      const hasFloor = arena.solid.some(solid => !solid);

      expect(problems.some(problem => problem.kind === "noFloor")).toBe(!hasFloor);
      if (!hasFloor) {
        expect(problems).toHaveLength(1);
      }
    }),
    {numRuns: RUNS},
  );
});

it("splits the floor into regions that hold every open tile once and that no step leaves", () => {
  fc.assert(
    fc.property(anyArena(), arena => {
      const regions = openRegionsOf(arena);
      const regionOfTile = new Map<string, number>();
      regions.forEach((region, number) => {
        for (const tile of region) {
          expect(regionOfTile.has(tileKeyOf(tile))).toBe(false);
          regionOfTile.set(tileKeyOf(tile), number);
        }
      });

      expect(regionOfTile.size).toBe(arena.solid.filter(solid => !solid).length);
      regions.forEach((region, number) => {
        for (const tile of region) {
          expect(arena.solid[Math.floor(tile.y) * arena.width + Math.floor(tile.x)]).toBe(false);
          for (const next of walkableNeighbours(arena, tile)) {
            expect(regionOfTile.get(tileKeyOf(next))).toBe(number);
          }
        }
      });
    }),
    {numRuns: RUNS},
  );
});

it("reports, for a flat arena, every stretch of floor but the largest, as plain adjacency counts them", () => {
  fc.assert(
    fc.property(flatArena(), arena => {
      const [, ...cutOff] = flatRegionSizes(arena);
      const problems = validateArena(arena);

      expect(problems.filter(problem => problem.kind === "noFloor")).toHaveLength(
        flatRegionSizes(arena).length === 0 ? 1 : 0,
      );
      expect(reportedSizes(problems)).toEqual(cutOff);
    }),
    {numRuns: RUNS},
  );
});

it("finds the same problems in an arena turned half way round or mirrored, since nothing can be walked to that was not", () => {
  fc.assert(
    fc.property(anyArena(), fc.constantFrom(...ARENA_TRANSFORMS), (arena, transform) => {
      const turned = transformArena(arena, transform);

      expect(kindsOf(validateArena(turned))).toEqual(kindsOf(validateArena(arena)));
      expect(regionSizesOf(turned)).toEqual(regionSizesOf(arena));
    }),
    {numRuns: RUNS},
  );
});

it("never finds more problems once a wall beside floor is opened up, since the new floor joins a region that was there", () => {
  fc.assert(
    fc.property(flatArena(), fc.nat(), (arena, choice) => {
      const index = choice % arena.solid.length;
      fc.pre(arena.solid[index] === true && hasOpenNeighbour(arena, index));
      const opened: Arena = {...arena, solid: arena.solid.map((solid, tile) => solid && tile !== index)};

      expect(validateArena(opened).length).toBeLessThanOrEqual(validateArena(arena).length);
    }),
    {numRuns: RUNS},
  );
});

function kindsOf(problems: ReturnType<typeof validateArena>): string[] {
  return problems.map(problem => problem.kind).sort();
}

function regionSizesOf(arena: Arena): number[] {
  return openRegionsOf(arena)
    .map(region => region.length)
    .sort((a, b) => b - a);
}

/** The sizes of the stretches the problems say are cut off, read from their sentences, largest first. */
function reportedSizes(problems: ReturnType<typeof validateArena>): number[] {
  return problems
    .filter(problem => problem.kind === "disconnected")
    .map(problem => Number(/^(\d+) tiles/.exec(problem.reason)?.[1]))
    .sort((a, b) => b - a);
}
