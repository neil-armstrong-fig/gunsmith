import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
import type {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";

/**
 * A generation request whose credit is reserved (and its spend too, when the route asked for it): what it takes to run the pipeline
 * (the prompt) and then settle or refund those reservations under `key`.
 */
export interface CreditReservation {
  credits: DurableObjectStub<CreditLedger>;
  spend: DurableObjectStub<SpendLedger>;
  key: string;
  prompt: string;
}
