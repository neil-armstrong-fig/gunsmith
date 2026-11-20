import {ChatAnthropic} from "@langchain/anthropic";
import {PAID_MODEL} from "@evals/eval-criteria-mapping/environment/tier/paid/PaidModel";
import {loadAnthropicKey} from "@evals/eval-criteria-mapping/environment/tier/paid/key/LoadAnthropicKey";
import {PAID_KEY_FILE} from "@evals/eval-criteria-mapping/environment/tier/paid/key/PaidKeyFile";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";

/**
 * Haiku 5.5 behind the one spend guard, for every paid model of every domain. The key comes from `ANTHROPIC_API_KEY` or the
 * git-ignored `ai/.env.local` and is never printed. No `temperature`: the API refuses it for this model, so the model's own sampling
 * decides how much trials differ. **No retries (decided 2026-11-19):** LangChain's own caller retries a failed call up to 6 times,
 * with backoff, and the guard sees only the call that finally finishes, so the ledger, `modelCalls` and the log would undercount
 * attempts and the waiting would hide in the latency. A transient 429 or 529 now fails the run in words instead (`runPaidRequest`).
 * Only this file and `ai/evals` may import `@langchain/anthropic`.
 */
export function createPaidChatModel(maxTokens: number): ChatAnthropic {
  loadAnthropicKey(PAID_KEY_FILE);

  return new ChatAnthropic({model: PAID_MODEL, maxTokens, maxRetries: 0, callbacks: [paidSpendGuard()]});
}
