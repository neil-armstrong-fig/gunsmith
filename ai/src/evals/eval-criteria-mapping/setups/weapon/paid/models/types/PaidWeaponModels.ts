import type {ChatAnthropic} from "@langchain/anthropic";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/weapon/types/WeaponPipelineDependencies";

/** The paid tier's three models, still the `ChatAnthropic` they are, so their settings can be read. The pipeline takes them as chat models. */
export interface PaidWeaponModels extends WeaponPipelineDependencies {
  generator: ChatAnthropic;
  moderator: ChatAnthropic;
  appearanceGenerator: ChatAnthropic;
}
