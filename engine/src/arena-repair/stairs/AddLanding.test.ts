import {addLanding} from "@gunsmith/engine/arena-repair/stairs/AddLanding";
import {regionsOfDrawing} from "@gunsmith/engine/arena-repair/drawing/RegionsOfDrawing";

const TOWER = ["##########", "#........#", "#22......#", "#22......#", "#........#", "##########"];
const TOWER_TILES = [
  {column: 1, row: 2},
  {column: 2, row: 2},
];

it("draws a stair, a landing and a stair in a line out from the tower, onto low floor of the arena, each arrow climbing towards the tower", () => {
  expect(addLanding(TOWER, TOWER_TILES, regionsOfDrawing(TOWER).main)?.[2]).toBe("#22<1<...#");
});

it("draws nothing when the floor in front of the tower is not the arena", () => {
  expect(addLanding(TOWER, TOWER_TILES, [])).toBeUndefined();
});

it("draws nothing where a wall stands in the line, and there is no other way out", () => {
  const walled = ["########", "#22..#.#", "########"];

  expect(addLanding(walled, [{column: 2, row: 1}], regionsOfDrawing(walled).main)).toBeUndefined();
});

it("leaves a first level to a single stair, the way it is already reached", () => {
  const plateau = ["##########", "#........#", "#11......#", "#11......#", "#........#", "##########"];

  expect(addLanding(plateau, TOWER_TILES, regionsOfDrawing(plateau).main)).toBeUndefined();
});
