import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";
import {UPHILLS} from "@gunsmith/engine/arena/types/Uphill";
import {stairStripsOf} from "@src/react/components/three/arena-terrain/components/arena-heights/stairs/StairStripsOf";

it("draws the flight as four bands, low end first", () => {
  expect(stairStripsOf("east")).toHaveLength(4);
  expect(stairStripsOf("east").map(strip => strip.fraction)).toEqual([0.125, 0.375, 0.625, 0.875]);
});

it("covers the whole tile whichever way the stair climbs", () => {
  for (const uphill of UPHILLS) {
    expect(areaOf(uphill)).toBeCloseTo(1, 9);
  }
});

it("puts the high bands further east on a stair that climbs east", () => {
  const xs = stairStripsOf("east").map(strip => strip.x);

  expect(xs).toEqual([0, 0.25, 0.5, 0.75]);
});

it("puts the high bands further west on a stair that climbs west", () => {
  const xs = stairStripsOf("west").map(strip => strip.x);

  expect(xs).toEqual([0.75, 0.5, 0.25, 0]);
});

it("puts the high bands further north on a stair that climbs north", () => {
  const ys = stairStripsOf("north").map(strip => strip.y);

  expect(ys).toEqual([0, 0.25, 0.5, 0.75]);
});

it("puts the high bands further south on a stair that climbs south", () => {
  const ys = stairStripsOf("south").map(strip => strip.y);

  expect(ys).toEqual([0.75, 0.5, 0.25, 0]);
});

it("keeps each band full width across the way the stair climbs", () => {
  expect(stairStripsOf("east").every(strip => strip.height === 1 && strip.y === 0)).toBe(true);
  expect(stairStripsOf("north").every(strip => strip.width === 1 && strip.x === 0)).toBe(true);
});

function areaOf(uphill: Uphill): number {
  return stairStripsOf(uphill).reduce((total, strip) => total + strip.width * strip.height, 0);
}
