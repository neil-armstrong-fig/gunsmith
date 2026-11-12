import {nearestDummyHit} from "@gunsmith/engine/bullet/hit/NearestDummyHit";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";

// Dummies have a radius of 0.4 (`DUMMY_RADIUS`). The bullet leaves the origin heading east.
const bullet: Bullet = {position: {x: 0, y: 0}, direction: {x: 1, y: 0}, damage: 25, speed: 20, shooter: "player"};

function dummyAt(x: number, y: number): Dummy {
  return {position: {x, y}, health: 100};
}

it("finds nothing when there are no dummies", () => {
  expect(nearestDummyHit([], bullet, 10)).toBeUndefined();
});

it("finds the dummy the bullet reaches, and how far along it was touched", () => {
  const hit = nearestDummyHit([dummyAt(3, 0)], bullet, 10);

  expect(hit?.dummyIndex).toBe(0);
  expect(hit?.distance).toBeCloseTo(2.6, 9);
});

it("counts a dummy whose edge is touched exactly at the end of the flight", () => {
  expect(nearestDummyHit([dummyAt(2.9, 0)], bullet, 2.5)).toEqual({dummyIndex: 0, distance: 2.5});
});

it("ignores a dummy whose edge lies just past the end of the flight", () => {
  expect(nearestDummyHit([dummyAt(2.95, 0)], bullet, 2.5)).toBeUndefined();
});

it("ignores a dummy that is far beyond the end of the flight", () => {
  expect(nearestDummyHit([dummyAt(5, 0)], bullet, 2.5)).toBeUndefined();
});

it("ignores a dummy off to the side of the line of flight", () => {
  expect(nearestDummyHit([dummyAt(2, 1)], bullet, 10)).toBeUndefined();
});

it("picks the nearest of several, whichever order they are listed in", () => {
  expect(nearestDummyHit([dummyAt(6, 0), dummyAt(3, 0), dummyAt(9, 0)], bullet, 20)?.dummyIndex).toBe(1);
  expect(nearestDummyHit([dummyAt(3, 0), dummyAt(6, 0)], bullet, 20)?.dummyIndex).toBe(0);
});
