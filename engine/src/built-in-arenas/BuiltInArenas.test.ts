import {chooseStartingPlaces} from "@gunsmith/engine/arena-symmetry/ChooseStartingPlaces";
import {isHalfTurnSymmetric} from "@gunsmith/engine/arena-symmetry/IsHalfTurnSymmetric";
import {ARENA_LIMITS} from "@gunsmith/engine/arena-limits/ArenaLimits";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";

const NAMES = BUILT_IN_ARENAS.map(builtIn => builtIn.name);
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

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

it.each(NAMES)("finds %s a matching pair of starting places on every seed tried", name => {
  const arena = arenaFrom(rowsOf(name));

  for (const seed of SEEDS) {
    expect(chooseStartingPlaces(arena, seed), `seed ${seed}`).toBeDefined();
  }
});

it("holds an arena with low cover, one with raised floor and one with neither, so the choice is of different ground", () => {
  const arenas = NAMES.map(name => arenaFrom(rowsOf(name)));

  expect(arenas.some(hasLowCover)).toBe(true);
  expect(arenas.some(hasRaisedFloor)).toBe(true);
  expect(arenas.some(arena => !hasLowCover(arena) && !hasRaisedFloor(arena))).toBe(true);
});

it("holds an arena with a tower of three storeys, ground, a deck and a top, so a fighter can climb twice", () => {
  const arenas = NAMES.map(name => arenaFrom(rowsOf(name)));

  expect(arenas.some(arena => arena.levels.some(level => level >= 2))).toBe(true);
});

it("holds an arena sunk in the middle, raised floor all round and low ground inside, so the low ground is watched from every side", () => {
  const arenas = NAMES.map(name => arenaFrom(rowsOf(name)));

  expect(arenas.some(hasSunkenMiddle)).toBe(true);
});

function hasLowCover(arena: Arena): boolean {
  return arena.cover.some(isCover => isCover);
}

function hasRaisedFloor(arena: Arena): boolean {
  return arena.levels.some(level => level > 0);
}

function rowsOf(name: string): readonly string[] {
  const builtIn = BUILT_IN_ARENAS.find(candidate => candidate.name === name);
  if (!builtIn) {
    throw new Error(`No built-in arena is named ${name}.`);
  }

  return builtIn.rows;
}

/** Whether every open tile just inside the border is raised, and some open tile in from it is on the low ground and not a stair. */
function hasSunkenMiddle(arena: Arena): boolean {
  const open = tilesOf(arena).filter(tile => !arena.solid[tile.index]);
  const edge = open.filter(tile => isBesideTheBorder(arena, tile));
  const middle = open.filter(tile => !isBesideTheBorder(arena, tile));

  return (
    edge.length > 0 &&
    edge.every(tile => (arena.levels[tile.index] ?? 0) > 0) &&
    middle.some(tile => arena.levels[tile.index] === 0 && arena.stairs[tile.index] === undefined)
  );
}

function tilesOf(arena: Arena): ArenaTile[] {
  return Array.from({length: arena.width * arena.height}, (_, index) => ({
    index,
    x: index % arena.width,
    y: Math.floor(index / arena.width),
  }));
}

function isBesideTheBorder(arena: Arena, tile: ArenaTile): boolean {
  return tile.x === 1 || tile.y === 1 || tile.x === arena.width - 2 || tile.y === arena.height - 2;
}

interface ArenaTile {
  index: number;
  x: number;
  y: number;
}
