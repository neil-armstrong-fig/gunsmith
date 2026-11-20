import {panOfSector} from "@src/sound/spatial/PanOfSector";

it("puts east wholly in the right ear and west wholly in the left", () => {
  expect(panOfSector(2)).toBe(1);
  expect(panOfSector(6)).toBe(-1);
});

it("puts north and south in the middle, where two ears cannot tell them apart", () => {
  expect(panOfSector(0)).toBe(0);
  expect(panOfSector(4)).toBe(0);
});

it("puts a diagonal half way between the middle and its side, equal for the two diagonals on one side", () => {
  expect(panOfSector(1)).toBeCloseTo(Math.SQRT1_2, 12);
  expect(panOfSector(3)).toBe(panOfSector(1));
  expect(panOfSector(5)).toBeCloseTo(-Math.SQRT1_2, 12);
  expect(panOfSector(7)).toBe(panOfSector(5));
});

it("puts a sector that is not one of the eight in the middle rather than guessing a side", () => {
  expect(panOfSector(8)).toBe(0);
  expect(panOfSector(-1)).toBe(0);
});
