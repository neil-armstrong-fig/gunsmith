import {closingProgress} from "@gunsmith/engine/ring/ClosingProgress";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

const ring: Ring = {
  roundSeconds: 0,
  centre: {x: 5, y: 5},
  startRadius: 10,
  timing: {startDelaySeconds: 10, closingSeconds: 20},
};

it("is nothing while the ring has not started", () => {
  expect(closingProgress(playedFor(0))).toBe(0);
  expect(closingProgress(playedFor(9.9))).toBe(0);
});

it("is nothing at the moment the ring starts", () => {
  expect(closingProgress(playedFor(10))).toBe(0);
});

it("is the share of the closing time played", () => {
  expect(closingProgress(playedFor(20))).toBeCloseTo(0.5, 12);
  expect(closingProgress(playedFor(15))).toBeCloseTo(0.25, 12);
});

it("is whole once the ring has closed", () => {
  expect(closingProgress(playedFor(30))).toBe(1);
});

it("stays whole afterwards, never beyond", () => {
  expect(closingProgress(playedFor(300))).toBe(1);
});

function playedFor(roundSeconds: number): Ring {
  return {...ring, roundSeconds};
}
