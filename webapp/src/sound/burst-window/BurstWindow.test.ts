import {BURST_SECONDS} from "@src/sound/burst-window/BurstSeconds";
import {BurstWindow} from "@src/sound/burst-window/BurstWindow";
import type {BurstStep} from "@src/sound/burst-window/types/BurstStep";

const TICK = 1 / 60;
const TRIGGER: BurstStep = {triggered: true, round: "playing", seconds: TICK};
const QUIET: BurstStep = {triggered: false, round: "playing", seconds: TICK};
const STEPS_IN_BURST = Math.round(BURST_SECONDS / TICK);

it("opens at once for the first trigger", () => {
  expect(opensOf([TRIGGER])).toEqual([0]);
});

it("does not open for a step with nothing in it", () => {
  expect(opensOf([QUIET, QUIET])).toEqual([]);
});

it("merges a second trigger inside the burst into the first", () => {
  expect(opensOf([TRIGGER, ...quiet(STEPS_IN_BURST - 2), TRIGGER])).toEqual([0]);
});

it("opens again for a trigger once the burst has passed", () => {
  expect(opensOf([TRIGGER, ...quiet(STEPS_IN_BURST - 1), TRIGGER])).toEqual([0, STEPS_IN_BURST]);
});

it("does not stretch the burst by the triggers it merged", () => {
  const steps = [TRIGGER, ...quiet(STEPS_IN_BURST - 2), TRIGGER, ...quiet(1), TRIGGER];

  expect(opensOf(steps)).toEqual([0, STEPS_IN_BURST + 1]);
});

it("opens for a trigger that ends the round, and for nothing after it", () => {
  const fatal: BurstStep = {...TRIGGER, round: "lost"};
  const after: BurstStep = {...QUIET, round: "lost"};

  expect(opensOf([fatal, after, {...after, triggered: true}])).toEqual([0, 2]);
});

it("opens for the first trigger of a new round straight away, though the last round ended inside a burst", () => {
  const fatal: BurstStep = {...TRIGGER, round: "lost"};

  expect(opensOf([TRIGGER, fatal, {...QUIET, round: "lost"}, TRIGGER])).toEqual([0, 3]);
});

/** Runs one step per request and says which of them opened a burst, by position. */
function opensOf(steps: readonly BurstStep[]): number[] {
  const window = new BurstWindow();

  return steps.flatMap((step, index) => {
    if (window.opens(step)) {
      return [index];
    }

    return [];
  });
}

/** `count` quiet steps. */
function quiet(count: number): BurstStep[] {
  return Array.from({length: count}, () => QUIET);
}
