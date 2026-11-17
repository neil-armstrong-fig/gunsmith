import {expect, it} from "vitest";
import {shotPlacementOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/bullets/shots/placement/ShotPlacementOf";

// The picture's centre is 0.4 tile behind its tip, which is what the manifest says for art's shot.
const BEHIND_THE_TIP = {x: -0.4, y: 0};

it("puts the centre of an eastward shot behind the bullet, along the way it flies, with no turn", () => {
  const placement = shotPlacementOf({position: {x: 5, y: 3}, direction: {x: 1, y: 0}}, BEHIND_THE_TIP);

  expect(placement.x).toBeCloseTo(4.6);
  expect(placement.y).toBeCloseTo(3);
  expect(placement.angle).toBeCloseTo(0);
});

it("turns the picture to the way the bullet flies, and keeps its tip on the bullet", () => {
  const north = shotPlacementOf({position: {x: 5, y: 3}, direction: {x: 0, y: 1}}, BEHIND_THE_TIP);
  const west = shotPlacementOf({position: {x: 5, y: 3}, direction: {x: -1, y: 0}}, BEHIND_THE_TIP);
  const south = shotPlacementOf({position: {x: 5, y: 3}, direction: {x: 0, y: -1}}, BEHIND_THE_TIP);

  expect(north.angle).toBeCloseTo(Math.PI / 2);
  expect(north.x).toBeCloseTo(5);
  expect(north.y).toBeCloseTo(2.6);

  expect(Math.abs(west.angle)).toBeCloseTo(Math.PI);
  expect(west.x).toBeCloseTo(5.4);
  expect(west.y).toBeCloseTo(3);

  expect(south.angle).toBeCloseTo(-Math.PI / 2);
  expect(south.x).toBeCloseTo(5);
  expect(south.y).toBeCloseTo(3.4);
});

it("moves the centre by a sideways offset too, to the shot's left", () => {
  const placement = shotPlacementOf({position: {x: 0, y: 0}, direction: {x: 0, y: 1}}, {x: 0, y: 0.1});

  expect(placement.x).toBeCloseTo(-0.1);
  expect(placement.y).toBeCloseTo(0);
});
