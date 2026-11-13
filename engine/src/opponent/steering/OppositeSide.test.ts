import {oppositeSide} from "@gunsmith/engine/opponent/steering/OppositeSide";

it("is the right side for the left side", () => {
  expect(oppositeSide(1)).toBe(-1);
});

it("is the left side for the right side", () => {
  expect(oppositeSide(-1)).toBe(1);
});
