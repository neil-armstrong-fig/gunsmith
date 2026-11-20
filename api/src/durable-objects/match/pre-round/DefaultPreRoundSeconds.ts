/**
 * How long two seats have to choose their arena once both have sat (tunable, `docs/selection-concept/README.md`: about a minute). A room
 * may be made to wait less (`match/pre-round-seconds/ParsePreRoundSeconds`), never more.
 */
export const DEFAULT_PRE_ROUND_SECONDS = 60;
