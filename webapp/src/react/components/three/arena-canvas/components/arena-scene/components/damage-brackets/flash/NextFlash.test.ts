import {nextFlash} from "@src/react/components/three/arena-canvas/components/arena-scene/components/damage-brackets/flash/NextFlash";
import type {Flash} from "@src/react/components/three/arena-canvas/components/arena-scene/components/damage-brackets/flash/types/Flash";
import {BURST_SECONDS} from "@src/sound/burst-window/BurstSeconds";

const NONE: Flash = {hitsSeen: 0, age: Number.POSITIVE_INFINITY};
const FRAME = 1 / 60;

it("has no flash before the first hit, and ages the nothing it has", () => {
  expect(nextFlash({flash: NONE, hits: 0, seconds: FRAME})).toEqual(NONE);
});

it("starts a flash at once, at age 0, on the frame a hit is first seen", () => {
  expect(nextFlash({flash: NONE, hits: 1, seconds: FRAME})).toEqual({hitsSeen: 1, age: 0});
});

it("ages a flash by the time each frame covers, while no hit lands", () => {
  const running: Flash = {hitsSeen: 1, age: 0.05};

  expect(nextFlash({flash: running, hits: 1, seconds: FRAME}).age).toBeCloseTo(0.05 + FRAME);
});

it("merges a hit that lands within the burst window into the flash already running, which goes on ageing", () => {
  const running: Flash = {hitsSeen: 1, age: BURST_SECONDS / 2};

  expect(nextFlash({flash: running, hits: 2, seconds: FRAME})).toEqual({hitsSeen: 2, age: BURST_SECONDS / 2 + FRAME});
});

it("starts a new flash for a hit that lands once the burst window has passed, even while the old flash still shows", () => {
  const running: Flash = {hitsSeen: 1, age: BURST_SECONDS};

  expect(nextFlash({flash: running, hits: 2, seconds: FRAME})).toEqual({hitsSeen: 2, age: 0});
});

it("does not stretch the window: hits merged into a flash do not move its start", () => {
  const merged = nextFlash({flash: {hitsSeen: 1, age: 0.08}, hits: 2, seconds: 0.03});

  expect(nextFlash({flash: merged, hits: 3, seconds: FRAME})).toEqual({hitsSeen: 3, age: 0});
});

it("makes one flash of several hits seen in the same frame", () => {
  expect(nextFlash({flash: NONE, hits: 3, seconds: FRAME})).toEqual({hitsSeen: 3, age: 0});
});
