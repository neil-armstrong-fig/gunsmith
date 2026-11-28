import type {World} from "@gunsmith/engine/game-loop/types/World";
import {mirrorSeats} from "@gunsmith/engine/seat/mirroring/MirrorSeats";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";
import type {VisibleToPlayer} from "@gunsmith/engine/vision/types/VisibleToPlayer";

/**
 * What a seat sees in `world`: for the first, exactly what the player sees (`visibleToPlayer`); for the second, the same
 * rule applied to the world seen from its side (`mirrorSeats`), so there is one sight rule and the server's snapshot for
 * each person is filtered by it. A world with no second fighter shows the second seat nothing: it has no one to see
 * through, so its pickup and dummies are not listed as seen either.
 */
export function visibleToSeat(world: World, seat: Seat): VisibleToPlayer {
  if (seat === "first") {
    return visibleToPlayer(world);
  }
  if (!world.opponent) {
    return {opponent: false, pickup: false, dummies: [], bullets: []};
  }

  return visibleToPlayer(mirrorSeats(world));
}
