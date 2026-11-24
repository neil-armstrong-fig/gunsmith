import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ArenaFormat";
import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";

const ROWS = ["##########", "#........#", "#........#", "#........#", "##########"];

it("accepts a walled room and hands back the arena as written", () => {
  expect(validateArenaDraft(draftWith({}), "rows")).toEqual({ok: true, arena: {name: "Plain Room", rows: ROWS}});
});

it("accepts an arena whose raised platform is reached by a stair", () => {
  const rows = ["##########", "#........#", "#...>11..#", "#...#11..#", "##########"];

  expect(validateArenaDraft(draftWith({rows}), "rows").ok).toBe(true);
});

it("accepts every arena in engine's built-in pool, as a built-in must", () => {
  for (const arena of BUILT_IN_ARENAS) {
    expect(validateArenaDraft(arena, "rows"), arena.name).toEqual({ok: true, arena});
  }
});

it("accepts a low cover block (c) in the middle of the floor, which engine plays as a wall that is low", () => {
  const rows = [...ROWS.slice(0, 2), "#...c....#", ...ROWS.slice(3)];

  expect(validateArenaDraft(draftWith({rows}), "rows").ok).toBe(true);
});

it("repairs a cover block that cuts the floor in two by cutting one block away, where it would refuse it as a wall", () => {
  const rows = ["#########", "#...c...#", "#...c...#", "#...c...#", "#########"];

  const validation = validateArenaDraft(draftWith({rows}), "rows");

  expect(validation.ok).toBe(true);
  if (validation.ok) {
    expect(columnOf(validation.arena.rows, 4)).toHaveLength(1);
    expect(validation.arena.rows.join("").replaceAll(/[^c]/g, "")).toHaveLength(2);
  }
});

it("refuses ragged rows by naming the row that is the wrong length, so the repair can find it", () => {
  const rows = ["##########", "#........#", "#.........#", "#........#", "##########"];

  expect(errorsOf(draftWith({rows}))).toEqual([
    "Row 3 (counting from the top) has 11 characters, but most rows have 10: make every row 10 characters long.",
  ]);
});

it("accepts an arena written as shapes, and hands back the drawing the shapes make", () => {
  const shapes = {name: "Plain Room", width: 10, height: 5};

  expect(validateArenaDraft(shapes, "shapes")).toEqual({ok: true, arena: {name: "Plain Room", rows: ROWS}});
});

it("draws shapes before it checks the arena, so a wall across the floor is repaired as a drawing's would be", () => {
  const shapes = {name: "Cut", width: 10, height: 5, walls: [{x: 5, y: 1, width: 1, height: 3}]};

  const validation = validateArenaDraft(shapes, "shapes");

  expect(validation.ok).toBe(true);
  if (validation.ok) {
    expect(columnOf(validation.arena.rows, 5)).toHaveLength(1);
  }
});

it("drops a rectangle with no size from shapes instead of refusing it, as a stat past its range is clamped", () => {
  const shapes = {name: "Plain Room", width: 10, height: 5, walls: [{x: 0, y: 0, width: 0, height: 0}]};

  expect(validateArenaDraft(shapes, "shapes")).toEqual({ok: true, arena: {name: "Plain Room", rows: ROWS}});
});

it("refuses a shape that reaches past the arena with the sentence naming it", () => {
  const shapes = {name: "Wide", width: 10, height: 5, walls: [{x: 8, y: 1, width: 4, height: 1}]};

  expect(errorsOf(shapes, "shapes")).toEqual([
    expect.stringMatching(/^walls\[0\] reaches column 11 but the arena is 10 wide/),
  ]);
});

it("refuses a stray field in shapes, as it does in a drawing", () => {
  const shapes = {name: "Plain Room", width: 10, height: 5, ceiling: "glass"};

  expect(errorsOf(shapes, "shapes")).toEqual([expect.stringMatching(/ceiling/)]);
});

it("refuses a size outside the limits, naming the field", () => {
  expect(errorsOf({name: "Tiny", width: 3, height: 5}, "shapes")).toEqual([expect.stringMatching(/^width: /)]);
});

it("reads an answer in the format it was asked for and never guesses: shapes handed in as rows are refused, naming rows", () => {
  expect(errorsOf({name: "Plain Room", width: 10, height: 5})[0]).toMatch(/^rows: /);
});

it("reads shapes only as shapes: a drawing's rows handed in as shapes are refused, naming the size", () => {
  expect(errorsOf(draftWith({}), "shapes")).toEqual(expect.arrayContaining([expect.stringMatching(/^width: /)]));
});

it("refuses an answer that is not an object, naming the arena", () => {
  expect(errorsOf("a big room")).toEqual([expect.stringMatching(/^arena: /)]);
});

it("refuses a missing drawing, naming rows", () => {
  expect(errorsOf({name: "Plain Room"})).toEqual([expect.stringMatching(/^rows: /)]);
});

