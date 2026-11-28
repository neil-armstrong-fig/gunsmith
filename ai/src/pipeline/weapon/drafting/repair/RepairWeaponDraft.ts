import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {dataBlock} from "@gunsmith/ai/pipeline/shared/blocks/DataBlock";
import {askForWeaponDraft} from "@gunsmith/ai/pipeline/weapon/drafting/shared/model-call/AskForWeaponDraft";
import {requestBlock} from "@gunsmith/ai/pipeline/shared/blocks/request/RequestBlock";
import {REPAIR_PROMPT} from "@gunsmith/ai/pipeline/weapon/drafting/repair/prompts/RepairPrompt";
import type {RepairRequest} from "@gunsmith/ai/pipeline/weapon/drafting/repair/types/RepairRequest";

const MAX_PREVIOUS_LENGTH = 600;

/**
 * The one second try: the same request again, with the first answer and the faults `validate` or `rate` found, so the model can
 * change what is wrong instead of starting over (measured 2026-11-12: shown only the faults, it re-derived a whole new weapon and
 * overshot another limit). The caller runs this at most once and counts it as a model call. The answer is `unknown` until
 * `validate` has parsed it again.
 */
export async function repairWeaponDraft(request: RepairRequest, generator: BaseChatModel): Promise<unknown> {
  const messages = [new SystemMessage(REPAIR_PROMPT), new HumanMessage(requestBlock(request.prompt))];

  const previous = previousBlock(request.previous);
  if (previous !== undefined) {
    messages.push(new HumanMessage(previous));
  }

  messages.push(new HumanMessage(dataBlock("problems", request.errors.map(error => `- ${error}`).join("\n"))));

  return askForWeaponDraft(messages, generator);
}

/** The first answer as shortened JSON in its data block, or nothing when the model gave no answer to show. */
function previousBlock(previous: unknown): string | undefined {
  const text = JSON.stringify(previous);
  if (text === undefined) {
    return undefined;
  }

  return dataBlock("previous", text.slice(0, MAX_PREVIOUS_LENGTH));
}
