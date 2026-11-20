import type {FighterShot} from "@gunsmith/engine/game-loop/fighter/types/FighterShot";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What `PlayStep` knows of one fighter's step when it asks what noise they made. */
export interface NoiseRequest {
  /** Where the fighter stood before the step. */
  before: Point;
  /** Their turn: switched, reloaded, walked and turned. */
  turn: FighterTurn;
  /** Their turn after the trigger was judged: whether a bullet left the weapon. */
  shot: FighterShot;
  /** Game time at the start of the step, in seconds. */
  elapsedSeconds: number;
  /** The game time the step covers. */
  seconds: number;
  /** Where the weapon lay that they took in this step, or `undefined` when they took none. */
  tookPickupAt: Point | undefined;
}
