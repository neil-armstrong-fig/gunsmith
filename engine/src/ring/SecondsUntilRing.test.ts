import {secondsUntilRing} from "@gunsmith/engine/ring/SecondsUntilRing";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";

const ring: Ring = {
  roundSeconds: 0,
  centre: {x: 5, y: 5},
  startRadius: 10,
  timing: {startDelaySeconds: 45, closingSeconds: 30},
};

function playedFor(roundSeconds: number): Ring {
  return {...ring, roundSeconds};
}

it("is the whole start delay before any of the round is played", () => {
  expect(secondsUntilRing(playedFor(0))).toBe(45);
});

it("falls by the seconds played", () => {
  expect(secondsUntilRing(playedFor(10))).toBe(35);
});

it("is nothing at the moment the ring starts", () => {
  expect(secondsUntilRing(playedFor(45))).toBe(0);
});

it("stays at nothing once the ring has started, never going below", () => {
  expect(secondsUntilRing(playedFor(75))).toBe(0);
});

it("is the ring's own start delay, so a page can ask for a shorter one", () => {
  const quick: Ring = {...ring, timing: {startDelaySeconds: 2, closingSeconds: 6}};

  expect(secondsUntilRing(quick)).toBe(2);
});
