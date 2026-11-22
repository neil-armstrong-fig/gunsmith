import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {repairArena} from "@gunsmith/engine/arena-repair/RepairArena";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";

it("leaves a playable arena exactly as it is", () => {
  const room = ["####", "#..#", "#..#", "####"];

  expect(repairArena(room)).toEqual({rows: room, edits: []});
});

it("leaves a platform with a legal stair as the model drew it", () => {
  const rows = ["#######", "#..>11#", "#..#11#", "#######"];

  expect(repairArena(rows)).toEqual({rows, edits: []});
});

it("opens one door through the wall between two rooms of floor that nobody can walk between", () => {
  const rows = ["###########", "#....#....#", "#....#....#", "#....#....#", "#....#....#", "###########"];

  const repaired = repairArena(rows);

  expect(repaired.edits).toEqual([{kind: "doorOpened", tiles: 1}]);
  expect(validateArena(arenaFrom(repaired.rows))).toEqual([]);
  expect(wallsIn(repaired.rows)).toBe(wallsIn(rows) - 1);
});

it("opens the door in the dividing wall, never in the border", () => {
  const rows = ["###########", "#....#....#", "#....#....#", "#....#....#", "#....#....#", "###########"];

  const repaired = repairArena(rows).rows;

  expect(repaired[0]).toBe("###########");
  expect(repaired[5]).toBe("###########");
  expect(repaired.every(row => row.startsWith("#") && row.endsWith("#"))).toBe(true);
});

it("walls in a sliver of floor instead of opening a way to it, when it is a tenth of the floor or less", () => {
  const repaired = repairArena(sealedRoom({pocketWidth: 2, height: 2, mainWidth: 18}));

  expect(repaired.edits).toEqual([{kind: "pocketWalled", tiles: 4}]);
  expect(repaired.rows.slice(1, 3).every(row => row.startsWith("####"))).toBe(true);
});

it("opens a door to a piece that is more than a tenth of the floor, because it is a room the model drew", () => {
  expect(repairArena(sealedRoom({pocketWidth: 2, height: 2, mainWidth: 10})).edits).toEqual([
    {kind: "doorOpened", tiles: 1},
  ]);
});

it("walls in a strip of floor sealed by a plateau, where a door cannot be cut, and gives the plateau its stair", () => {
  const rows = ["###########", "#.....111.#", "#.....111.#", "#.....111.#", "###########"];

  const repaired = repairArena(rows);

  expect(repaired.edits.map(edit => edit.kind)).toEqual(["stairAdded", "pocketWalled"]);
  expect(validateArena(arenaFrom(repaired.rows)).map(problem => problem.kind)).not.toContain("disconnected");
});

it("drops a stair with no floor behind it and gives the platform another, where one fits", () => {
  const rows = ["#########", "#>11....#", "#.11....#", "#.......#", "#########"];

  const repaired = repairArena(rows);

  expect(repaired.edits.map(edit => edit.kind)).toEqual(["stairDropped", "stairAdded"]);
  expect(validateArena(arenaFrom(repaired.rows))).toEqual([]);
});

it("lowers a platform nothing can reach and then walls in the one tile left, when it sits in a cell of wall", () => {
  const rows = ["#######", "#.....#", "#.###.#", "#.#1#.#", "#.###.#", "#.....#", "#######"];

  expect(repairArena(rows)).toEqual({
    rows: ["#######", "#.....#", "#.###.#", "#.###.#", "#.###.#", "#.....#", "#######"],
    edits: [
      {kind: "platformLowered", tiles: 1},
      {kind: "pocketWalled", tiles: 1},
    ],
  });
});

it("adds one stair beside a platform that has none, and leaves the platform as it was", () => {
  const rows = ["#########", "#.......#", "#...11..#", "#...11..#", "#.......#", "#########"];

  const repaired = repairArena(rows);

  expect(repaired.edits).toEqual([{kind: "stairAdded", tiles: 1}]);
  expect(arrowsIn(repaired.rows)).toBe(1);
  expect(repaired.rows.join("").replaceAll(/[^1]/g, "")).toBe("1111");
  expect(validateArena(arenaFrom(repaired.rows))).toEqual([]);
});

