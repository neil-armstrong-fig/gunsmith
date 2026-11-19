import type {CreditReservation} from "@src/durable-objects/credit-ledger/types/CreditReservation";

/** Everything an account needs to be rebuilt after its Durable Object is evicted. `day` is the UTC day the balance belongs to. */
export interface CreditAccountState {
  day: number;
  balance: number;
  reservations: Record<string, CreditReservation>;
}
