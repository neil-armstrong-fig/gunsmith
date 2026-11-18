import {TICK_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/TickSeconds";
import type {Tick} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/types/Tick";
import type {TicksRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/types/TicksRequest";
import type {TicksState} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/types/TicksState";
import {BURST_SECONDS} from "@src/sound/burst-window/BurstSeconds";

/** How many confirmations can show at once, one for each slot the component draws them in: more than a burst of different targets needs. */
const MOST_TICKS = 6;
/** Dummies and the opponent stand still, so a mark at the same place is the same target. */
const SAME_PLACE = 0.01;

/**
 * Where the confirmations stand after one frame. Every tick ages by the frame's time and ends when its time is up. Each mark it has not taken up starts a tick
 * at age nothing, unless a tick at the same place began less than `BURST_SECONDS` ago (the sound merges a burst the same way): then it is merged into that one, which does not
 * restart. At most `MOST_TICKS` are kept, the newest. Pure: the time is the frame's own, so nothing here reads a clock.
 */
export function nextTicks({state, marks, seconds}: TicksRequest): TicksState {
  const ticks: Tick[] = state.ticks
    .map(tick => ({...tick, age: tick.age + seconds}))
    .filter(tick => tick.age < TICK_SECONDS);

  for (const mark of marks.filter(candidate => candidate.sequence > state.seen)) {
    const running = ticks.find(
      tick => Math.hypot(tick.x - mark.x, tick.y - mark.y) < SAME_PLACE && tick.age < BURST_SECONDS,
    );
    if (!running) {
      ticks.push({x: mark.x, y: mark.y, age: 0});
    }
  }

  const seen = Math.max(state.seen, ...marks.map(mark => mark.sequence));

  return {ticks: ticks.slice(-MOST_TICKS), seen};
}
