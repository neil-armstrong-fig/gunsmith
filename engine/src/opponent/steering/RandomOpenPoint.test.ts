import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {randomOpenPoint} from "@gunsmith/engine/opponent/steering/RandomOpenPoint";

const room = arenaFrom([
  "##########",
  "#........#",
  "#........#",
  "#...##...#",
  "#...##...#",
  "#........#",
  "#........#",
  "##########",
]);
const everywhere = {centre: {x: 5, y: 4}, radius: 100};

it("finds the centre of an open tile", () => {
  let seed = 1;
  for (let index = 0; index < 200; index++) {
    const draw = randomOpenPoint(room, seed, everywhere);
    seed = draw.seed;
    if (draw.point) {
      expect(draw.point.x % 1).toBe(0.5);
      expect(draw.point.y % 1).toBe(0.5);
      expect(isSolid(room, Math.floor(draw.point.x), Math.floor(draw.point.y))).toBe(false);
    }
  }
});

it("usually finds one in a room that is mostly open", () => {
  let found = 0;
  let seed = 3;
  for (let index = 0; index < 100; index++) {
    const draw = randomOpenPoint(room, seed, everywhere);
    seed = draw.seed;
    if (draw.point) {
      found++;
    }
  }

  expect(found).toBeGreaterThan(90);
});

it("keeps to the circle it is asked to look in", () => {
  const around = {centre: {x: 2.5, y: 1.5}, radius: 2};
  let seed = 5;
  for (let index = 0; index < 200; index++) {
    const draw = randomOpenPoint(room, seed, around);
    seed = draw.seed;
    if (draw.point) {
      expect(Math.hypot(draw.point.x - 2.5, draw.point.y - 1.5)).toBeLessThanOrEqual(2);
    }
  }
});

it("reaches every corner of a circle that covers the room", () => {
  const seen = new Set<string>();
  let seed = 9;
  for (let index = 0; index < 600; index++) {
    const draw = randomOpenPoint(room, seed, everywhere);
    seed = draw.seed;
    if (draw.point) {
      seen.add(cornerOf(draw.point));
    }
  }

  expect(seen.size).toBe(4);
});

it("finds nothing where there is only wall", () => {
  const draw = randomOpenPoint(room, 1, {centre: {x: 0.5, y: 0.5}, radius: 0.4});

  expect(draw.point).toBeUndefined();
});

it("gives the same answer for the same seed", () => {
  expect(randomOpenPoint(room, 42, everywhere)).toEqual(randomOpenPoint(room, 42, everywhere));
});

it("moves the seed on, so the next look is a different one", () => {
  expect(randomOpenPoint(room, 42, everywhere).seed).not.toBe(42);
});

function cornerOf(point: Point): string {
  if (point.x < 5 && point.y < 4) {
    return "west-south";
  }
  if (point.x < 5) {
    return "west-north";
  }
  if (point.y < 4) {
    return "east-south";
  }

  return "east-north";
}
