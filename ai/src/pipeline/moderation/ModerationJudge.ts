import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {moderationVerdictSchema} from "@gunsmith/ai/pipeline/moderation/ModerationVerdict";
import type {ModerationVerdict} from "@gunsmith/ai/pipeline/moderation/ModerationVerdict";
import {MODERATION_PROMPT} from "@gunsmith/ai/pipeline/moderation/prompts/ModerationPrompt";
import {requestBlock} from "@gunsmith/ai/pipeline/request/RequestBlock";
import {UNAVAILABLE_VERDICT} from "@gunsmith/ai/pipeline/moderation/unavailable/UnavailableVerdict";

/**
 * Asks the cheap model whether a request is about a weapon at all: one call, structured by function calling (the local model's
 * `format` is unavailable), the answer `unknown` until zod has parsed it. Any failure, a throw or a bad answer, is a closed verdict.
 */
export async function moderationJudge(prompt: string, moderator: BaseChatModel): Promise<ModerationVerdict> {
  try {
    const judge = moderator.withStructuredOutput(moderationVerdictSchema, {method: "functionCalling"});
    const answer: unknown = await judge.invoke([
      new SystemMessage(MODERATION_PROMPT),
      new HumanMessage(requestBlock(prompt)),
    ]);

    const verdict = moderationVerdictSchema.safeParse(answer);
    if (!verdict.success) {
      return UNAVAILABLE_VERDICT;
    }

    return verdict.data;
  } catch {
    return UNAVAILABLE_VERDICT;
  }
}
