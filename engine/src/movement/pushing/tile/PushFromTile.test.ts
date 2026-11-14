import {pushFromTile} from "@gunsmith/engine/movement/pushing/tile/PushFromTile";

const TILE = {x: 2, y: 2};
const RADIUS = 0.4;

it("asks for nothing from a circle clear of the tile", () => {
  expect(pushFromTile({x: 0.5, y: 0.5}, TILE, RADIUS)).toBeUndefined();
});

it("asks for nothing from a circle that only touches the tile", () => {
  expect(pushFromTile({x: 1.5, y: 2.5}, TILE, 0.5)).toBeUndefined();
});

it("pushes a circle that overlaps a face straight away from it, by the overlap", () => {
  const push = pushFromTile({x: 1.8, y: 2.5}, TILE, RADIUS);

  expect(push?.x).toBeCloseTo(-0.2, 9);
  expect(push?.y).toBeCloseTo(0, 9);
});

it("pushes a circle that overlaps a corner along the line from the corner to its centre", () => {
  const centre = {x: 1.9, y: 1.9};
  const push = pushFromTile(centre, TILE, RADIUS);
  const overlap = RADIUS - Math.hypot(0.1, 0.1);

  expect(push?.x).toBeCloseTo(-overlap * Math.SQRT1_2, 9);
  expect(push?.y).toBeCloseTo(-overlap * Math.SQRT1_2, 9);
});

it("leaves a tile by its nearest side when the centre is inside it", () => {
  const push = pushFromTile({x: 2.2, y: 2.5}, TILE, RADIUS);

  expect(push?.x).toBeCloseTo(-(0.2 + RADIUS), 9);
  expect(push?.y).toBe(0);
});