it("joins a second level to the first with a stair, as it does a first level to the ground", () => {
  const rows = ["#########", "#.......#", "#..>112.#", "#...112.#", "#.......#", "#########"];

  const repaired = repairArena(rows);

  expect(repaired.edits).toEqual([{kind: "stairAdded", tiles: 1}]);
  expect(validateArena(arenaFrom(repaired.rows))).toEqual([]);
});

it("lowers a second level a level at a time, until nothing is raised, when nothing can reach it", () => {
  const rows = ["#######", "#.....#", "#.###.#", "#.#2#.#", "#.###.#", "#.....#", "#######"];

  expect(repairArena(rows).edits).toEqual([
    {kind: "platformLowered", tiles: 1},
    {kind: "platformLowered", tiles: 1},
    {kind: "pocketWalled", tiles: 1},
  ]);
});

it("keeps a stair the model drew legally when another stair beside it is the illegal one", () => {
  const rows = ["#########", "#..>11..#", "#...11..#", "#.>.....#", "#########"];

  const repaired = repairArena(rows);

  expect(repaired.rows[1]).toBe("#..>11..#");
  expect(repaired.rows[3]).toBe("#.......#");
  expect(repaired.edits).toEqual([{kind: "stairDropped", tiles: 1}]);
});

it("walls in a sliver of exactly twelve tiles, the most it walls in, and opens a door to one of thirteen", () => {
  expect(repairArena(sealedRoom({pocketWidth: 12, height: 1, mainWidth: 13, mainHeight: 10})).edits).toEqual([
    {kind: "pocketWalled", tiles: 12},
  ]);
  expect(repairArena(sealedRoom({pocketWidth: 13, height: 1, mainWidth: 13, mainHeight: 10})).edits).toEqual([
    {kind: "doorOpened", tiles: 1},
  ]);
});

it("gives a platform its stair on the first of several equal pieces of floor, which is the one validateArena takes as the arena", () => {
  const rows = ["###########", "#...111...#", "#...111...#", "#...111...#", "###########"];

  const repaired = repairArena(rows);

  expect(repaired.edits[0]).toEqual({kind: "stairAdded", tiles: 1});
  expect(repaired.rows[3]?.[3]).toBe(">");
});

it("leaves a drawing it cannot read for the validator to refuse", () => {
  const ragged = ["#####", "#...#", "#..#", "#####"];
  const unknown = ["####", "#.x#", "####"];

  expect(repairArena(ragged)).toEqual({rows: ragged, edits: []});
  expect(repairArena(unknown)).toEqual({rows: unknown, edits: []});
});

it("leaves an arena with no floor at all alone", () => {
  expect(repairArena(["###", "###"])).toEqual({rows: ["###", "###"], edits: []});
});

interface SealedRoomSizes {
  pocketWidth: number;
  height: number;
  mainWidth: number;
  mainHeight?: number;
}

function wallsIn(rows: readonly string[]): number {
  return rows.join("").replaceAll(/[^#]/g, "").length;
}

function arrowsIn(rows: readonly string[]): number {
  return rows.join("").replaceAll(/[^<>^v]/g, "").length;
}

/** Two rooms side by side with a wall between them: the pocket on the left, the arena on the right, each as tall as asked. */
function sealedRoom(sizes: SealedRoomSizes): string[] {
  const mainHeight = sizes.mainHeight ?? sizes.height;
  const width = sizes.pocketWidth + sizes.mainWidth + 3;
  const rows = ["#".repeat(width)];

  for (let row = 0; row < Math.max(sizes.height, mainHeight); row += 1) {
    const pocket = fillOrWall(row < sizes.height, sizes.pocketWidth);
    const main = fillOrWall(row < mainHeight, sizes.mainWidth);
    rows.push(`#${pocket}#${main}#`);
  }

  rows.push("#".repeat(width));

  return rows;
}

function fillOrWall(isFloor: boolean, width: number): string {
  if (isFloor) {
    return ".".repeat(width);
  }

  return "#".repeat(width);
}
