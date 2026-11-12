import {MAX_FRAME_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/limits/MaxFrameSeconds";
import {TICK_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/TickSeconds";
import type {TicksOwed} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/types/TicksOwed";

/**
 * Turns the time a frame took into whole fixed steps, carrying the remainder to the next frame. The simulation always
 * steps by `TICK_SECONDS`, however fast or slow the screen redraws, which is what keeps it the same on every machine.
 */
export function fixedTicks(leftoverSeconds: number, frameSeconds: number): TicksOwed {
  const availableSeconds = leftoverSeconds + Math.min(frameSeconds, MAX_FRAME_SECONDS);
  const ticks = Math.floor(availableSeconds / TICK_SECONDS + 1e-9);

  return {ticks, leftoverSeconds: Math.max(0, availableSeconds - ticks * TICK_SECONDS)};
}
