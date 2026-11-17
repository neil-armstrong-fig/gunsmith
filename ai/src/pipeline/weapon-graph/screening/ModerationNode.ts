import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {moderationJudge} from "@gunsmith/ai/pipeline/prompt-screening/moderation/ModerationJudge";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphStateValues";
import type {WeaponGraphUpdate} from "@gunsmith/ai/pipeline/weapon-graph/state/types/WeaponGraphUpdate";

/** Asks the cheap model whether the request is about a weapon at all, one model call, and turns it away with the judge's reason if not. */
export async function moderationNode(
  state: WeaponGraphStateValues,
  moderator: BaseChatModel,
): Promise<WeaponGraphUpdate> {
  const verdict = await moderationJudge(state.prompt, moderator);
  if (!verdict.isWeaponRequest) {
    return {nodes: ["moderation"], modelCalls: 1, rejectionReason: verdict.reason};
  }

  return {nodes: ["moderation"], modelCalls: 1};
}
