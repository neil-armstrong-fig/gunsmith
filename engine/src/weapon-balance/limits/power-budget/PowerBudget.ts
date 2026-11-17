/**
 * The most power rating (0 to 1, `PowerRatingOf`) a weapon may have. A weapon rated above it is trimmed back to it. The engine's
 * rifle rates about 0.55 and the marksman rifle about 0.46, so both are well inside. A tunable, set by play.
 */
export const POWER_BUDGET = 0.65;
