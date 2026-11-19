import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";

it("finds no problem in a room", () => {
  expect(validateArena(arenaFrom(["####", "#..#", "#..#", "####"]))).toEqual([]);
});

it("finds no problem in a room with a platform reached by its stair", () => {
  expect(validateArena(arenaFrom(["#######", "#..>11#", "#..#11#", "#######"]))).toEqual([]);
});

it("finds no problem in a room divided by a wall that leaves a gap", () => {
  expect(validateArena(arenaFrom(["#####", "#.#.#", "#...#", "#####"]))).toEqual([]);
});

it("reports an arena of nothing but wall as having no floor", () => {
  const problems = validateArena(arenaFrom(["###", "###"]));

  expect(problems).toHaveLength(1);
  expect(problems[0]).toMatchObject({kind: "noFloor", tile: undefined});
  expect(problems[0]?.reason).toBe("The arena has no floor to stand on.");
});

it("reports a room walled off from the main one, naming its first tile and its size", () => {
  const problems = validateArena(arenaFrom(["########", "#..#...#", "#..#...#", "########"]));

  expect(problems).toEqual([
    {
      kind: "disconnected",
      tile: {x: 1.5, y: 1.5},
      reason: "4 tiles of floor, starting at column 2, row 3, cannot be walked to from the rest of the arena.",
    },
  ]);
});

it("keeps the larger region as the arena and reports the smaller", () => {
  const problems = validateArena(arenaFrom(["#######", "#.#...#", "#.#...#", "#######"]));

  expect(problems.map(problem => problem.tile)).toEqual([{x: 1.5, y: 1.5}]);
});

it("reports every region cut off, in the order their first tiles come in the drawing from the south-west", () => {
  const problems = validateArena(arenaFrom(["#########", "#...#.#.#", "#...#.#.#", "#########"]));

  expect(problems.map(problem => problem.tile)).toEqual([
    {x: 5.5, y: 1.5},
    {x: 7.5, y: 1.5},
  ]);
});

it("reports a platform that has no stair as cut off, since a drop is a wall", () => {
  const problems = validateArena(arenaFrom(["#######", "#...11#", "#...11#", "#######"]));

  expect(problems).toHaveLength(1);
  expect(problems[0]).toMatchObject({kind: "disconnected", tile: {x: 4.5, y: 1.5}});
});

it("keeps the first of equally large regions as the arena", () => {
  const problems = validateArena(arenaFrom(["#######", "#..#..#", "#..#..#", "#..#..#", "#######"]));

  expect(problems.map(problem => problem.tile)).toEqual([{x: 4.5, y: 1.5}]);
});

it("counts the tiles of the region cut off, down every row of it", () => {
  const problems = validateArena(arenaFrom(["#######", "#.#...#", "#.#...#", "#.#...#", "#######"]));

  expect(problems).toEqual([
    {
      kind: "disconnected",
      tile: {x: 1.5, y: 1.5},
      reason: "3 tiles of floor, starting at column 2, row 4, cannot be walked to from the rest of the arena.",
    },
  ]);
});

it("reports an arena that is nearly all wall as too walled, naming the share and the least asked", () => {
  const problems = validateArena(arenaFrom(["#######", "#.....#", "#.#####", "#######"]));

  expect(problems).toEqual([
    {
      kind: "tooWalled",
      tile: undefined,
      reason: "Open floor is only 6 of 28 tiles (21%); at least 25% of the arena must be open floor.",
    },
  ]);
});

it("accepts an arena whose floor is exactly the share asked for", () => {
  expect(validateArena(arenaFrom(["#######", "#.....#", "#..####", "#######"]))).toEqual([]);
});

it("counts a cover block as wall when it asks for the floor", () => {
  const problems = validateArena(arenaFrom(["#######", "#cccc.#", "#cccc.#", "#cccc.#", "#cccc.#", "#######"]));

  expect(problems.map(problem => problem.kind)).toEqual(["tooWalled"]);
});

it("reports a cut-off region and the lack of floor together, the cut-off one first", () => {
  const problems = validateArena(arenaFrom(["########", "#.#.####", "########"]));

  expect(problems.map(problem => problem.kind)).toEqual(["disconnected", "tooWalled"]);
});
