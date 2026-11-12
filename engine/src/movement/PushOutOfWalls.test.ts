import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {pushOutOfWalls} from "@gunsmith/engine/movement/PushOutOfWalls";

// Walls all round a 5 by 5 room; the floor is x 1 to 4 and y 1 to 4.
const room = arenaFrom(["######", "#....#", "#....#", "#....#", "#....#", "######"]);
const RADIUS = 0.4;

it("leaves a circle in open floor where it is", () => {
  expect(pushOutOfWalls(room, {x: 2.5, y: 2.5}, RADIUS)).toEqual({x: 2.5, y: 2.5});
});

it("leaves a circle that only touches a wall where it is", () => {
  const touching = {x: 1 + RADIUS, y: 2.5};

  expect(pushOutOfWalls(room, touching, RADIUS)).toEqual(touching);
});

it("pushes a circle that sank into the west wall back out along x", () => {
  const position = pushOutOfWalls(room, {x: 1.2, y: 2.5}, RADIUS);

  expect(position.x).toBeCloseTo(1 + RADIUS, 9);
  expect(position.y).toBe(2.5);
});

it("pushes a circle that sank into the east wall back out along x", () => {
  const position = pushOutOfWalls(room, {x: 4.8, y: 2.5}, RADIUS);

  expect(position.x).toBeCloseTo(5 - RADIUS, 9);
});

it("pushes a circle that sank into the north wall back out along y", () => {
  const position = pushOutOfWalls(room, {x: 2.5, y: 4.8}, RADIUS);

  expect(position.y).toBeCloseTo(5 - RADIUS, 9);
  expect(position.x).toBe(2.5);
});

it("keeps a circle in a corner clear of both walls", () => {
  const position = pushOutOfWalls(room, {x: 4.9, y: 4.9}, RADIUS);

  expect(position.x).toBeLessThanOrEqual(5 - RADIUS + 1e-9);
  expect(position.y).toBeLessThanOrEqual(5 - RADIUS + 1e-9);
});

it("pushes a circle whose centre is inside a wall tile out to the nearest side", () => {
  const arena = arenaFrom(["...", ".#.", "..."]);
  const position = pushOutOfWalls(arena, {x: 1.2, y: 1.5}, RADIUS);

  expect(position.x).toBeCloseTo(1 - RADIUS, 9);
  expect(position.y).toBe(1.5);
});

it("is stopped by a pillar in the middle of open floor", () => {
  const arena = arenaFrom(["....", ".#..", "...."]);
  const position = pushOutOfWalls(arena, {x: 2.1, y: 1.5}, RADIUS);

  expect(position.x).toBeCloseTo(2 + RADIUS, 9);
});

it("returns the same answer for the same input", () => {
  const first = pushOutOfWalls(room, {x: 1.1, y: 4.9}, RADIUS);
  const second = pushOutOfWalls(room, {x: 1.1, y: 4.9}, RADIUS);

  expect(second).toEqual(first);
});

it("leaves a wall tile by the nearest side, whichever side that is", () => {
  const arena = arenaFrom(["...", ".#.", "..."]);

  expect(pushOutOfWalls(arena, {x: 1.8, y: 1.5}, RADIUS).x).toBeCloseTo(2 + RADIUS, 9);
  expect(pushOutOfWalls(arena, {x: 1.5, y: 1.2}, RADIUS).y).toBeCloseTo(1 - RADIUS, 9);
  expect(pushOutOfWalls(arena, {x: 1.5, y: 1.8}, RADIUS).y).toBeCloseTo(2 + RADIUS, 9);
});
