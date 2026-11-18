import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {SeatView} from "@gunsmith/engine/seat/types/SeatView";

/**
 * The world a seat was told about, to draw and read as the game does: its own fighter, and the other fighter, shots and
 * pickup only if it was told of them (an unseen fighter is simply absent, so nothing is drawn). It has no dummies, brain or
 * events. It is a picture of what the server sent, never a world to step: only the server steps the match.
 */
export function worldOfSeatView(arena: Arena, view: SeatView): World {
  return {
    arena,
    player: view.player,
    opponent: view.opponent,
    bullets: view.bullets,
    dummies: [],
    pickup: view.pickup,
    ring: view.ring,
    match: view.match,
    round: view.round,
    elapsedSeconds: view.elapsedSeconds,
  };
}
