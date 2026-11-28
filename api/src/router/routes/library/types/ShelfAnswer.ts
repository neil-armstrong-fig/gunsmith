import type {ShelfLimits} from "@src/shared/accounts/types/ShelfLimits";
import type {ShelfItemAnswer} from "@src/router/routes/library/types/ShelfItemAnswer";

/** `GET /api/library`: the limits the page shows (it has none of its own) and the shelf's two spaces, each in the order saved. */
export interface ShelfAnswer {
  limits: ShelfLimits;
  weapons: ShelfItemAnswer[];
  arenas: ShelfItemAnswer[];
}
