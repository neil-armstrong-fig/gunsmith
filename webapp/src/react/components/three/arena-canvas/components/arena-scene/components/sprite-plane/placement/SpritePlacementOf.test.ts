import {expect, it} from "vitest";
import {spritePlacementOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/sprite-plane/placement/SpritePlacementOf";

it("draws a picture as many tiles wide as its pixels make", () => {
  const {width, height} = spritePlacementOf({sizePixels: 64, anchor: {x: 32, y: 32}, pixelsPerTile: 32});

  expect(width).toBe(2);
  expect(height).toBe(2);
});

it("puts a picture's centre where its anchor is when the anchor is the centre", () => {
  const {offset} = spritePlacementOf({sizePixels: 64, anchor: {x: 32, y: 32}, pixelsPerTile: 32});

  expect(offset).toEqual({x: 0, y: 0});
});

it("moves the picture east when the anchor is left of its centre, so the anchor stays on the thing drawn", () => {
  // The anchor is 5 pixels left of the centre, so the centre is 5 pixels east of it: half a tile at 10 pixels a tile.
  const {offset} = spritePlacementOf({sizePixels: 64, anchor: {x: 27, y: 32}, pixelsPerTile: 10});

  expect(offset.x).toBeCloseTo(0.5);
  expect(offset.y).toBeCloseTo(0);
});

it("moves the picture north when the anchor is below its centre, since a picture's y grows downward and the arena's grows north", () => {
  const {offset} = spritePlacementOf({sizePixels: 64, anchor: {x: 32, y: 42}, pixelsPerTile: 10});

  expect(offset.x).toBeCloseTo(0);
  expect(offset.y).toBeCloseTo(1);
});

it("moves the picture south when the anchor is above its centre", () => {
  const {offset} = spritePlacementOf({sizePixels: 64, anchor: {x: 32, y: 22}, pixelsPerTile: 10});

  expect(offset.y).toBeCloseTo(-1);
});
