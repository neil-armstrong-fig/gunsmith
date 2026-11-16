import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/types/WeaponOutcomeStatus";

/** The result of a weapon request. DRAFT, local to `ai/` until `build` freezes the real weapon contract in `HANDOFF.md`. */
export interface WeaponOutcome {
  status: WeaponOutcomeStatus;
  /** `unknown` on purpose: whoever reads a weapon (the game, an evaluator) parses it again rather than trusting the type. */
  weapon?: unknown;
  /** Why a request was rejected or came out invalid, in words a player may see. */
  reason?: string;
  /** The graph nodes that ran, in order, so a test can see the path (the pre-check first; repair at most once). */
  nodes: string[];
  /** Model calls made, so a test can prove a rejection cost nothing (or one call). */
  modelCalls: number;
}
