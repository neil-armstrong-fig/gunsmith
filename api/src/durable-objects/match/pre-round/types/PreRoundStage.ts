import type {PRE_ROUND_STAGES} from "@src/durable-objects/match/pre-round/types/PreRoundStages";

export type PreRoundStage = (typeof PRE_ROUND_STAGES)[number];
