/**
 * Mixed into the seed before the ring's centre is drawn, so the ring has a stream of its own and never shares draws with the
 * opponent's brain, whose choices come from the same seed: a duel plays out as it did before the ring had a centre.
 */
export const RING_SEED_SALT = 0x5bd1e995;
