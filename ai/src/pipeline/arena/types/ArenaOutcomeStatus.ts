/**
 * Every way an arena request can end: an arena was made, the request was turned away (not an arena request, too long), or it was
 * an arena request but no playable arena came out of it, even after the one repair: it is invalid, with a reason for the player and
 * no arena (the user, 2026-11-21: nothing is given in its place), and the credit is not refunded, because the model was used.
 */
export const arenaOutcomeStatuses = ["created", "rejected", "invalid"] as const;

export type ArenaOutcomeStatus = (typeof arenaOutcomeStatuses)[number];
