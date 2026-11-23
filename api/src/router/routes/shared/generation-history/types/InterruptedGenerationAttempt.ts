import type {BlockedCreditReason} from "@src/router/routes/shared/types/BlockedCreditReason";

export interface InterruptedGenerationAttempt {
  accountId: string;
  key: string;
  reason: BlockedCreditReason | "generation-timed-out" | "generation-failed";
}
