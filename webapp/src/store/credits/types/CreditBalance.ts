/** What the workshop says of a signed-in player's credits: what is left today, the day's allowance and what a Make costs. */
export interface CreditBalance {
  balance: number;
  dailyAllowance: number;
  makePrice: number;
}
