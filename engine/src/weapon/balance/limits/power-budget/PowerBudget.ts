/**
 * The most power rating (0 to 1, `PowerRatingOf`) a weapon may have. A weapon rated above it is trimmed back to it. The engine's
 * rifle rates about 0.53, the marksman rifle about 0.49 and the submachine gun about 0.55, so all three are well inside. A
 * tunable, set by play.
 */
export const POWER_BUDGET = 0.65;
