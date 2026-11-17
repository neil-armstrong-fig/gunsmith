import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import type {BaseMessage} from "@langchain/core/messages";
import {arenaDraftReplySchema} from "@gunsmith/ai/pipeline/arena/arena-drafting/shared/model-call/reply/ArenaDraftReply";

/**
 * Puts the messages to the strong model and returns what it answered, `unknown` and unchecked on purpose: `validate` parses it, so a
 * value outside the limits reaches it (and the one repair) instead of throwing here. One call, structured by function calling (the
 * local model's `format` is unavailable). Returns nothing when the call fails or the answer is not an object at all; `validate`
 * reports that to `repair` like any other bad answer.
 */
export async function askForArenaDraft(messages: BaseMessage[], generator: BaseChatModel): Promise<unknown> {
  try {
    const writer = generator.withStructuredOutput(arenaDraftReplySchema, {method: "functionCalling"});

    return await writer.invoke(messages);
  } catch {
    return undefined;
  }
}
