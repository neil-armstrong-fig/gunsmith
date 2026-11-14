import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {GENERATION_PROMPT} from "@gunsmith/ai/pipeline/appearance/drafting/generate/prompts/GenerationPrompt";
import {askForAppearanceDraft} from "@gunsmith/ai/pipeline/appearance/drafting/shared/model-call/AskForAppearanceDraft";
import type {AppearanceDraftReply} from "@gunsmith/ai/pipeline/appearance/drafting/shared/model-call/types/AppearanceDraftReply";
import {requestBlock} from "@gunsmith/ai/pipeline/blocks/request/RequestBlock";

/**
 * Asks the model to draw the weapon a player described: the instructions in one message, the player's words apart from them in a
 * `<request>` data block. The answer is `unknown` until `checkAppearance` has parsed it.
 */
export async function generateAppearanceDraft(prompt: string, generator: BaseChatModel): Promise<AppearanceDraftReply> {
  return askForAppearanceDraft(
    [new SystemMessage(GENERATION_PROMPT), new HumanMessage(requestBlock(prompt))],
    generator,
  );
}
