import {createPaidAppearanceModel} from "@evals/eval-criteria-mapping/setups/appearance/paid/PaidAppearanceModel";
import {createPaidChatModel} from "@evals/eval-criteria-mapping/environment/tier/paid/CreatePaidChatModel";
import type {PaidWeaponModels} from "@evals/eval-criteria-mapping/setups/weapon/paid/models/types/PaidWeaponModels";

// Far more than a weapon (about a hundred tokens) or a verdict needs. On Anthropic `maxTokens` is only a cap and costs nothing
// unused, whereas a tool call cut off by it fails to parse: moderation then fails closed and a run would report a model that
// over-rejects. The local tier's 400 and 100 were set to keep Ollama fast, and do not carry over.
const PAID_WEAPON_MAX_TOKENS = 2000;

/**
 * Haiku 5.5 for the three weapon models, the one that writes, the one that judges and the one that draws, behind the one spend
 * guard and with no retries (`createPaidChatModel`, which also loads the key).
 */
export function createPaidWeaponModels(): PaidWeaponModels {
  return {
    generator: createPaidChatModel(PAID_WEAPON_MAX_TOKENS),
    moderator: createPaidChatModel(PAID_WEAPON_MAX_TOKENS),
    // Its own settings (a drawing is far longer than a weapon), the same guard.
    appearanceGenerator: createPaidAppearanceModel(),
  };
}
