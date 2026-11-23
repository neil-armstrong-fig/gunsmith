import type {BlockedCreditReason} from "@src/router/routes/shared/types/BlockedCreditReason";

export interface InterruptedArenaAttempt {
  accountId: string;
  key: string;
  reason: BlockedCreditReason | "generation-timed-out" | "generation-failed";
}
