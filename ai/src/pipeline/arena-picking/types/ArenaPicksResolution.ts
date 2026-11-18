import type {ArenaPickHow} from "@gunsmith/ai/pipeline/arena-picking/types/ArenaPickHow";

/** Whose arena is played, and how it was settled. */
export interface ArenaPicksResolution {
  /** The `playerId` of the submission that won. */
  chosenPlayerId: string;
  how: ArenaPickHow;
}
