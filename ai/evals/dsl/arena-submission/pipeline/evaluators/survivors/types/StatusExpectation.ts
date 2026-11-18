/** What a spec may expect screening to leave: nothing, one submission forward by default, or two for the players to pick between. */
export const statusExpectations = ["none", "only-submission", "players-pick"] as const;

export type StatusExpectation = (typeof statusExpectations)[number];
