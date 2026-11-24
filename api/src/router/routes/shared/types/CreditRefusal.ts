import type {BlockedCreditAttempt} from "@src/router/routes/shared/types/BlockedCreditAttempt";

export interface CreditRefusal {
  response: Response;
  blockedAttempt?: BlockedCreditAttempt;
}
