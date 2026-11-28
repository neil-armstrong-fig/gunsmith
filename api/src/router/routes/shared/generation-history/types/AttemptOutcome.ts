import type {GenerationAttempt} from "@src/shared/accounts/types/GenerationAttempt";

export type AttemptOutcome = Pick<GenerationAttempt, "outcome" | "failureStage" | "failureReason">;
