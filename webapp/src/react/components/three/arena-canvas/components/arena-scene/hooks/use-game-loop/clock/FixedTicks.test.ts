import {fixedTicks} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/FixedTicks";
import {MAX_FRAME_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/limits/MaxFrameSeconds";
import {TICK_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/TickSeconds";

it("owes one step for a frame exactly one step long", () => {
  expect(fixedTicks(0, TICK_SECONDS).ticks).toBe(1);
});

it("owes two steps for a frame two steps long", () => {
  expect(fixedTicks(0, TICK_SECONDS * 2).ticks).toBe(2);
});

it("owes nothing for a frame shorter than a step, and remembers the time", () => {
  const result = fixedTicks(0, TICK_SECONDS / 2);

  expect(result.ticks).toBe(0);
  expect(result.leftoverSeconds).toBeCloseTo(TICK_SECONDS / 2, 12);
});

it("adds up short frames until they make a step", () => {
  const first = fixedTicks(0, TICK_SECONDS / 2);
  const second = fixedTicks(first.leftoverSeconds, TICK_SECONDS / 2);

  expect(second.ticks).toBe(1);
});

it("caps what one long frame can owe", () => {
  expect(fixedTicks(0, 60).ticks).toBe(Math.round(MAX_FRAME_SECONDS / TICK_SECONDS));
});
