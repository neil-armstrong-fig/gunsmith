import {isInCone} from "@gunsmith/engine/vision/cone/IsInCone";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

// A cone from (5, 5) facing east, 90 degrees wide (45 either side of the aim) and 10 tiles long.
const EAST: Cone = {apex: {x: 5, y: 5}, aim: {x: 1, y: 0}, halfAngleRadians: Math.PI / 4, range: 10};

it("holds a point straight ahead", () => {
  expect(isInCone(EAST, {x: 8, y: 5})).toBe(true);
});

it("holds a point exactly at its range", () => {
  expect(isInCone(EAST, {x: 15, y: 5})).toBe(true);
});

it("does not hold a point beyond its range", () => {
  expect(isInCone(EAST, {x: 15.5, y: 5})).toBe(false);
});

it("does not hold a point behind the apex", () => {
  expect(isInCone(EAST, {x: 2, y: 5})).toBe(false);
});

it("does not hold a point directly to the side", () => {
  expect(isInCone(EAST, {x: 5, y: 8})).toBe(false);
});

it("holds a point just inside the edge on either side", () => {
  expect(isInCone(EAST, {x: 8, y: 5 + 2.9})).toBe(true);
  expect(isInCone(EAST, {x: 8, y: 5 - 2.9})).toBe(true);
});

it("does not hold a point just outside the edge on either side", () => {
  expect(isInCone(EAST, {x: 8, y: 5 + 3.1})).toBe(false);
  expect(isInCone(EAST, {x: 8, y: 5 - 3.1})).toBe(false);
});

it("holds a point on the edge itself", () => {
  expect(isInCone(EAST, {x: 8, y: 8})).toBe(true);
});

it("holds the apex itself", () => {
  expect(isInCone(EAST, {x: 5, y: 5})).toBe(true);
});

it("follows the aim when it faces west, where the angle wraps", () => {
  const west: Cone = {...EAST, aim: {x: -1, y: 0}};

  expect(isInCone(west, {x: 2, y: 5.5})).toBe(true);
  expect(isInCone(west, {x: 2, y: 4.5})).toBe(true);
  expect(isInCone(west, {x: 8, y: 5})).toBe(false);
});

it("follows the aim when it faces north", () => {
  const north: Cone = {...EAST, aim: {x: 0, y: 1}};

  expect(isInCone(north, {x: 5, y: 9})).toBe(true);
  expect(isInCone(north, {x: 9, y: 5})).toBe(false);
});

it("is wider when the cone is wider", () => {
  const wide: Cone = {...EAST, halfAngleRadians: (2 * Math.PI) / 3};

  expect(isInCone(wide, {x: 5, y: 8})).toBe(true);
  expect(isInCone(wide, {x: 2, y: 5})).toBe(false);
});
