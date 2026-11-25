import type {OpponentPreRound} from "@src/durable-objects/match/pre-round/types/OpponentPreRound";
import type {OwnPreRound} from "@src/durable-objects/match/pre-round/types/OwnPreRound";
import type {ArenaHow} from "@src/durable-objects/match/pre-round/types/ArenaHow";
import type {PreRoundStage} from "@src/durable-objects/match/pre-round/types/PreRoundStage";

/**
 * What one seat is sent while the room is choosing: the stage, the seconds left (absent until both seats have sat and the clock runs),
 * the built-in arenas the room offers today (the same to both seats), its own choices, and only what it may see of the other seat's.
 * Once decided, `how` says how the arena was settled.
 */
export interface PreRoundMessage {
  kind: "preRound";
  stage: PreRoundStage;
  builtInArenas: readonly string[];
  secondsLeft?: number;
  own: OwnPreRound;
  opponent: OpponentPreRound;
  how?: ArenaHow;
}
