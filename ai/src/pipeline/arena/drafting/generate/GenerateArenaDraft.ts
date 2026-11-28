import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {requestBlock} from "@gunsmith/ai/pipeline/shared/blocks/request/RequestBlock";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/drafting/format/ArenaFormat";
import {draftingKitOf} from "@gunsmith/ai/pipeline/arena/drafting/format/DraftingKitOf";
import {askForArenaDraft} from "@gunsmith/ai/pipeline/arena/drafting/shared/model-call/AskForArenaDraft";

/**
 * Asks the strong model to write the arena a player described: the instructions in one message, the player's words apart from them
 * in a `<request>` data block. `format` is how the model is asked to describe the arena (rows or shapes). The answer is `unknown` until `validate` has parsed it (`askForArenaDraft`).
 */
export async function generateArenaDraft(
  prompt: string,
  generator: BaseChatModel,
  format: ArenaFormat,
): Promise<unknown> {
  const kit = draftingKitOf(format);

  return askForArenaDraft(
    [new SystemMessage(kit.generationPrompt), new HumanMessage(requestBlock(prompt))],
    generator,
    kit.replySchema,
  );
}
