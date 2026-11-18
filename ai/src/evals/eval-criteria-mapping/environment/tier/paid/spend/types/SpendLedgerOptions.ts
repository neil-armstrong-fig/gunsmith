/** Where the paid tier's running total is kept, and the most it may reach. */
export interface SpendLedgerOptions {
  file: string;
  ceilingDollars: number;
}
