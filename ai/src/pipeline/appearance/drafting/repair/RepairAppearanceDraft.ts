import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {REPAIR_PROMPT} from "@gunsmith/ai/pipeline/appearance/drafting/repair/prompts/RepairPrompt";
import type {AppearanceRepairRequest} from "@gunsmith/ai/pipeline/appearance/drafting/repair/types/AppearanceRepairRequest";
import {askForAppearanceDraft} from "@gunsmith/ai/pipeline/appearance/drafting/shared/model-call/AskForAppearanceDraft";
import type {AppearanceDraftReply} from "@gunsmith/ai/pipeline/appearance/drafting/shared/model-call/types/AppearanceDraftReply";
import {dataBlock} from "@gunsmith/ai/pipeline/shared/blocks/DataBlock";
import {requestBlock} from "@gunsmith/ai/pipeline/shared/blocks/request/RequestBlock";

/** Long enough for a whole drawing the model got wrong (measured: about 3 KB), short enough that one wild answer cannot fill the prompt. */
const MAX_PREVIOUS_LENGTH = 4000;

/**
 * The one second try: the same request again, with the first answer and the faults the strict check found, so the model can change
 * what is wrong instead of starting over. The caller runs this at most once. The answer is `unknown` until `checkAppearance` has
 * parsed it again.
 */
export async function repairAppearanceDraft(
  request: AppearanceRepairRequest,
  generator: BaseChatModel,
): Promise<AppearanceDraftReply> {
  const messages = [new SystemMessage(REPAIR_PROMPT), new HumanMessage(requestBlock(request.prompt))];

  const previous = JSON.stringify(request.previous);
  if (previous !== undefined) {
    messages.push(new HumanMessage(dataBlock("previous", previous.slice(0, MAX_PREVIOUS_LENGTH))));
  }

  messages.push(new HumanMessage(dataBlock("problems", request.errors.map(error => `- ${error}`).join("\n"))));

  return askForAppearanceDraft(messages, generator);
}
