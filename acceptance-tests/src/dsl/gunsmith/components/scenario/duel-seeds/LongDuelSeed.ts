/**
 * The seed of a duel that lasts long enough for the opponent to run dry. Against a player who stands still, with this seed
 * the opponent first reloads at 5.5 game seconds, has a full magazine again at 7.0 and kills the player at 9.4, so the
 * reload and what follows it can be watched. Measured in the engine over seeds 1 to 40: only seeds 1 and 6 get that far, and
 * this one leaves the longer wait after the refill (2.4 s against 1.1 s).
 */
export const LONG_DUEL_SEED = 6;
