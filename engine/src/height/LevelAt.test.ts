import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {levelAt} from "@gunsmith/engine/height/LevelAt";

const arena = arenaFrom(["######", "#.>12#", "######"]);

it("is the level of the tile the point is in", () => {
  expect(levelAt(arena, {x: 1.5, y: 1.5})).toBe(0);
  expect(levelAt(arena, {x: 3.5, y: 1.5})).toBe(1);
  expect(levelAt(arena, {x: 4.5, y: 1.5})).toBe(2);
});

it("is half way between the two levels a stair joins, anywhere on the stair", () => {
  expect(levelAt(arena, {x: 2.1, y: 1.5})).toBe(0.5);
  expect(levelAt(arena, {x: 2.9, y: 1.5})).toBe(0.5);
});

it("changes at the edge of a tile, not the middle", () => {
  expect(levelAt(arena, {x: 2.999, y: 1.5})).toBe(0.5);
  expect(levelAt(arena, {x: 3, y: 1.5})).toBe(1);
});
