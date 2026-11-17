import type {Player} from "@gunsmith/engine/player/types/Player";

/** Two states of one fighter and how far from the first to the second: zero is the first, one the second. */
export interface BlendRequest {
  from: Player;
  to: Player;
  share: number;
}
