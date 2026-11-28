import type {World} from "@gunsmith/engine/game-loop/types/World";
import {mirrorSeats} from "@gunsmith/engine/seat/mirroring/MirrorSeats";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {SeatView} from "@gunsmith/engine/seat/types/SeatView";
import {visibleToSeat} from "@gunsmith/engine/seat/visibility/VisibleToSeat";

/**
 * What `seat` may be told about `world`: its own fighter, and the other fighter, the shots and the pickup only where
 * `visibleToSeat` says it sees them, so a hidden one is not in the answer at all (an absent field, not a flag). The
 * closing ring is told to everyone. The second seat's view is written from its own side (`mirrorSeats`), so each seat is
 * the `player` of what it is told. What happened to the seat itself in the step (`events`: its own damage, hits, pickup, refused
 * trigger, and the direction of the other fighter's shot) is told, never what happened to the other seat. Dummies and brains are
 * not told: they are the server's alone.
 */
export function viewOfSeat(world: World, seat: Seat): SeatView {
  const seen = visibleToSeat(world, seat);
  const own = seat === "first" ? world : mirrorSeats(world);

  return {
    player: own.player,
    opponent: seen.opponent ? own.opponent : undefined,
    bullets: own.bullets.filter((_bullet, index) => seen.bullets[index]),
    pickup: seen.pickup ? own.pickup : undefined,
    ring: own.ring,
    match: own.match,
    round: own.round,
    elapsedSeconds: own.elapsedSeconds,
    events: own.events,
  };
}
