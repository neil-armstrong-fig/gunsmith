import {RING_START_DELAY_SECONDS} from "@gunsmith/engine/ring/countdown/RingStartDelaySeconds";
import {secondsUntilRing} from "@gunsmith/engine/ring/SecondsUntilRing";

it("is the whole start delay before any of the round is played", () => {
  expect(secondsUntilRing({roundSeconds: 0})).toBe(RING_START_DELAY_SECONDS);
});

it("falls by the seconds played", () => {
  expect(secondsUntilRing({roundSeconds: 10})).toBe(RING_START_DELAY_SECONDS - 10);
});

it("is nothing at the moment the ring starts", () => {
  expect(secondsUntilRing({roundSeconds: RING_START_DELAY_SECONDS})).toBe(0);
});

it("stays at nothing once the ring has started, never going below", () => {
  expect(secondsUntilRing({roundSeconds: RING_START_DELAY_SECONDS + 30})).toBe(0);
});
