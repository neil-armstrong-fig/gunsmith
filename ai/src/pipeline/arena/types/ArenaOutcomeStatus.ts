/**
 * Every way an arena request can end: an arena was made, the request was turned away (not an arena request, too long), or it was
 * an arena request but no playable arena came out of it, even after the one repair, so a built-in arena is given (and the
 * credit is not refunded: the model was used).
 */
export const arenaOutcomeStatuses = ["created", "rejected", "builtIn"] as const;

export type ArenaOutcomeStatus = (typeof arenaOutcomeStatuses)[number];
