/**
 * Mixed into the seed before the pickup's place is drawn, so the pickup has a stream of its own and never shares a draw with
 * the opponent's brain or the ring's centre: a duel plays out as it did before it had a pickup.
 */
export const PICKUP_SEED_SALT = 0x2c1b3c6d;
