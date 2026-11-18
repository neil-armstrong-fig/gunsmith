/** What one request has added to the spend: its estimate until it is settled at the real cost, and the day and month it was made in. */
export interface SpendReservation {
  microdollars: number;
  held: boolean;
  day: number;
  month: number;
}
