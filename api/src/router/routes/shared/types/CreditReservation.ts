import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
import type {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";

/**
 * A generation request whose credit is reserved (and its spend too, when the route asked for it): what it takes to run the pipeline
 * (`smith`) and then settle or refund those reservations under `key`. `Smith` is the pipeline's own type (`WeaponSmith` or `ArenaSmith`).
 */
export interface CreditReservation<Smith> {
  credits: DurableObjectStub<CreditLedger>;
  spend: DurableObjectStub<SpendLedger>;
  key: string;
  prompt: string;
  smith: Smith;
}
