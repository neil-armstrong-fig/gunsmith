import type {ChatAnthropic} from "@langchain/anthropic";

/** The arena pipeline's two models, still the `ChatAnthropic` they are, so their settings can be read. */
export interface ArenaModels {
  generator: ChatAnthropic;
  moderator: ChatAnthropic;
}
