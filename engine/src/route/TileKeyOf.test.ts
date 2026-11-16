import {tileKeyOf} from "@gunsmith/engine/route/TileKeyOf";

it("is the same for every point on a tile", () => {
  expect(tileKeyOf({x: 3.1, y: 2.9})).toBe(tileKeyOf({x: 3.9, y: 2.1}));
});

it("differs between tiles, along either axis", () => {
  expect(tileKeyOf({x: 3.5, y: 2.5})).not.toBe(tileKeyOf({x: 4.5, y: 2.5}));
  expect(tileKeyOf({x: 3.5, y: 2.5})).not.toBe(tileKeyOf({x: 3.5, y: 3.5}));
});

it("never mistakes a point outside the arena for a tile inside it", () => {
  expect(tileKeyOf({x: -0.5, y: 1.5})).not.toBe(tileKeyOf({x: 0.5, y: 1.5}));
  expect(tileKeyOf({x: 12.5, y: 1.5})).not.toBe(tileKeyOf({x: 0.5, y: 2.5}));
});
