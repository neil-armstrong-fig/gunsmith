import {BURST_SECONDS} from "@gunsmith/engine/opponent/burst/BurstSeconds";
import {isBursting} from "@gunsmith/engine/opponent/burst/IsBursting";
import {PAUSE_SECONDS} from "@gunsmith/engine/opponent/burst/PauseSeconds";

const CYCLE = BURST_SECONDS + PAUSE_SECONDS;

it("bursts at the very start of a match", () => {
  expect(isBursting(0)).toBe(true);
});

it("is still bursting just before the burst ends", () => {
  expect(isBursting(BURST_SECONDS - 0.01)).toBe(true);
});

it("pauses once the burst is over", () => {
  expect(isBursting(BURST_SECONDS)).toBe(false);
  expect(isBursting(BURST_SECONDS + 0.01)).toBe(false);
});

it("is still pausing just before the next burst", () => {
  expect(isBursting(CYCLE - 0.01)).toBe(false);
});

it("bursts again when the cycle comes round", () => {
  expect(isBursting(CYCLE)).toBe(true);
  expect(isBursting(CYCLE + BURST_SECONDS - 0.01)).toBe(true);
  expect(isBursting(CYCLE * 5 + 0.01)).toBe(true);
  expect(isBursting(CYCLE * 5 + BURST_SECONDS + 0.01)).toBe(false);
});
