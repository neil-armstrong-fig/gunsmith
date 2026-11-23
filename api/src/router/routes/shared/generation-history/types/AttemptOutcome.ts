import type {GenerationAttempt} from "@src/accounts/types/GenerationAttempt";

export type AttemptOutcome = Pick<GenerationAttempt, "outcome" | "failureStage" | "failureReason">;
