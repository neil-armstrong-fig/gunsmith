import type {PositionSample} from "@src/dsl/gunsmith/components/room/components/smoothness/playwright/movement/types/PositionSample";

/** Where a page drew the fighters on each frame, on the browser's own clock: the player always, the other fighter only on frames it was drawn. */
export interface ShownSamples {
  player: PositionSample[];
  opponent: PositionSample[];
}
