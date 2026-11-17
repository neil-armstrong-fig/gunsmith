import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {generateArenaDraft} from "@gunsmith/ai/pipeline/arena/arena-drafting/generate/GenerateArenaDraft";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";
import type {ArenaGraphUpdate} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphUpdate";

/** Has the strong model draw the arena from the player's words: one model call, and what comes back stays `unknown` until `validate`. */
export async function generateNode(state: ArenaGraphStateValues, generator: BaseChatModel): Promise<ArenaGraphUpdate> {
  const draft = await generateArenaDraft(state.prompt, generator);

  return {draft, nodes: ["generate"], modelCalls: 1};
}
