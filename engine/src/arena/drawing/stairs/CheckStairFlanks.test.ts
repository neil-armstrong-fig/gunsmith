import {checkStairFlanks} from "@gunsmith/engine/arena/drawing/stairs/CheckStairFlanks";
import type {FlankTile} from "@gunsmith/engine/arena/drawing/stairs/types/FlankTile";
import type {FlankTiles} from "@gunsmith/engine/arena/drawing/stairs/types/FlankTiles";
import type {DrawnArena} from "@gunsmith/engine/arena/types/DrawnArena";
import {UPHILLS} from "@gunsmith/engine/arena/types/Uphill";
import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";

it("accepts a stair with a wall or low ground on its sides, whichever way it climbs", () => {
  for (const uphill of UPHILLS) {
    expect(() => checkStairFlanks(arenaWithStair(uphill, {first: {wall: true}, second: {level: 0}}))).not.toThrow();
  }
});

it("refuses raised floor beside a stair, on either side", () => {
  for (const uphill of UPHILLS) {
    expect(() => checkStairFlanks(arenaWithStair(uphill, {first: {level: 1}, second: {level: 0}}))).toThrow("beside");
    expect(() => checkStairFlanks(arenaWithStair(uphill, {first: {level: 0}, second: {level: 1}}))).toThrow("beside");
  }
});

it("refuses floor two levels up beside a stair, as well as one", () => {
  expect(() => checkStairFlanks(arenaWithStair("north", {first: {level: 2}, second: {wall: true}}))).toThrow("beside");
});

it("accepts a wall beside a stair, however high that tile was drawn", () => {
  expect(() =>
    checkStairFlanks(arenaWithStair("north", {first: {wall: true, level: 2}, second: {wall: true}})),
  ).not.toThrow();
});

it("judges a side against the level the stair starts from, not level 0", () => {
  const level = arenaWithStair("north", {first: {level: 1}, second: {level: 0}});
  level.levels[4] = 1;
  const raised = arenaWithStair("north", {first: {level: 2}, second: {level: 1}});
  raised.levels[4] = 1;

  expect(() => checkStairFlanks(level)).not.toThrow();
  expect(() => checkStairFlanks(raised)).toThrow("beside");
});

it("accepts a second stair beside the first when it starts at the same level", () => {
  expect(() =>
    checkStairFlanks(arenaWithStair("north", {first: {stair: "north"}, second: {wall: true}})),
  ).not.toThrow();
});

it("refuses a stair beside the first that starts at a higher level", () => {
  expect(() =>
    checkStairFlanks(arenaWithStair("north", {first: {stair: "north", level: 1}, second: {wall: true}})),
  ).toThrow("beside");
});

it("counts the edge of the arena as a wall", () => {
  const arena: DrawnArena = {
    width: 1,
    height: 3,
    solid: [false, false, false],
    cover: [false, false, false],
    levels: [0, 0, 1],
    stairs: [undefined, "north", undefined],
  };

  expect(() => checkStairFlanks(arena)).not.toThrow();
});

it("names where the stair is, counting the row from the top of the drawing", () => {
  expect(() => checkStairFlanks(arenaWithStair("north", {first: {level: 1}, second: {wall: true}}))).toThrow(
    "column 2, row 2",
  );
});

// A 3 by 3 arena with a stair in the middle, already given the level of its low end (placeStairs does that first). The sides are
// the tiles beside the stair: west and east of one climbing north or south, south and north of one climbing east or west.
function arenaWithStair(uphill: Uphill, sides: FlankTiles): DrawnArena {
  const arena: DrawnArena = {
    width: 3,
    height: 3,
    solid: new Array<boolean>(9).fill(false),
    cover: new Array<boolean>(9).fill(false),
    levels: new Array<number>(9).fill(0),
    stairs: new Array<Uphill | undefined>(9).fill(undefined),
  };
  arena.stairs[4] = uphill;

  const [firstIndex, secondIndex] = sideIndexes(uphill);
  applySide(arena, firstIndex, sides.first);
  applySide(arena, secondIndex, sides.second);

  return arena;
}

function sideIndexes(uphill: Uphill): [number, number] {
  if (uphill === "north" || uphill === "south") {
    return [3, 5];
  }

  return [1, 7];
}

function applySide(arena: DrawnArena, index: number, side: FlankTile): void {
  arena.solid[index] = side.wall === true;
  arena.levels[index] = side.level ?? 0;
  arena.stairs[index] = side.stair;
}
