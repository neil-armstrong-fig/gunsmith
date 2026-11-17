/** What one request has taken from the account: `held` until it is settled or refunded, and then final. */
export interface CreditReservation {
  charged: number;
  held: boolean;
}
