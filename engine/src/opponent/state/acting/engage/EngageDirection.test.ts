import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {engageDirection} from "@gunsmith/engine/opponent/state/acting/engage/EngageDirection";

const FROM = {x: 0, y: 0};

it("closes in on the player when it is beyond the far range", () => {
  const direction = engageDirection({from: FROM, to: {x: DIFFICULTY.farRange + 0.5, y: 0}, side: 1});

  expect(direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(direction.y).toBeCloseTo(0, 9);
});

it("backs away from the player when it is nearer than the near range", () => {
  const direction = engageDirection({from: FROM, to: {x: DIFFICULTY.nearRange - 0.5, y: 0}, side: 1});

  expect(direction.x).toBeCloseTo(-DIFFICULTY.speedShare, 9);
  expect(direction.y).toBeCloseTo(0, 9);
});

it("circles the player in between, on the side it is on", () => {
  const middle = (DIFFICULTY.nearRange + DIFFICULTY.farRange) / 2;

  expect(engageDirection({from: FROM, to: {x: middle, y: 0}, side: 1}).y).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(engageDirection({from: FROM, to: {x: middle, y: 0}, side: -1}).y).toBeCloseTo(-DIFFICULTY.speedShare, 9);
});

it("circles at exactly the near range and at exactly the far range", () => {
  expect(engageDirection({from: FROM, to: {x: DIFFICULTY.nearRange, y: 0}, side: 1}).x).toBeCloseTo(0, 9);
  expect(engageDirection({from: FROM, to: {x: DIFFICULTY.farRange, y: 0}, side: 1}).x).toBeCloseTo(0, 9);
});

it("closes in toward the player whichever way they lie", () => {
  const direction = engageDirection({from: {x: 2, y: 2}, to: {x: 2, y: 2 + DIFFICULTY.farRange + 3}, side: 1});

  expect(direction.x).toBeCloseTo(0, 9);
  expect(direction.y).toBeCloseTo(DIFFICULTY.speedShare, 9);
});

it("asks for nothing rather than a nonsense direction when it stands exactly on the player", () => {
  expect(engageDirection({from: {x: 3, y: 3}, to: {x: 3, y: 3}, side: 1})).toEqual({x: 0, y: 0});
});
