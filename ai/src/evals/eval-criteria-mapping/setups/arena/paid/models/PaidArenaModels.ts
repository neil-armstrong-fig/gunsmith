import {createPaidChatModel} from "@evals/eval-criteria-mapping/environment/tier/paid/CreatePaidChatModel";
import type {PaidArenaModels} from "@evals/eval-criteria-mapping/setups/arena/paid/models/types/PaidArenaModels";

// A verdict is a few tokens; a drawing in rows is about 1,200 characters at the engine's largest size (30 by 40), and the same
// room is left for a repair. `maxTokens` costs nothing unused on Anthropic, whereas a tool call cut off by it fails to parse and
// the arena falls back, which a report would read as a model that draws badly.
const PAID_ARENA_MODERATION_MAX_TOKENS = 2000;
const PAID_ARENA_GENERATION_MAX_TOKENS = 4000;

/** Haiku 5.5 for the arena's two models, the one that draws and the one that judges, behind the one spend guard and with no retries. */
export function createPaidArenaModels(): PaidArenaModels {
  return {
    generator: createPaidChatModel(PAID_ARENA_GENERATION_MAX_TOKENS),
    moderator: createPaidChatModel(PAID_ARENA_MODERATION_MAX_TOKENS),
  };
}
