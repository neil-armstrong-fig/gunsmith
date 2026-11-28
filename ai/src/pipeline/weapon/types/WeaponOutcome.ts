import type {WeaponHistoryDiagnostics} from "@gunsmith/ai/pipeline/weapon/types/WeaponHistoryDiagnostics";
import type {ModelUsage} from "@gunsmith/ai/pipeline/shared/usage/types/ModelUsage";
import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcomeStatus";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";

/** The result of a weapon request. DRAFT, local to `ai/` until `build` freezes the real weapon contract in `HANDOFF.md`. */
export interface WeaponOutcome {
  status: WeaponOutcomeStatus;
  /** `unknown` on purpose: whoever reads a weapon (the game, an evaluator) parses it again rather than trusting the type. */
  weapon?: unknown;
  /**
   * What the weapon looks like, with how it was drawn (the model's own, finished by code, repaired, or the disclosed stand-in).
   * On every `created` outcome and on no other: a rejected or invalid request draws nothing. It never changes a stat.
   */
  appearance?: AppearanceOutcome;
  /** Why a request was rejected or came out invalid, in words a player may see. */
  reason?: string;
  /**
   * The graph nodes that ran, in order, so a test can see the path (the pre-check first; repair at most once). A created weapon's
   * stats nodes come first, then its drawing's, each with an `appearance.` prefix (`appearance.generate`, `appearance.fix`, ...).
   */
  nodes: string[];
  /** Model calls made, both stages together (five at most), so a test can prove a rejection cost nothing (or one call). */
  modelCalls: number; /**
   * What the models reported they used, in tokens, summed over every call of the request (moderation, generation, each repair and
   * the drawing), so a settle can price tokens and not calls. Zero for a call that reported nothing. Always set by the pipeline;
   * optional in the type until the consumers' own outcome literals carry it (HANDOFF, 2026-11-19).
   */
  usage?: ModelUsage;
  history?: WeaponHistoryDiagnostics;
}
