import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {askForWeaponDraft} from "@gunsmith/ai/pipeline/weapon-drafting/shared/model-call/AskForWeaponDraft";
import {GENERATION_PROMPT} from "@gunsmith/ai/pipeline/weapon-drafting/generate/prompts/GenerationPrompt";
import {requestBlock} from "@gunsmith/ai/pipeline/blocks/request/RequestBlock";

/**
 * Asks the strong model to write the weapon a player described: the instructions in one message, the player's words apart from
 * them in a `<request>` data block. The answer is `unknown` until `validate` has parsed it (`askForWeaponDraft`).
 */
export async function generateWeaponDraft(prompt: string, generator: BaseChatModel): Promise<unknown> {
  return askForWeaponDraft([new SystemMessage(GENERATION_PROMPT), new HumanMessage(requestBlock(prompt))], generator);
}
