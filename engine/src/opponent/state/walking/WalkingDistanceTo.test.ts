import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {walkingDistanceTo} from "@gunsmith/engine/opponent/state/walking/WalkingDistanceTo";

// A platform in the west (columns 1 and 2), the stair at the top of the drop (column 3, the first row drawn, so y 3), low ground east.
const terraced = arenaFrom(["#########", "#11<....#", "#11.....#", "#11.....#", "#########"]);
const flat = arenaFrom(["#########", "#.......#", "#...#...#", "#.......#", "#########"]);

it("is the straight distance in an arena with no stair", () => {
  expect(walkingDistanceTo(flat, {x: 1.5, y: 1.5}, {x: 4.5, y: 1.5})).toBeCloseTo(3, 9);
  expect(walkingDistanceTo(flat, {x: 1.5, y: 1.5}, {x: 4.5, y: 3.5})).toBeCloseTo(Math.hypot(3, 2), 9);
});

it("is nothing in an arena with no stair when a wall stands in the straight line, since it walks with no map", () => {
  expect(walkingDistanceTo(flat, {x: 3.5, y: 2.5}, {x: 5.5, y: 2.5})).toBeUndefined();
});

it("is the number of tiles on the walk round by the stair when a drop lies between, longer than the straight line", () => {
  const across = walkingDistanceTo(terraced, {x: 3.5, y: 1.5}, {x: 1.5, y: 1.5});

  expect(across).toBe(7);
  expect(across).toBeGreaterThan(2);
});

it("is the walk on a level too, tile by tile", () => {
  expect(walkingDistanceTo(terraced, {x: 4.5, y: 1.5}, {x: 7.5, y: 1.5})).toBe(4);
});
