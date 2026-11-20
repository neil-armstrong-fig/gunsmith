import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";
import {isFootfall} from "@gunsmith/engine/sound/footsteps/IsFootfall";
import {STRIDE_TILES} from "@gunsmith/engine/sound/footsteps/StrideTiles";
import type {StepRequest} from "@gunsmith/engine/sound/footsteps/types/StepRequest";

const SECONDS_PER_STRIDE = STRIDE_TILES / PLAYER_SPEED;
const TICK = 1 / 60;

it("is a footfall in the step that walks across a stride's end", () => {
  expect(isFootfall(walking({elapsedSeconds: SECONDS_PER_STRIDE - TICK / 2}))).toBe(true);
});

it("is not a footfall in a walking step that stays inside a stride", () => {
  expect(isFootfall(walking({elapsedSeconds: SECONDS_PER_STRIDE / 2}))).toBe(false);
});

it("is not a footfall while standing still, however the clock stands", () => {
  expect(isFootfall(walking({elapsedSeconds: SECONDS_PER_STRIDE - TICK / 2, after: {x: 5, y: 5}}))).toBe(false);
});

it("is not a footfall while crouched, which is silent", () => {
  expect(isFootfall(walking({elapsedSeconds: SECONDS_PER_STRIDE - TICK / 2, crouching: true}))).toBe(false);
});

it("is a footfall at every stride of a walk, as many as strides walked", () => {
  // A quarter of a step off the clock's whole numbers, so no stride ends exactly where a step does and floating point cannot decide it.
  const offset = TICK / 4;
  let footfalls = 0;
  const ticks = 600;
  for (let tick = 0; tick < ticks; tick += 1) {
    footfalls += Number(isFootfall(walking({elapsedSeconds: tick * TICK + offset})));
  }

  expect(footfalls).toBe(Math.floor((ticks * TICK + offset) / SECONDS_PER_STRIDE));
});

function walking(changes: Partial<StepRequest>): StepRequest {
  return {before: {x: 5, y: 5}, after: {x: 5.1, y: 5}, crouching: false, elapsedSeconds: 0, seconds: TICK, ...changes};
}
