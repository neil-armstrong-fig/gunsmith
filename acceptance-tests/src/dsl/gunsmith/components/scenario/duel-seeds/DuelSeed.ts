/**
 * The seed every duel spec plays with. Fixed, so a run of a spec plays the same duel and only Playwright's timing varies.
 * Seed 2 is a typical one: against a player who stands still, the opponent takes 2.9 game seconds to win with it, where
 * the 40 seeds measured took from 2.3 to 9.4.
 */
export const DUEL_SEED = 2;
