import fc from "fast-check";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {InputHistory} from "@src/online/prediction/history/InputHistory";

/**
 * What must hold for any limit, any number of recorded steps and any step asked for, not only the ones someone wrote down.
 * `InputHistory.test.ts` says what the history gives back in particular cases; this puts random ones through it. When a property fails,
 * fast-check shrinks the case and prints a seed to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("remembers exactly the steps it was given, the last few, and says so when asked for one it has forgotten", () => {
  fc.assert(fc.property(limits(), recordedSteps(), askedSteps(), expectTheLastFewAndNoMore), {numRuns: RUNS});
});

/** Each step is recorded with its own number as the walk's east part, so what comes back says which steps it is. */
function expectTheLastFewAndNoMore(limit: number, recorded: number, asked: number): void {
  const history = new InputHistory(limit);
  const model: number[] = [];
  for (let step = 0; step < recorded; step += 1) {
    history.record(step, asking(step));
    model.push(step);
  }

  const oldest = Math.max(0, recorded - limit);
  const from = history.from(asked);

  if (asked < oldest) {
    expect(from).toBeUndefined();
    return;
  }

  expect(from?.map(input => input.direction.x)).toEqual(model.slice(asked));
  expect(history.nextStep).toBe(recorded);
}

function asking(x: number): Input {
  return {direction: {x, y: 0}, firing: false, reload: false};
}

function limits(): fc.Arbitrary<number> {
  return fc.integer({min: 1, max: 30});
}

function recordedSteps(): fc.Arbitrary<number> {
  return fc.integer({min: 0, max: 80});
}

function askedSteps(): fc.Arbitrary<number> {
  return fc.integer({min: 0, max: 100});
}
