import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {requestBlock} from "@gunsmith/ai/pipeline/blocks/request/RequestBlock";
import {ARENA_GENERATION_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/prompts/ArenaGenerationPrompt";
import {askForArenaDraft} from "@gunsmith/ai/pipeline/arena/arena-drafting/shared/model-call/AskForArenaDraft";

/**
 * Asks the strong model to write the arena a player described: the instructions in one message, the player's words apart from them
 * in a `<request>` data block. The answer is `unknown` until `validate` has parsed it (`askForArenaDraft`).
 */
export async function generateArenaDraft(prompt: string, generator: BaseChatModel): Promise<unknown> {
  return askForArenaDraft(
    [new SystemMessage(ARENA_GENERATION_PROMPT), new HumanMessage(requestBlock(prompt))],
    generator,
  );
}
