import type {TicksState} from "@src/react/components/three/arena-canvas/components/arena-scene/components/hit-ticks/ticks/types/TicksState";
import type {HitMark} from "@src/store/feedback/types/HitMark";

/** What `nextTicks` is told about one frame. */
export interface TicksRequest {
  state: TicksState;
  /** The store's latest marks, oldest first. */
  marks: readonly HitMark[];
  /** The game time the frame covered. */
  seconds: number;
}
