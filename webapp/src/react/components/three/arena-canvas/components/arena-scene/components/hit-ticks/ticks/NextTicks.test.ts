import {TICK_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/TickSeconds";
import {nextTicks} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/NextTicks";
import type {TicksState} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/types/TicksState";
import {BURST_SECONDS} from "@src/sound/burst-window/BurstSeconds";

const FRAME = 1 / 60;
const NOTHING: TicksState = {ticks: [], seen: 0};
const OPPONENT = {sequence: 1, x: 11.5, y: 4.5};
const DUMMY = {sequence: 2, x: 6.5, y: 10.5};

it("starts a tick, at age nothing, for a mark it has not seen", () => {
  expect(nextTicks({state: NOTHING, marks: [OPPONENT], seconds: FRAME})).toEqual({
    ticks: [{x: 11.5, y: 4.5, age: 0}],
    seen: 1,
  });
});

it("takes each mark once", () => {
  const first = nextTicks({state: NOTHING, marks: [OPPONENT], seconds: FRAME});
  const second = nextTicks({state: first, marks: [OPPONENT], seconds: FRAME});

  expect(second.ticks).toEqual([{x: 11.5, y: 4.5, age: FRAME}]);
});

it("does not take up a mark that was there before it began", () => {
  const state = {ticks: [], seen: 1};

  expect(nextTicks({state, marks: [OPPONENT], seconds: FRAME}).ticks).toEqual([]);
});

it("starts a tick for each of several new marks at different places", () => {
  const state = nextTicks({state: NOTHING, marks: [OPPONENT, DUMMY], seconds: FRAME});

  expect(state.ticks.map(({x, y}) => ({x, y}))).toEqual([
    {x: 11.5, y: 4.5},
    {x: 6.5, y: 10.5},
  ]);
  expect(state.seen).toBe(2);
});

it("ends a tick once its time is up", () => {
  const shown = nextTicks({state: NOTHING, marks: [OPPONENT], seconds: FRAME});

  expect(nextTicks({state: shown, marks: [OPPONENT], seconds: TICK_SECONDS - FRAME - 0.001}).ticks).toHaveLength(1);
  expect(nextTicks({state: shown, marks: [OPPONENT], seconds: TICK_SECONDS}).ticks).toEqual([]);
});

it("merges a mark at the same place inside the burst into the tick that is showing", () => {
  const shown = nextTicks({state: NOTHING, marks: [OPPONENT], seconds: FRAME});
  const again = nextTicks({state: shown, marks: [OPPONENT, {...OPPONENT, sequence: 2}], seconds: BURST_SECONDS / 2});

  expect(again.ticks).toEqual([{x: 11.5, y: 4.5, age: BURST_SECONDS / 2}]);
  expect(again.seen).toBe(2);
});

it("starts another tick for a mark at the same place once the burst has passed", () => {
  const shown = nextTicks({state: NOTHING, marks: [OPPONENT], seconds: FRAME});
  const again = nextTicks({state: shown, marks: [OPPONENT, {...OPPONENT, sequence: 2}], seconds: BURST_SECONDS});

  expect(again.ticks.map(tick => tick.age)).toEqual([BURST_SECONDS, 0]);
});

it("does not merge marks at different places, however close in time", () => {
  const shown = nextTicks({state: NOTHING, marks: [OPPONENT], seconds: FRAME});
  const again = nextTicks({state: shown, marks: [OPPONENT, {...DUMMY, sequence: 2}], seconds: FRAME});

  expect(again.ticks).toHaveLength(2);
});

it("keeps at most as many ticks as there are slots to draw them in, dropping the oldest", () => {
  const marks = Array.from({length: 8}, (_, index) => ({sequence: index + 1, x: index * 2, y: 0}));
  const state = nextTicks({state: NOTHING, marks, seconds: FRAME});

  expect(state.ticks).toHaveLength(6);
  expect(state.ticks.map(tick => tick.x)).toEqual([4, 6, 8, 10, 12, 14]);
});
