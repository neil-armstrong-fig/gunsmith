import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";

/**
 * A generation request whose credit is reserved: what it takes to run the pipeline (`smith`) and then settle or refund that
 * reservation. `Smith` is the pipeline's own type (`WeaponSmith` or `ArenaSmith`).
 */
export interface CreditReservation<Smith> {
  credits: DurableObjectStub<CreditLedger>;
  key: string;
  prompt: string;
  smith: Smith;
}
