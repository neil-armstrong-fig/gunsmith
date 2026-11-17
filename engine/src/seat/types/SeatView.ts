import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Match} from "@gunsmith/engine/match/types/Match";
import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";
import type {Player} from "@gunsmith/engine/player/types/Player";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/**
 * Everything one seat of a match may be told about the world, and nothing else: the server sends exactly this, so a
 * fighter, shot or pickup the seat cannot see is not in it and cannot be recovered from what is sent. Plain data, written
 * from the seat's own side (the seat is the `player`, the other fighter the `opponent`). The arena is not here: its layout
 * is not secret and is sent once, when the seat joins.
 */
export interface SeatView {
  /** The seat's own fighter, in full. */
  player: Player;
  /** The other fighter. Absent when this seat cannot see it. */
  opponent?: Player | undefined;
  /** The shots in the air that this seat's own side fired, or that it can see. */
  bullets: readonly Bullet[];
  /** The weapon lying in the arena, when this seat can see it. */
  pickup?: Pickup | undefined;
  /** The closing ring: everyone can see where it is. */
  ring?: Ring | undefined;
  /** The best-of-three, scored from this seat's side. */
  match?: Match | undefined;
  /** Whether the round is still being fought, or has been won or lost by this seat. */
  round: RoundState;
  /** Game time since the round began, in seconds. */
  elapsedSeconds: number;
}
