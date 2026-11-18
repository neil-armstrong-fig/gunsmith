import type {Input} from "@gunsmith/engine/game-loop/types/Input";

/** A match to play through the simulated network: what the player asks for on each fixed step, how the network treats each frame, and how often the server writes a snapshot. */
export interface MatchPlan {
  /** What the player asks for on each step, from the first. After the last the player asks for nothing for `settleSteps` more. */
  inputs: readonly Input[];
  /** How many idle steps are played after the last input, so frames still in flight arrive and every correction has faded. */
  settleSteps: number;
  /** How many steps each frame the browser sends is held up before the server has it, one entry per frame in order (the last entry repeats). */
  upstreamDelays: readonly number[];
  /** As `upstreamDelays`, for each snapshot the server sends back. */
  downstreamDelays: readonly number[];
  /** The server writes a snapshot on every this-many steps. */
  snapshotEvery: number;
  /** The arena the match is played in, as the rows `arenaFrom` reads. */
  arenaRows: readonly string[];
}
