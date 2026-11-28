import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/drafting/format/ArenaFormat";

/**
 * What the arena pipeline is handed and never builds: the models. Tests and evals pass a fake, a local model or a paid one; the Worker
 * passes the real one. There are no built-in arenas to give when the model's cannot be used: the outcome says why instead.
 */
export interface ArenaPipelineDependencies {
  /** The strong model that writes the arena. */
  generator: BaseChatModel;
  /** The cheap model that judges whether a request is an arena request at all. */
  moderator: BaseChatModel;
  /** How the generator is asked to describe an arena: the drawing's rows or shapes; shapes (`DEFAULT_ARENA_FORMAT`) when absent. The answer is checked the same either way. */
  format?: ArenaFormat;
}
