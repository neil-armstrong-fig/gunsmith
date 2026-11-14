import {pushOutFromInside} from "@gunsmith/engine/movement/pushing/tile/inside/PushOutFromInside";

const TILE = {x: 1, y: 1};
const RADIUS = 0.4;

it("leaves by the west side when the centre is nearest it", () => {
  const push = pushOutFromInside({x: 1.2, y: 1.5}, TILE, RADIUS);

  expect(push.x).toBeCloseTo(-(0.2 + RADIUS), 9);
  expect(push.y).toBe(0);
});

it("leaves by the east side when the centre is nearest it", () => {
  const push = pushOutFromInside({x: 1.8, y: 1.5}, TILE, RADIUS);

  expect(push.x).toBeCloseTo(0.2 + RADIUS, 9);
  expect(push.y).toBe(0);
});

it("leaves by the south side when the centre is nearest it", () => {
  const push = pushOutFromInside({x: 1.5, y: 1.2}, TILE, RADIUS);

  expect(push.x).toBe(0);
  expect(push.y).toBeCloseTo(-(0.2 + RADIUS), 9);
});

it("leaves by the north side when the centre is nearest it", () => {
  const push = pushOutFromInside({x: 1.5, y: 1.8}, TILE, RADIUS);

  expect(push.x).toBe(0);
  expect(push.y).toBeCloseTo(0.2 + RADIUS, 9);
});
