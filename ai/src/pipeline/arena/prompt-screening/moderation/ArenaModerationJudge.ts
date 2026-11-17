import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {requestBlock} from "@gunsmith/ai/pipeline/blocks/request/RequestBlock";
import {ARENA_MODERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/prompt-screening/moderation/prompts/ArenaModerationPrompt";
import {arenaModerationVerdictSchema} from "@gunsmith/ai/pipeline/arena/prompt-screening/moderation/verdict/ArenaModerationVerdict";
import type {ArenaModerationVerdict} from "@gunsmith/ai/pipeline/arena/prompt-screening/moderation/verdict/ArenaModerationVerdict";
import {UNAVAILABLE_ARENA_VERDICT} from "@gunsmith/ai/pipeline/arena/prompt-screening/moderation/verdict/unavailable/UnavailableArenaVerdict";

/**
 * Asks the cheap model whether a request is about an arena at all: one call, structured by function calling (the local model's
 * `format` is unavailable), the answer `unknown` until zod has parsed it. Any failure, a throw or a bad answer, is a closed verdict.
 */
export async function arenaModerationJudge(prompt: string, moderator: BaseChatModel): Promise<ArenaModerationVerdict> {
  try {
    const judge = moderator.withStructuredOutput(arenaModerationVerdictSchema, {method: "functionCalling"});
    const answer: unknown = await judge.invoke([
      new SystemMessage(ARENA_MODERATION_PROMPT),
      new HumanMessage(requestBlock(prompt)),
    ]);

    const verdict = arenaModerationVerdictSchema.safeParse(answer);
    if (!verdict.success) {
      return UNAVAILABLE_ARENA_VERDICT;
    }

    return verdict.data;
  } catch {
    return UNAVAILABLE_ARENA_VERDICT;
  }
}
