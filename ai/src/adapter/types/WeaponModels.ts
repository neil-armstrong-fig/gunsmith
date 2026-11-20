import type {ChatAnthropic} from "@langchain/anthropic";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";

/** The weapon pipeline's three models, still the `ChatAnthropic` they are, so their settings can be read. The pipeline takes them as chat models. */
export interface WeaponModels extends WeaponPipelineDependencies {
  generator: ChatAnthropic;
  moderator: ChatAnthropic;
  appearanceGenerator: ChatAnthropic;
}
