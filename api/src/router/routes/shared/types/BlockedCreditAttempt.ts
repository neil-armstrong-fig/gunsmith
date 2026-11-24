import type {BlockedCreditReason} from "@src/router/routes/shared/types/BlockedCreditReason";

export interface BlockedCreditAttempt {
  accountId: string;
  key: string;
  reason: BlockedCreditReason;
}
