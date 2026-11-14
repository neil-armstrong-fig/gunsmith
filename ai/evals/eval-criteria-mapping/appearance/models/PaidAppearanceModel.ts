import {ChatAnthropic} from "@langchain/anthropic";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/tier/paid/spend/PaidSpendGuard";

const PAID_MODEL = "claude-haiku-5-5";
const KEY_FILE = ".env.local";

/**
 * Haiku 5.5 for the appearance probe, behind the spend guard. The key is read from `ANTHROPIC_API_KEY`, or loaded from
 * `ai/.env.local` (git-ignored) when it is not set; it is never printed. No `temperature`: the API refuses it for this model
 * ("`temperature` is deprecated for this model", checked 2026-11-13), so the model's own sampling decides how much trials differ.
 */
export function createPaidAppearanceModel(): ChatAnthropic {
  loadKey();

  return new ChatAnthropic({model: PAID_MODEL, maxTokens: 3000, callbacks: [paidSpendGuard()]});
}

function loadKey(): void {
  if (process.env.ANTHROPIC_API_KEY !== undefined) {
    return;
  }

  try {
    process.loadEnvFile(KEY_FILE);
  } catch {
    throw new Error(
      `No ANTHROPIC_API_KEY set, and no ${KEY_FILE} in ai/ to load it from (MANUAL-SETUP-STEPS.md step 8).`,
    );
  }

  if (process.env.ANTHROPIC_API_KEY === undefined) {
    throw new Error(`${KEY_FILE} has no ANTHROPIC_API_KEY line.`);
  }
}
