import type {ArenaProblemKind} from "@gunsmith/engine/arena/validation/types/ArenaProblemKind";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** One thing wrong with an arena, with a sentence that says it plainly enough to show a player or to hand back to the AI. */
export interface ArenaProblem {
  kind: ArenaProblemKind;
  reason: string;
  /** The middle of the tile to look at, or `undefined` when the problem is not about any one tile. */
  tile: Point | undefined;
}
