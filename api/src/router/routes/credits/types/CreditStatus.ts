import type {CreditStatusPrices} from "@src/router/routes/credits/types/CreditStatusPrices";

/** What the selection panel shows, answered by `GET /api/credits`: the account's balance, what a request costs and whether AI is on. */
export interface CreditStatus {
  balance: number;
  dailyAllowance: number;
  prices: CreditStatusPrices;
  aiOn: boolean;
  returnsAt?: number;
}
