/**
 * Why an arena was chosen:
 * - `agreed`: both players picked the same arena;
 * - `coin`: both picked, but different ones, and a seeded coin chose between the two picks;
 * - `only-pick`: one player picked and the other picked nothing, so the pick stands;
 * - `pick-kept`: one player picked and the other chose random, and the first draw kept the pick;
 * - `random`: an arena was drawn from the two submitted, because both chose random, or random won the first draw against a pick, or
 *   one chose random against nothing, or nobody picked.
 */
export const arenaPickHows = ["agreed", "coin", "only-pick", "pick-kept", "random"] as const;

export type ArenaPickHow = (typeof arenaPickHows)[number];
