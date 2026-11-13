/** What the opponent is doing, in the order the states are described in `engine/AGENTS.md`. */
export const OPPONENT_STATES = ["wander", "engage", "reload", "search"] as const;

export type OpponentState = (typeof OPPONENT_STATES)[number];
