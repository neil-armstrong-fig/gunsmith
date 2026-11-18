import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";

const ROWS = ["##########", "#........#", "#........#", "#........#", "##########"];

it("accepts a walled room and hands back the arena as written", () => {
  expect(validateArenaDraft(draftWith({}))).toEqual({ok: true, arena: {name: "Plain Room", rows: ROWS}});
});

it("accepts an arena whose raised platform is reached by a stair", () => {
  const rows = ["##########", "#........#", "#...>11..#", "#...#11..#", "##########"];

  expect(validateArenaDraft(draftWith({rows})).ok).toBe(true);
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

it("refuses rows of unequal length with the engine's own words", () => {
  const rows = [...ROWS.slice(0, 2), "#.......#", ...ROWS.slice(3)];

  expect(errorsOf(draftWith({rows}))).toEqual(["Every row of an arena must be the same length."]);
});

it("refuses a character the engine does not read", () => {
  const rows = [...ROWS.slice(0, 2), "#...X....#", ...ROWS.slice(3)];

  expect(errorsOf(draftWith({rows}))).toHaveLength(1);
});

it("refuses a stair with no landing, with the engine's words", () => {
  const rows = ["##########", "#........#", "#.......>#", "#........#", "##########"];

  expect(errorsOf(draftWith({rows}))).toHaveLength(1);
});

it("refuses an arena of walls only", () => {
  const rows = ["##########", "##########", "##########", "##########", "##########"];

  expect(errorsOf(draftWith({rows}))).toEqual(["The arena has no floor to stand on."]);
});

it("refuses an arena whose floor is cut in two, saying how much of the smaller part is cut off", () => {
  const rows = ["##########", "#...#....#", "#...#....#", "#...#....#", "##########"];

  expect(errorsOf(draftWith({rows}))).toEqual([expect.stringContaining("9 tiles of floor")]);
});

it("names every part of the floor that is cut off, not only the first", () => {
  const rows = ["#############", "#..#...#....#", "#..#...#....#", "#..#...#....#", "#############"];

  expect(errorsOf(draftWith({rows}))).toEqual([
    expect.stringContaining("6 tiles of floor"),
    expect.stringContaining("9 tiles of floor"),
  ]);
});

it("refuses a raised platform with no stair up to it", () => {
  const rows = ["##########", "#........#", "#...#11..#", "#...#11..#", "##########"];

  expect(errorsOf(draftWith({rows}))[0]).toContain("cannot be walked to");
});

it("lists the first few problems and counts the rest, so a speckled drawing cannot flood the repair", () => {
  const rows = [
    "#############",
    "#.#.#.#.#.#.#",
    "#############",
    "#.#.#.#.#.#.#",
    "#############",
    "#.#.#.#.#.#.#",
    "#############",
    "#.#.#.#.#.#.#",
    "#############",
  ];

  const errors = errorsOf(draftWith({rows}));

  expect(errors).toHaveLength(6);
  expect(errors.slice(0, 5)).toEqual(Array(5).fill(expect.stringContaining("1 tiles of floor")));
  expect(errors[5]).toBe("And 18 more of the same kind.");
});

it("shortens every sentence, because the model will be shown them", () => {
  const rows = ["##########", "##########", "##########", "##########", "##########"];

  for (const error of errorsOf(draftWith({rows, [`x${"y".repeat(400)}`]: 1}))) {
    expect(error.length).toBeLessThanOrEqual(160);
  }
});

function errorsOf(candidate: unknown): string[] {
  const validation = validateArenaDraft(candidate);
  if (validation.ok) {
    throw new Error("expected the draft to be refused");
  }

  return validation.errors;
}

function draftWith(overrides: Record<string, unknown>): unknown {
  return {name: "Plain Room", rows: ROWS, ...overrides};
}
