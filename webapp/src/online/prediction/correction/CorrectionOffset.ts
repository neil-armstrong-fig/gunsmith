import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {CorrectionRequest} from "@src/online/prediction/correction/types/CorrectionRequest";

/** The most the shown place may differ from the new prediction, in tiles, and still be eased into it; any more and the player is put there at once. A tunable. */
const LARGEST_EASED_DIFFERENCE = 1;

/**
 * What to add to a new prediction so the player is still drawn where they were a moment ago, to be faded away step by step (`fadedOffset`):
 * a small disagreement with the server is slid out of sight, not shown as a jump. A large one (a wall hit that the browser had not seen,
 * a tab that was in the background) is no use to ease, so there is no offset and the player appears where the prediction says.
 */
export function correctionOffset(request: CorrectionRequest): Point {
  const {shown, target} = request;
  const difference = {x: shown.x - target.x, y: shown.y - target.y};

  if (Math.hypot(difference.x, difference.y) > LARGEST_EASED_DIFFERENCE) {
    return {x: 0, y: 0};
  }

  return difference;
}
