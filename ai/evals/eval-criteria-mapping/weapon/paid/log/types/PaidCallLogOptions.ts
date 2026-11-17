import type {PaidCall} from "@evals/eval-criteria-mapping/tier/paid/spend/types/PaidCall";

/** One weapon request's entry in the paid call log. */
export interface PaidCallLogOptions {
  /** The JSON Lines file the entry is added to. */
  file: string;
  prompt: string;
  /** How long the whole request took, in milliseconds. */
  durationMs: number;
  /** How many of the calls were the stats stage's (moderation, generation, its repair); the rest drew the weapon. */
  statsCalls: number;
  /** Every paid call the request made, in order. */
  calls: PaidCall[];
}