it("refuses a drawing written as one block of text instead of a list of rows", () => {
  expect(errorsOf(draftWith({rows: ROWS.join("\n")}))).toEqual([expect.stringMatching(/^rows: /)]);
});

it("refuses a stray field instead of dropping it", () => {
  expect(errorsOf(draftWith({spawn: "north"}))[0]).toContain("spawn");
});

it("refuses a name with markup in it", () => {
  expect(errorsOf(draftWith({name: "<b>Room</b>"}))).toEqual([expect.stringMatching(/^name: /)]);
});

it("refuses a drawing with too few rows", () => {
  expect(errorsOf(draftWith({rows: ROWS.slice(0, 3)}))).toEqual([expect.stringMatching(/^rows: /)]);
});

it("refuses a row wider than the limit, naming which row", () => {
  const rows = [...ROWS.slice(0, 2), `#${".".repeat(60)}#`, ...ROWS.slice(3)];

  expect(errorsOf(draftWith({rows}))[0]).toMatch(/^rows\.2: /);
});

it("refuses a character the engine does not read", () => {
  const rows = [...ROWS.slice(0, 2), "#...X....#", ...ROWS.slice(3)];

  expect(errorsOf(draftWith({rows}))).toHaveLength(1);
});

it("draws a stair with no landing as floor, where it would refuse it with the engine's words", () => {
  const rows = ["##########", "#........#", "#.......>#", "#........#", "##########"];

  expect(validateArenaDraft(draftWith({rows}), "rows")).toEqual({ok: true, arena: {name: "Plain Room", rows: ROWS}});
});

it("refuses an arena of walls only", () => {
  const rows = ["##########", "##########", "##########", "##########", "##########"];

  expect(errorsOf(draftWith({rows}))).toEqual(["The arena has no floor to stand on."]);
});

it("opens a door through a wall that cuts the floor in two, however big the parts", () => {
  const small = ["##########", "#...#....#", "#...#....#", "#...#....#", "##########"];
  const big = [
    "####################",
    "#........#.........#",
    "#........#.........#",
    "#........#.........#",
    "#........#.........#",
    "####################",
  ];

  for (const [rows, wall] of [
    [small, 4],
    [big, 9],
  ] as const) {
    const opened = validateArenaDraft(draftWith({rows}), "rows");

    expect(opened.ok).toBe(true);
    if (opened.ok) {
      expect(columnOf(opened.arena.rows, wall)).toHaveLength(1);
      expect(opened.arena.rows[0]).toBe(rows[0]);
    }
  }
});

it("gives a platform with no stair up to it one, where it would refuse it", () => {
  const rows = ["##########", "#........#", "#...#11..#", "#...#11..#", "##########"];

  const validation = validateArenaDraft(draftWith({rows}), "rows");

  expect(validation.ok).toBe(true);
  if (validation.ok) {
    expect(validation.arena.rows.join("").replaceAll(/[^<>^v]/g, "")).toHaveLength(1);
    expect(validation.arena.rows.join("").replaceAll(/[^1]/g, "")).toBe("1111");
  }
});

it("still refuses an arena that is nearly all wall, because no repair can make floor", () => {
  const rows = ["##########", "#...######", "##########", "##########", "##########"];

  expect(errorsOf(draftWith({rows}))).toContainEqual(expect.stringMatching(/^Open floor is only 3 of 50 tiles/));
});

it("lists the first few problems and counts the rest, when a drawing has more faults than a repair will mend", () => {
  const row = `#${".#".repeat(19)}#`;
  const rows = Array.from({length: 30}, (_, index) => {
    if (index % 2 === 0) {
      return "#".repeat(40);
    }

    return row;
  });

  const errors = errorsOf(draftWith({rows}));

  expect(errors).toHaveLength(6);
  expect(errors.slice(0, 5)).toEqual(Array(5).fill(expect.stringContaining("1 tiles of floor")));
  expect(errors[5]).toMatch(/^And \d+ more of the same kind\.$/);
});

it("shortens every sentence, because the model will be shown them", () => {
  const rows = ["##########", "##########", "##########", "##########", "##########"];

  for (const error of errorsOf(draftWith({rows, [`x${"y".repeat(400)}`]: 1}))) {
    expect(error.length).toBeLessThanOrEqual(160);
  }
});

/** The floor tiles of one column of a drawing, the interior rows only: how many ways there are through a wall that stands in it. */
function columnOf(rows: readonly string[], column: number): string {
  return rows
    .slice(1, -1)
    .map(row => row[column])
    .join("")
    .replaceAll(/[^.]/g, "");
}

function errorsOf(candidate: unknown, format: ArenaFormat = "rows"): string[] {
  const validation = validateArenaDraft(candidate, format);
  if (validation.ok) {
    throw new Error("expected the draft to be refused");
  }

  return validation.errors;
}

function draftWith(overrides: Record<string, unknown>): unknown {
  return {name: "Plain Room", rows: ROWS, ...overrides};
}
