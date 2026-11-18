import type {Flash} from "@src/react/components/three/arena-canvas/components/arena-scene/flash/types/Flash";

/** What `nextFlash` is told about one frame. */
export interface FlashRequest {
  flash: Flash;
  /** The feedback store's `bulletHits` now. */
  hits: number;
  /** The time since the last frame, in seconds. */
  seconds: number;
}
