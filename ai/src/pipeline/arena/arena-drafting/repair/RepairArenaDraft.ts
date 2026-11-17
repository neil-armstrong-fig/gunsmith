import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {dataBlock} from "@gunsmith/ai/pipeline/blocks/DataBlock";
import {requestBlock} from "@gunsmith/ai/pipeline/blocks/request/RequestBlock";
import {ARENA_REPAIR_PROMPT} from "@gunsmith/ai/pipeline/arena/arena-drafting/repair/prompts/ArenaRepairPrompt";
import {askForArenaDraft} from "@gunsmith/ai/pipeline/arena/arena-drafting/shared/model-call/AskForArenaDraft";
import type {ArenaRepairRequest} from "@gunsmith/ai/pipeline/arena/arena-drafting/repair/types/ArenaRepairRequest";

// A whole arena is up to thirty rows of forty characters, so the first answer is shown in full up to this many characters.
const MAX_PREVIOUS_LENGTH = 2500;

/**
 * The one second try: the same request again, with the first answer and the faults `validate` found, so the model can change what
 * is wrong instead of starting over. The caller runs this at most once and counts it as a model call. The answer is `unknown` until
 * `validate` has parsed it again.
 */
export async function repairArenaDraft(request: ArenaRepairRequest, generator: BaseChatModel): Promise<unknown> {
  const messages = [new SystemMessage(ARENA_REPAIR_PROMPT), new HumanMessage(requestBlock(request.prompt))];

  const previous = previousBlock(request.previous);
  if (previous !== undefined) {
    messages.push(new HumanMessage(previous));
  }

  messages.push(new HumanMessage(dataBlock("problems", request.errors.map(error => `- ${error}`).join("\n"))));

  return askForArenaDraft(messages, generator);
}

/** The first answer as shortened JSON in its data block, or nothing when the model gave no answer to show. */
function previousBlock(previous: unknown): string | undefined {
  const text = JSON.stringify(previous);
  if (text === undefined) {
    return undefined;
  }

  return dataBlock("previous", text.slice(0, MAX_PREVIOUS_LENGTH));
}
