import type {LandedHit} from "@gunsmith/engine/bullet/types/LandedHit";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";

/**
 * One hit for each of the opponent's bullets that landed on a fighter, in the order of the meetings. It is a hit on "the opponent" as
 * the shooter sees it, so the same rule that judges the player's hits can judge it from the opponent's side (`mirrorSeats`). The
 * opponent's bullets pass through dummies.
 */
export function landedHitsOfOpponent(meetings: readonly Meeting[]): LandedHit[] {
  return meetings
    .filter(({bullet, contact}) => bullet.shooter === "opponent" && contact === "fighter")
    .map((): LandedHit => ({on: "opponent", dummyIndex: undefined}));
}
