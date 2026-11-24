import type {ArenaStyle} from "@gunsmith/shared/arena-style/ArenaStyle";
import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";
import type {SpendLedger} from "@src/durable-objects/spend-ledger/SpendLedger";

/**
 * A generation request whose credit is reserved (and its spend too, when the route asked for it): what it takes to run the pipeline
 * (the prompt, and whose it is, so a result can be kept for them) and then settle or refund those reservations under `key`.
 */
export interface CreditReservation {
  credits: DurableObjectStub<CreditLedger>;
  spend: DurableObjectStub<SpendLedger>;
  accountId: string;
  key: string;
  prompt: string;
  /** The style an arena request named (`blue` or `red`); absent for a weapon and for an arena that named none. */
  style?: ArenaStyle;
}
