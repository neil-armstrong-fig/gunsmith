import {compileArenaShapes} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/compile/CompileArenaShapes";
import type {ArenaShapes} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/draft/ArenaShapesDraft";

const ROOM: ArenaShapes = {name: "Room", width: 8, height: 5};

it("draws a walled room of floor from nothing but a size, the border wall being code's", () => {
  expect(compileArenaShapes(ROOM)).toEqual({
    ok: true,
    drawing: {name: "Room", rows: ["########", "#......#", "#......#", "#......#", "########"]},
  });
});

it("draws a wall rectangle from its west and north edges, counting from the top-left corner (0, 0)", () => {
  const compiled = compileArenaShapes({...ROOM, walls: [{x: 2, y: 1, width: 2, height: 2}]});

  expect(compiled).toMatchObject({drawing: {rows: ["########", "#.##...#", "#.##...#", "#......#", "########"]}});
});

it("draws a low cover block as c", () => {
  const compiled = compileArenaShapes({...ROOM, covers: [{x: 3, y: 2, width: 3, height: 1}]});

  expect(compiled).toMatchObject({drawing: {rows: ["########", "#......#", "#..ccc.#", "#......#", "########"]}});
});

it("draws a platform as raised floor of its level, and a stair as an arrow for the way it climbs", () => {
  const compiled = compileArenaShapes({
    ...ROOM,
    platforms: [{x: 4, y: 1, width: 2, height: 2, level: 1}],
    stairs: [{x: 3, y: 1, direction: "east"}],
  });

  expect(compiled).toMatchObject({drawing: {rows: ["########", "#..>11.#", "#...11.#", "#......#", "########"]}});
});

it("gives each direction its own arrow, north being up the page", () => {
  const arrows = (["north", "south", "west", "east"] as const).map(direction => {
    const compiled = compileArenaShapes({...ROOM, stairs: [{x: 3, y: 2, direction}]});
    if (!compiled.ok) {
      return undefined;
    }

    return compiled.drawing.rows[2]?.[3];
  });

  expect(arrows).toEqual(["^", "v", "<", ">"]);
});

it("lets a wall be drawn over a platform, and never lets any shape break the border", () => {
  const compiled = compileArenaShapes({
    ...ROOM,
    platforms: [{x: 0, y: 0, width: 8, height: 5, level: 2}],
    walls: [{x: 3, y: 2, width: 1, height: 1}],
  });

  expect(compiled).toMatchObject({drawing: {rows: ["########", "#222222#", "#22#222#", "#222222#", "########"]}});
});

it("walls every tile outside the floor rectangles, when it has them, so the open floor takes their shape", () => {
  const compiled = compileArenaShapes({
    ...ROOM,
    floor: [
      {x: 1, y: 1, width: 3, height: 3},
      {x: 4, y: 2, width: 3, height: 2},
    ],
  });

  expect(compiled).toMatchObject({drawing: {rows: ["########", "#...####", "#......#", "#......#", "########"]}});
});

it("draws the whole rectangle as floor when the floor list is empty, as with none", () => {
  expect(compileArenaShapes({...ROOM, floor: []})).toEqual(compileArenaShapes(ROOM));
});

it("draws the other shapes over the floor outline, a platform outside it included, and keeps the border", () => {
  const compiled = compileArenaShapes({
    ...ROOM,
    floor: [{x: 0, y: 0, width: 5, height: 5}],
    covers: [{x: 2, y: 2, width: 2, height: 1}],
    platforms: [{x: 6, y: 2, width: 1, height: 1, level: 1}],
  });

  expect(compiled).toMatchObject({drawing: {rows: ["########", "#....###", "#.cc.#1#", "#....###", "########"]}});
});

it("walls in cover that lies outside the floor outline, where no fighter could reach it", () => {
  const compiled = compileArenaShapes({
    ...ROOM,
    floor: [{x: 1, y: 1, width: 3, height: 2}],
    covers: [{x: 2, y: 2, width: 4, height: 2}],
  });

  expect(compiled).toMatchObject({drawing: {rows: ["########", "#...####", "#.cc####", "########", "########"]}});
});

it("refuses a floor rectangle that reaches past the arena, naming it", () => {
  const compiled = compileArenaShapes({...ROOM, floor: [{x: 5, y: 1, width: 4, height: 2}]});

  expect(compiled).toEqual({
    ok: false,
    errors: ["floor[0] reaches column 8 but the arena is 8 wide (columns 0 to 7): make it end at column 7 or sooner."],
  });
});

it("refuses a shape that reaches past the arena, naming the shape, its edge and the arena's size", () => {
  const compiled = compileArenaShapes({...ROOM, walls: [{x: 6, y: 1, width: 4, height: 1}]});

  expect(compiled).toEqual({
    ok: false,
    errors: ["walls[0] reaches column 9 but the arena is 8 wide (columns 0 to 7): make it end at column 7 or sooner."],
  });
});

it("refuses a shape that reaches below the arena", () => {
  const compiled = compileArenaShapes({...ROOM, covers: [{x: 1, y: 3, width: 1, height: 4}]});

  expect(compiled).toEqual({
    ok: false,
    errors: ["covers[0] reaches row 6 but the arena is 5 tall (rows 0 to 4): make it end at row 4 or sooner."],
  });
});

it("refuses a stair that is not on the grid", () => {
  const compiled = compileArenaShapes({...ROOM, stairs: [{x: 8, y: 1, direction: "north"}]});

  expect(compiled).toEqual({
    ok: false,
    errors: ["stairs[0] is at column 8 but the arena is 8 wide (columns 0 to 7)."],
  });
});
