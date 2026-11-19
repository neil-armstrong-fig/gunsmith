import type {CreditKind} from "@src/durable-objects/credit-ledger/types/CreditKind";

/** What a generation route asks `reserveCredit` for: the pipeline it has (if any) and the kind of request to reserve a credit for. */
export interface ReserveCreditAsk<Smith> {
  smith: Smith | undefined;
  kind: CreditKind;
}
