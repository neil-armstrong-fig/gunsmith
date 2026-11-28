import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isPlaceToStand} from "@gunsmith/engine/arena/symmetry/IsPlaceToStand";

// Row-major from the south, five to a row: 0 is a wall, 6 a cover block, 7 low floor, 12 a stair climbing east and 13 the floor it climbs to.
const ARENA = arenaFrom(["#####", "#.>1#", "#c..#", "#####"]);

it("is true for open floor on the low ground and on a higher level", () => {
  expect(isPlaceToStand(ARENA, 7)).toBe(true);
  expect(isPlaceToStand(ARENA, 13)).toBe(true);
});

it("is false for a wall", () => {
  expect(isPlaceToStand(ARENA, 0)).toBe(false);
});

it("is false for a low cover block", () => {
  expect(isPlaceToStand(ARENA, 6)).toBe(false);
});

it("is false for a stair", () => {
  expect(isPlaceToStand(ARENA, 12)).toBe(false);
});
