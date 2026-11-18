import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {InputHistory} from "@src/online/prediction/history/InputHistory";

function asking(x: number): Input {
  return {direction: {x, y: 0}, firing: false, reload: false};
}

it("gives back the inputs from a step on, oldest first", () => {
  const history = new InputHistory(10);
  history.record(0, asking(0));
  history.record(1, asking(1));
  history.record(2, asking(2));

  expect(history.from(1)?.map(input => input.direction.x)).toEqual([1, 2]);
});

it("gives back nothing for a step that has not been played yet", () => {
  const history = new InputHistory(10);
  history.record(0, asking(0));

  expect(history.from(1)).toEqual([]);
  expect(history.from(5)).toEqual([]);
});

it("forgets the oldest steps past its limit, and says so when asked for one it has forgotten", () => {
  const history = new InputHistory(3);
  for (let step = 0; step < 5; step += 1) {
    history.record(step, asking(step));
  }

  expect(history.from(2)?.map(input => input.direction.x)).toEqual([2, 3, 4]);
  expect(history.from(1)).toBeUndefined();
});

it("counts the steps it holds so a caller can tell the next one", () => {
  const history = new InputHistory(10);

  expect(history.nextStep).toBe(0);
  history.record(0, asking(0));
  history.record(1, asking(0));

  expect(history.nextStep).toBe(2);
});
