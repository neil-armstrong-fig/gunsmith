import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import type {BaseMessage} from "@langchain/core/messages";
import {weaponDraftReplySchema} from "@gunsmith/ai/pipeline/ask/reply/WeaponDraftReply";

/**
 * Puts the messages to the strong model and returns what it answered, `unknown` and unchecked on purpose: `validate` parses it
 * and `rate` judges it, so a value outside the limits reaches them (and the one repair) instead of throwing here. One call,
 * structured by function calling (the local model's `format` is unavailable). Returns nothing when the call fails or the answer
 * is not an object at all; `validate` reports that to `repair` like any other bad answer.
 */
export async function askForWeaponDraft(messages: BaseMessage[], generator: BaseChatModel): Promise<unknown> {
  try {
    const writer = generator.withStructuredOutput(weaponDraftReplySchema, {method: "functionCalling"});

    return await writer.invoke(messages);
  } catch {
    return undefined;
  }
}
