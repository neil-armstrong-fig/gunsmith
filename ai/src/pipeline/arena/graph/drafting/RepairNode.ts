import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/drafting/format/ArenaFormat";
import {repairArenaDraft} from "@gunsmith/ai/pipeline/arena/drafting/repair/RepairArenaDraft";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/graph/state/types/ArenaGraphStateValues";
import type {ArenaGraphUpdate} from "@gunsmith/ai/pipeline/arena/graph/state/types/ArenaGraphUpdate";

/**
 * Puts a refused draft back to the model with its first answer and what was wrong with it: one model call, and the one repair is
 * spent, which is what keeps the graph from looping (`routeAfterValidate` sends a second refusal to the built-in arena).
 */
export async function repairNode(
  state: ArenaGraphStateValues,
  generator: BaseChatModel,
  format: ArenaFormat,
): Promise<ArenaGraphUpdate> {
  const draft = await repairArenaDraft(
    {prompt: state.prompt, previous: state.draft, errors: state.errors, format},
    generator,
  );

  return {draft, repaired: true, nodes: ["repair"], modelCalls: 1};
}
