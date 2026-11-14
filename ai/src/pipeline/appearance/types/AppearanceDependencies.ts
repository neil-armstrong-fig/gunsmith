import type {BaseChatModel} from "@langchain/core/language_models/chat_models";

/** What the appearance pipeline is handed and never builds: the model that draws. Model choice lives in code at the edge, as for the weapon. */
export interface AppearanceDependencies {
  generator: BaseChatModel;
}
