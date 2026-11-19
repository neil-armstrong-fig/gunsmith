import type {SpendReservation} from "@src/durable-objects/spend-ledger/types/SpendReservation";

/** Everything the meter needs to be rebuilt after its Durable Object is evicted. */
export interface SpendMeterState {
  day: number;
  month: number;
  dailyMicrodollars: number;
  monthlyMicrodollars: number;
  dailyStopped: boolean;
  monthlyStopped: boolean;
  alertsSent: number[];
  reservations: Record<string, SpendReservation>;
}
