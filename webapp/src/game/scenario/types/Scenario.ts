/**
 * Which match the page opens: the practice range with its dummies, a duel with an opponent who shoots back, a
 * sparring match in the same arena with an opponent who stands and takes it, or the heights arena, with one stair up to
 * a platform and a dummy on each level, or the terraced duel: an opponent who shoots back, on low ground below a platform where the
 * player starts, in one round with a ring, or the overlook: the same arena the other way round, the opponent on the platform and the player
 * on the low ground in its sight, in one round with no ring, or the pickup race: the duel's arena and fighters in one round with no ring,
 * and a weapon lying much nearer the opponent than the player, or the fair duel: an arena that is the same picture turned half way round
 * (a platform in the middle), the fighters at a matching pair of places drawn from the seed, in one round with a ring (no score).
 */
export type Scenario =
  "practice" | "duel" | "sparring" | "heights" | "terraced" | "overlook" | "pickup-race" | "fair-duel";
