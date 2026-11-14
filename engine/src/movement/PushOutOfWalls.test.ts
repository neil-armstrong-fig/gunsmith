import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {pushOutOfWalls} from "@gunsmith/engine/movement/PushOutOfWalls";
import type {BlockedTiles} from "@gunsmith/engine/movement/types/BlockedTiles";

// Walls all round a 5 by 5 room; the floor is x 1 to 4 and y 1 to 4.
const room = arenaFrom(["######", "#....#", "#....#", "#....#", "#....#", "######"]);
const RADIUS = 0.4;

function wallsOf(arena: Arena): BlockedTiles {
  return (tileX, tileY) => {
    return isSolid(arena, tileX, tileY);
  };
}

it("leaves a circle in open floor where it is", () => {
  expect(pushOutOfWalls(wallsOf(room), {x: 2.5, y: 2.5}, RADIUS)).toEqual({x: 2.5, y: 2.5});
});

it("leaves a circle that only touches a wall where it is", () => {
  const touching = {x: 1 + RADIUS, y: 2.5};

  expect(pushOutOfWalls(wallsOf(room), touching, RADIUS)).toEqual(touching);
});

it("pushes a circle that sank into the west wall back out along x", () => {
  const position = pushOutOfWalls(wallsOf(room), {x: 1.2, y: 2.5}, RADIUS);

  expect(position.x).toBeCloseTo(1 + RADIUS, 9);
  expect(position.y).toBe(2.5);
});

it("pushes a circle that sank into the east wall back out along x", () => {
  const position = pushOutOfWalls(wallsOf(room), {x: 4.8, y: 2.5}, RADIUS);

  expect(position.x).toBeCloseTo(5 - RADIUS, 9);
});

it("pushes a circle that sank into the north wall back out along y", () => {
  const position = pushOutOfWalls(wallsOf(room), {x: 2.5, y: 4.8}, RADIUS);

  expect(position.y).toBeCloseTo(5 - RADIUS, 9);
  expect(position.x).toBe(2.5);
});

it("keeps a circle in a corner clear of both walls", () => {
  const position = pushOutOfWalls(wallsOf(room), {x: 4.9, y: 4.9}, RADIUS);

  expect(position.x).toBeLessThanOrEqual(5 - RADIUS + 1e-9);
  expect(position.y).toBeLessThanOrEqual(5 - RADIUS + 1e-9);
});

it("pushes a circle whose centre is inside a wall tile out to the nearest side", () => {
  const arena = arenaFrom(["...", ".#.", "..."]);
  const position = pushOutOfWalls(wallsOf(arena), {x: 1.2, y: 1.5}, RADIUS);

  expect(position.x).toBeCloseTo(1 - RADIUS, 9);
  expect(position.y).toBe(1.5);
});

it("is stopped by a pillar in the middle of open floor", () => {
  const arena = arenaFrom(["....", ".#..", "...."]);
  const position = pushOutOfWalls(wallsOf(arena), {x: 2.1, y: 1.5}, RADIUS);

  expect(position.x).toBeCloseTo(2 + RADIUS, 9);
});

it("returns the same answer for the same input", () => {
  const first = pushOutOfWalls(wallsOf(room), {x: 1.1, y: 4.9}, RADIUS);
  const second = pushOutOfWalls(wallsOf(room), {x: 1.1, y: 4.9}, RADIUS);

  expect(second).toEqual(first);
});

it("leaves a wall tile by the nearest side, whichever side that is", () => {
  const arena = arenaFrom(["...", ".#.", "..."]);

  expect(pushOutOfWalls(wallsOf(arena), {x: 1.8, y: 1.5}, RADIUS).x).toBeCloseTo(2 + RADIUS, 9);
  expect(pushOutOfWalls(wallsOf(arena), {x: 1.5, y: 1.2}, RADIUS).y).toBeCloseTo(1 - RADIUS, 9);
  expect(pushOutOfWalls(wallsOf(arena), {x: 1.5, y: 1.8}, RADIUS).y).toBeCloseTo(2 + RADIUS, 9);
});

it("pushes a circle out of whatever the caller says is blocked, not only out of walls", () => {
  const blockedAtEast: BlockedTiles = tileX => tileX >= 3;

  const position = pushOutOfWalls(blockedAtEast, {x: 2.8, y: 1.5}, RADIUS);

  expect(position.x).toBeCloseTo(3 - RADIUS, 9);
});

it("leaves a circle alone where the caller says nothing is blocked, even inside a wall", () => {
  expect(pushOutOfWalls(() => false, {x: 0.5, y: 0.5}, RADIUS)).toEqual({x: 0.5, y: 0.5});
});
