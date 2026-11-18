import {isHalfTurnSymmetric} from "@gunsmith/engine/arena-symmetry/IsHalfTurnSymmetric";
import {ARENA_LIMITS} from "@gunsmith/engine/arena-limits/ArenaLimits";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";

const NAMES = BUILT_IN_ARENAS.map(builtIn => builtIn.name);

it("has at least one arena, because ai falls back to the pool and a pool of none gives it nothing", () => {
  expect(BUILT_IN_ARENAS.length).toBeGreaterThan(0);
});

it("gives each arena a name of its own, because a player picks one by name", () => {
  expect(new Set(NAMES).size).toBe(NAMES.length);
});

it.each(NAMES)("reads %s as an arena", name => {
  expect(() => arenaFrom(rowsOf(name))).not.toThrow();
});

it.each(NAMES)("finds nothing wrong with %s", name => {
  expect(validateArena(arenaFrom(rowsOf(name)))).toEqual([]);
});

it.each(NAMES)("keeps %s within the arena limits, on both sides", name => {
  const {width, height} = arenaFrom(rowsOf(name));

  expect(width).toBeGreaterThanOrEqual(ARENA_LIMITS.width.min);
  expect(width).toBeLessThanOrEqual(ARENA_LIMITS.width.max);
  expect(height).toBeGreaterThanOrEqual(ARENA_LIMITS.height.min);
  expect(height).toBeLessThanOrEqual(ARENA_LIMITS.height.max);
});

it.each(NAMES)(
  "draws %s the same picture turned half way round, so the fighters can start on matching ground",
  name => {
    expect(isHalfTurnSymmetric(arenaFrom(rowsOf(name)))).toBe(true);
  },
);

function rowsOf(name: string): readonly string[] {
  const builtIn = BUILT_IN_ARENAS.find(candidate => candidate.name === name);
  if (!builtIn) {
    throw new Error(`No built-in arena is named ${name}.`);
  }

  return builtIn.rows;
}
