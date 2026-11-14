import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import type {BaseMessage} from "@langchain/core/messages";
import {ModelCallRecorder} from "@gunsmith/ai/pipeline/appearance/drafting/shared/model-call/recorder/ModelCallRecorder";
import {appearanceDraftReplySchema} from "@gunsmith/ai/pipeline/appearance/drafting/shared/model-call/reply/AppearanceDraftReplySchema";
import type {AppearanceDraftReply} from "@gunsmith/ai/pipeline/appearance/drafting/shared/model-call/types/AppearanceDraftReply";

/**
 * Puts the messages to the model and returns what it wrote, `unknown` and unchecked on purpose, with what the call cost. One call,
 * structured by function calling (the local model's `format` is unavailable). When the loose schema refuses the arguments
 * (LangChain throws on a field of the wrong type), the arguments as the model wrote them are returned instead, so the strict
 * check can say what is wrong and the repair can see it. Returns no answer when the model made no tool call or the call failed.
 */
export async function askForAppearanceDraft(
  messages: BaseMessage[],
  generator: BaseChatModel,
): Promise<AppearanceDraftReply> {
  const recorder = new ModelCallRecorder();
  const writer = generator.withStructuredOutput(appearanceDraftReplySchema, {method: "functionCalling"});
  let answer: unknown;

  try {
    answer = await writer.invoke(messages, {callbacks: [recorder]});
  } catch {
    answer = recorder.toolCallArguments;
  }

  return {answer, usage: {inputTokens: recorder.inputTokens, outputTokens: recorder.outputTokens}};
}
