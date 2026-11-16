import type {Player} from "@gunsmith/engine/player/types/Player";

/** The fighters a pickup may be taken by. The opponent is absent in a world that has none. */
export interface Fighters {
  player: Player;
  opponent?: Player | undefined;
}
