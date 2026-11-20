import type {ModelUsage} from "@gunsmith/ai/pipeline/types/ModelUsage";
import type {ArenaOutcomeStatus} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcomeStatus";

/** The result of an arena request. DRAFT, local to `ai/` until engine and server freeze the real arena contract in `HANDOFF.md`. */
export interface ArenaOutcome {
  status: ArenaOutcomeStatus;
  /** `unknown` on purpose: whoever reads an arena (the game, an evaluator) parses it again rather than trusting the type. A built-in arena is given on `builtIn`, and none on `rejected`. */
  arena?: unknown;
  /** Why a request was rejected or fell back to a built-in arena, in words a player may see. */
  reason?: string;
  /** The credit goes back: true exactly when a built-in arena was given because the model's arena could not be used. */
  refunded: boolean;
  /** The graph nodes that ran, in order, so a test can see the path (the pre-check first; repair at most once). */
  nodes: string[];
  /** Model calls made (three at most: moderation, generation and one repair), so a test can prove a rejection cost nothing. */
  modelCalls: number; /**
   * What the models reported they used, in tokens, summed over every call of the request (moderation, generation and the repair), so
   * a settle can price tokens and not calls. Zero for a call that reported nothing. Always set by the pipeline; optional in the type
   * until the consumers' own outcome literals carry it (HANDOFF, 2026-11-19).
   */
  usage?: ModelUsage;
}
