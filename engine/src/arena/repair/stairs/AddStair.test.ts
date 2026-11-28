import {addStair} from "@gunsmith/engine/arena/repair/stairs/AddStair";

const PLATEAU = ["#########", "#..111..#", "#..111..#", "#..111..#", "#########"];
const PLATEAU_TILES = [
  {column: 3, row: 1},
  {column: 4, row: 1},
  {column: 5, row: 1},
];

it("puts the stair on the side of the platform that is the arena, even where the other side is the first it tries", () => {
  const east = [1, 2, 3].flatMap(row => [6, 7].map(column => ({column, row})));

  expect(addStair(PLATEAU, PLATEAU_TILES, east)?.[1]).toBe("#..111<.#");
});

it("puts the stair on the other side when that side is the arena", () => {
  const west = [1, 2, 3].flatMap(row => [1, 2].map(column => ({column, row})));

  expect(addStair(PLATEAU, PLATEAU_TILES, west)?.[1]).toBe("#.>111..#");
});

it("adds no stair when the floor beside the platform is not the arena", () => {
  expect(addStair(PLATEAU, PLATEAU_TILES, [])).toBeUndefined();
});

it("adds no stair for a tile that is not raised", () => {
  expect(addStair(PLATEAU, [{column: 1, row: 1}], [{column: 2, row: 1}])).toBeUndefined();
});
