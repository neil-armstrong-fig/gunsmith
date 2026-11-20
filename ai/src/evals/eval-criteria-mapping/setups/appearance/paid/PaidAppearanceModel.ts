import type {ChatAnthropic} from "@langchain/anthropic";
import {createPaidChatModel} from "@evals/eval-criteria-mapping/environment/tier/paid/CreatePaidChatModel";

// A drawing is far longer than a weapon or a verdict, and `maxTokens` is only a cap on Anthropic.
const PAID_APPEARANCE_MAX_TOKENS = 3000;

/** Haiku 5.5 for the appearance probe, behind the spend guard and with no retries (`createPaidChatModel`). */
export function createPaidAppearanceModel(): ChatAnthropic {
  return createPaidChatModel(PAID_APPEARANCE_MAX_TOKENS);
}
