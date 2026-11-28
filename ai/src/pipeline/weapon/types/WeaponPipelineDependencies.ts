import type {BaseChatModel} from "@langchain/core/language_models/chat_models";

/**
 * What the pipeline is handed and never builds: the models. Tests and evals pass a fake, a local model or a paid one; the
 * Worker passes the real one. Model choice lives in code at the edge, not inside the graph.
 */
export interface WeaponPipelineDependencies {
  /** The strong model that writes the weapon. */
  generator: BaseChatModel;
  /** The cheap model that judges whether a request is a weapon request at all. */
  moderator: BaseChatModel;
  /** The model that draws a created weapon: its own settings, since a drawing needs far more output than the stats and a temperature above zero. */
  appearanceGenerator: BaseChatModel;
}
