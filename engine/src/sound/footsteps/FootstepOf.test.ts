import {FOOTSTEP_INTERVAL_SECONDS} from "@gunsmith/engine/sound/footsteps/cadence/FootstepIntervalSeconds";
import {footstepOf} from "@gunsmith/engine/sound/footsteps/FootstepOf";
import type {StepRequest} from "@gunsmith/engine/sound/footsteps/types/StepRequest";

const TICK = 1 / 60;

it("lands on the first moving tick", () => {
  expect(footstepOf(walking({}))).toEqual({elapsedSeconds: 0, landed: true});
});

it("lands at the next footfall after continued upright movement", () => {
  expect(
    footstepOf(walking({previous: {elapsedSeconds: FOOTSTEP_INTERVAL_SECONDS - 2 * TICK, landed: false}}))?.landed,
  ).toBe(false);
  expect(
    footstepOf(walking({previous: {elapsedSeconds: FOOTSTEP_INTERVAL_SECONDS - TICK / 2, landed: false}}))?.landed,
  ).toBe(true);
});

it("clears progress when movement stops, even with tiny position corrections", () => {
  expect(
    footstepOf(
      walking({
        after: {x: 5.00000001, y: 5},
        previous: {elapsedSeconds: FOOTSTEP_INTERVAL_SECONDS - TICK / 2, landed: false},
      }),
    ),
  ).toBeUndefined();
});

it("clears progress while crouched", () => {
  expect(
    footstepOf(
      walking({crouching: true, previous: {elapsedSeconds: FOOTSTEP_INTERVAL_SECONDS - TICK / 2, landed: false}}),
    ),
  ).toBeUndefined();
});

function walking(changes: Partial<StepRequest>): StepRequest {
  return {
    before: {x: 5, y: 5},
    after: {x: 5.1, y: 5},
    crouching: false,
    previous: undefined,
    seconds: TICK,
    ...changes,
  };
}
