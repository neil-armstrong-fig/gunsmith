import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {arenaModerationJudge} from "@gunsmith/ai/pipeline/arena/prompt-screening/moderation/ArenaModerationJudge";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";
import type {ArenaGraphUpdate} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphUpdate";

/** Asks the cheap model whether the request is about an arena at all, one model call, and turns it away with the judge's reason if not. */
export async function moderationNode(
  state: ArenaGraphStateValues,
  moderator: BaseChatModel,
): Promise<ArenaGraphUpdate> {
  const verdict = await arenaModerationJudge(state.prompt, moderator);
  if (!verdict.isArenaRequest) {
    return {nodes: ["moderation"], modelCalls: 1, rejectionReason: verdict.reason};
  }

  return {nodes: ["moderation"], modelCalls: 1};
}
