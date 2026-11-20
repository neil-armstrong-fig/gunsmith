import type {FighterShot} from "@gunsmith/engine/game-loop/fighter/types/FighterShot";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What `PlayStep` knows of one fighter's step when it asks what noise they made. */
export interface NoiseRequest {
  /** Their turn after the trigger was judged. */
  shot: FighterShot;
  /** Whether their foot landed in this step. */
  footfall: boolean;
  /** Where the weapon lay that they took in this step, or `undefined` when they took none. */
  tookPickupAt: Point | undefined;
}
