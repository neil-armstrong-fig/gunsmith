import type {Tick} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/types/Tick";

/** What the ticks have to remember between frames. */
export interface TicksState {
  /** The confirmations showing now, oldest first. */
  ticks: readonly Tick[];
  /** The number of the latest mark already taken up, so each mark is taken once. */
  seen: number;
}
