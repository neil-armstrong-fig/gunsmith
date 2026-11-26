import type {AnthropicModelOptions} from "@gunsmith/ai/adapter/types/AnthropicModelOptions";
import type {ArenaModels} from "@gunsmith/ai/adapter/types/ArenaModels";
import {createHaikuChatModel} from "@gunsmith/ai/adapter/haiku/CreateHaikuChatModel";

// A verdict is a few tokens; a drawing in rows is about 1,200 characters at the engine's largest size (30 by 40), and the same
// room is left for a repair. `maxTokens` costs nothing unused on Anthropic, whereas a tool call cut off by it fails to parse and
// the arena falls back, which a report would read as a model that draws badly.
const ARENA_MODERATION_MAX_TOKENS = 2000;
const ARENA_GENERATION_MAX_TOKENS = 4000;

/** The two models the arena pipeline is handed: the one that draws and the one that judges. */
export function createArenaModels(options: AnthropicModelOptions): ArenaModels {
  return {
    generator: createHaikuChatModel({...options, maxTokens: ARENA_GENERATION_MAX_TOKENS}),
    moderator: createHaikuChatModel({...options, maxTokens: ARENA_MODERATION_MAX_TOKENS}),
  };
}
