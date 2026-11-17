import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/**
 * What the arena pipeline is handed and never builds: the models, and the built-in arenas it falls back to. Tests and evals pass a
 * fake, a local model or a paid one; the Worker passes the real one. The built-ins are injected until engine owns one list of them
 * (requested in `HANDOFF.md`); they meet the same checks as a generated arena.
 */
export interface ArenaPipelineDependencies {
  /** The strong model that writes the arena. */
  generator: BaseChatModel;
  /** The cheap model that judges whether a request is an arena request at all. */
  moderator: BaseChatModel;
  /** The arenas to give when the model's cannot be used. Never empty. */
  builtInArenas: readonly ArenaDrawing[];
}
