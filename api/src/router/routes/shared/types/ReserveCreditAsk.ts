import type {CreditKind} from "@src/durable-objects/credit-ledger/types/CreditKind";

/**
 * What a generation route asks `reserveCredit` for: the pipeline it has (if any), the kind of request to reserve a credit for and,
 * when the route's calls cost money it can estimate, the worst case to reserve from the global spend (microdollars). A route with no
 * estimate yet (the arena route) leaves it out and reserves no spend.
 */
export interface ReserveCreditAsk<Smith> {
  smith: Smith | undefined;
  kind: CreditKind;
  reservedMicrodollars?: number;
}
