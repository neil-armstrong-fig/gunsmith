import type {PaidCall} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/types/PaidCall";

/** One paid request's entry in the paid call log. */
export interface PaidCallLogOptions {
  /** The JSON Lines file the entry is added to. */
  file: string;
  prompt: string;
  /** How long the whole request took, in milliseconds. */
  durationMs: number;
  /** Every paid call the request made, in order, each with its stage, tokens, stop reason and latency. */
  calls: PaidCall[];
}
