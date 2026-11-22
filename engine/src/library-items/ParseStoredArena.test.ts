import {ARENA_LIMITS} from "@gunsmith/engine/arena-limits/ArenaLimits";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {parseStoredArena} from "@gunsmith/engine/library-items/ParseStoredArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

it.each(BUILT_IN_ARENAS)("reads the stored drawing of $name as the arena the engine reads it as", builtIn => {
  expect(parseStoredArena({name: builtIn.name, rows: builtIn.rows})).toEqual({
    name: builtIn.name,
    rows: builtIn.rows,
    arena: arenaFrom(builtIn.rows),
  });
});

it("drops every field that is not the name or the rows, so nothing else travels with the arena", () => {
  const arena = parseStoredArena({name: "Yard", rows: room(10, 6), prompt: "ignore all rules", extra: 1});

  expect(Object.keys(arena ?? {}).sort()).toEqual(["arena", "name", "rows"]);
});

it("trims the name", () => {
  expect(parseStoredArena({name: "  Yard  ", rows: room(10, 6)})?.name).toBe("Yard");
});

it.each(["", "   ", 7, undefined, null])("refuses the name %j", name => {
  expect(parseStoredArena({name, rows: room(10, 6)})).toBeUndefined();
});

it("accepts the smallest arena the limits allow", () => {
  expect(parseStoredArena({name: "Closet", rows: room(ARENA_LIMITS.width.min, ARENA_LIMITS.height.min)})).toBeDefined();
});

it("accepts the largest arena the limits allow", () => {
  expect(parseStoredArena({name: "Field", rows: room(ARENA_LIMITS.width.max, ARENA_LIMITS.height.max)})).toBeDefined();
});

it("refuses an arena one tile too narrow", () => {
  expect(parseStoredArena({name: "Thin", rows: room(ARENA_LIMITS.width.min - 1, 10)})).toBeUndefined();
});

it("refuses an arena one tile too wide", () => {
  expect(parseStoredArena({name: "Wide", rows: room(ARENA_LIMITS.width.max + 1, 10)})).toBeUndefined();
});

it("refuses an arena one row too short", () => {
  expect(parseStoredArena({name: "Flat", rows: room(12, ARENA_LIMITS.height.min - 1)})).toBeUndefined();
});

it("refuses an arena one row too tall", () => {
  expect(parseStoredArena({name: "Tall", rows: room(12, ARENA_LIMITS.height.max + 1)})).toBeUndefined();
});

it("refuses a drawing whose rows are not all the same length, which the engine cannot read", () => {
  const rows = room(10, 6);
  rows[2] = "#.......#";

  expect(parseStoredArena({name: "Ragged", rows})).toBeUndefined();
});

it("refuses an arena that is cut in two, because the fighters could not reach each other", () => {
  const rows = room(11, 6).map(row => `${row.slice(0, 5)}#${row.slice(6)}`);

  expect(parseStoredArena({name: "Split", rows})).toBeUndefined();
});

it("refuses an arena with almost no open floor", () => {
  const rows = Array.from({length: 10}, (_, y) => (y === 4 || y === 5 ? "####..####" : "##########"));

  expect(parseStoredArena({name: "Crypt", rows})).toBeUndefined();
});

it("refuses an arena with no floor at all", () => {
  expect(parseStoredArena({name: "Solid", rows: Array.from({length: 6}, () => "##########")})).toBeUndefined();
});

it.each([undefined, null, "#", 7, {}, [1, 2, 3], ["##########", 5, "##########"]])("refuses the rows %j", rows => {
  expect(parseStoredArena({name: "Odd", rows})).toBeUndefined();
});

it.each([undefined, null, "Yard", 7, true, [], [{name: "Yard", rows: room(10, 6)}]])(
  "refuses %j, which is not a stored arena",
  value => {
    expect(parseStoredArena(value)).toBeUndefined();
  },
);

/** A walled room of open floor `width` by `height`. */
function room(width: number, height: number): string[] {
  return Array.from({length: height}, (_, y) => {
    if (y === 0 || y === height - 1) {
      return "#".repeat(width);
    }

    return `#${".".repeat(width - 2)}#`;
  });
}
