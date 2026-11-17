import {correctionOffset} from "@src/online/prediction/correction/CorrectionOffset";

it("is how far the shown place is from the new prediction, for a small difference, so the player is not moved at once", () => {
  expect(correctionOffset({shown: {x: 5.3, y: 4}, target: {x: 5, y: 4.1}})).toEqual({
    x: expect.closeTo(0.3),
    y: expect.closeTo(-0.1),
  });
});

it("is nothing for a large difference: the player is put where the server says, not dragged there", () => {
  expect(correctionOffset({shown: {x: 7, y: 4}, target: {x: 5, y: 4}})).toEqual({x: 0, y: 0});
});

it("counts a difference just under a tile as small and one just over as large", () => {
  expect(correctionOffset({shown: {x: 5.99, y: 4}, target: {x: 5, y: 4}}).x).toBeCloseTo(0.99);
  expect(correctionOffset({shown: {x: 6.01, y: 4}, target: {x: 5, y: 4}}).x).toBe(0);
});

it("measures the difference as a distance, not along one axis", () => {
  expect(correctionOffset({shown: {x: 5.8, y: 4.8}, target: {x: 5, y: 4}})).toEqual({x: 0, y: 0});
});
