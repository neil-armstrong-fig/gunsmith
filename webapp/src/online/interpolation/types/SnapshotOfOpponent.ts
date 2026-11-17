import type {Player} from "@gunsmith/engine/player/types/Player";

/** What one snapshot said of the other fighter: when the server wrote it (its game time), and the fighter if it was told of them. */
export interface SnapshotOfOpponent {
  elapsedSeconds: number;
  opponent: Player | undefined;
}
