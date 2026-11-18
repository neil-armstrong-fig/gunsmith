import {ChatAnthropic} from "@langchain/anthropic";
import {PAID_MODEL} from "@evals/eval-criteria-mapping/environment/tier/paid/PaidModel";
import {loadAnthropicKey} from "@evals/eval-criteria-mapping/environment/tier/paid/key/LoadAnthropicKey";
import {PAID_KEY_FILE} from "@evals/eval-criteria-mapping/environment/tier/paid/key/PaidKeyFile";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";

/**
 * Haiku 5.5 for the appearance probe, behind the spend guard. The key is read from `ANTHROPIC_API_KEY`, or loaded from
 * `ai/.env.local` (git-ignored) when it is not set; it is never printed. No `temperature`: the API refuses it for this model
 * ("`temperature` is deprecated for this model", checked 2026-11-13), so the model's own sampling decides how much trials differ.
 */
export function createPaidAppearanceModel(): ChatAnthropic {
  loadAnthropicKey(PAID_KEY_FILE);

  return new ChatAnthropic({model: PAID_MODEL, maxTokens: 3000, callbacks: [paidSpendGuard()]});
}
