import {ChatAnthropic} from "@langchain/anthropic";
import {createPaidAppearanceModel} from "@evals/eval-criteria-mapping/setups/appearance/paid/PaidAppearanceModel";
import {PAID_MODEL} from "@evals/eval-criteria-mapping/environment/tier/paid/PaidModel";
import {loadAnthropicKey} from "@evals/eval-criteria-mapping/environment/tier/paid/key/LoadAnthropicKey";
import {PAID_KEY_FILE} from "@evals/eval-criteria-mapping/environment/tier/paid/key/PaidKeyFile";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";
import type {PaidWeaponModels} from "@evals/eval-criteria-mapping/setups/weapon/paid/models/types/PaidWeaponModels";

// Far more than a weapon (about a hundred tokens) or a verdict needs. On Anthropic `maxTokens` is only a cap and costs nothing
// unused, whereas a tool call cut off by it fails to parse: moderation then fails closed and a run would report a model that
// over-rejects. The local tier's 400 and 100 were set to keep Ollama fast, and do not carry over.
const PAID_WEAPON_MAX_TOKENS = 2000;

/**
 * Haiku 5.5 for the three weapon models, the one that writes, the one that judges and the one that draws, behind the one spend guard. The key comes from
 * `ANTHROPIC_API_KEY` or the git-ignored `ai/.env.local` and is never printed. No `temperature`: the API refuses it for this model,
 * so the model's own sampling decides how much trials differ. Only this file and `ai/evals` may import `@langchain/anthropic`.
 */
export function createPaidWeaponModels(): PaidWeaponModels {
  loadAnthropicKey(PAID_KEY_FILE);

  // The same guard on both, because it is the one that adds into the one ledger and remembers the failures of either.
  const spendGuard = paidSpendGuard();

  return {
    generator: new ChatAnthropic({model: PAID_MODEL, maxTokens: PAID_WEAPON_MAX_TOKENS, callbacks: [spendGuard]}),
    moderator: new ChatAnthropic({model: PAID_MODEL, maxTokens: PAID_WEAPON_MAX_TOKENS, callbacks: [spendGuard]}),
    // Its own settings (a drawing is far longer than a weapon), the same guard: `createPaidAppearanceModel` takes `paidSpendGuard()`.
    appearanceGenerator: createPaidAppearanceModel(),
  };
}
