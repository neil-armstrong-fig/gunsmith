import type {ChatAnthropic} from "@langchain/anthropic";

/** The paid arena tier's two models, still the `ChatAnthropic` they are, so their settings can be read. */
export interface PaidArenaModels {
  generator: ChatAnthropic;
  moderator: ChatAnthropic;
}
