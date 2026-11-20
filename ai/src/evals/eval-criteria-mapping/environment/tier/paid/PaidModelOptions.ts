import type {AnthropicModelOptions} from "@gunsmith/ai/adapter/types/AnthropicModelOptions";
import {loadAnthropicKey} from "@evals/eval-criteria-mapping/environment/tier/paid/key/LoadAnthropicKey";
import {PAID_KEY_FILE} from "@evals/eval-criteria-mapping/environment/tier/paid/key/PaidKeyFile";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";

/**
 * What the production adapter needs to build the paid tier's models: the key, from `ANTHROPIC_API_KEY` or the git-ignored
 * `ai/.env.local` (never printed), and the one spend guard on every model (never a second: it is what adds into the one ledger and
 * remembers the failures of every model). The models themselves, their settings and **no retries** are the adapter's, so what the
 * evals measure is what the Worker will run.
 */
export function paidModelOptions(): AnthropicModelOptions {
  loadAnthropicKey(PAID_KEY_FILE);

  return {apiKey: requiredKey(), callbacks: [paidSpendGuard()]};
}

function requiredKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey === undefined) {
    throw new Error("No ANTHROPIC_API_KEY after loading the key file.");
  }

  return apiKey;
}
