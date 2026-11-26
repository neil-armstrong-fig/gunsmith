/**
 * Which match the page opens: the practice range with its dummies, a duel with an opponent who shoots back, a
 * sparring match in the same arena with an opponent who stands and takes it, or the heights arena, with one stair up to
 * a platform and a dummy on each level, or the terraced duel: an opponent who shoots back, on low ground below a platform where the
 * player starts, in one round with a ring, or the overlook: the same arena the other way round, the opponent on the platform and the player
 * on the low ground in its sight, in one round with no ring, or the pickup race: the duel's arena and fighters in one round with no ring,
 * and a weapon lying much nearer the opponent than the player, or the fair duel: an arena that is the same picture turned half way round
 * (a platform in the middle), the fighters at a matching pair of places drawn from the seed, in one round with a ring (no score),
 * the cover arena: open low ground with two low cover blocks and three dummies east of them, one standing and two crouched, and no opponent, or the cover hall: a hall one tile wide and ten long with a low cover block at its third and eighth tile, the player and an opponent who shoots back each in the two tiles behind their own block, in one round with no ring, or the cover run: open low ground with one low cover block and
 * an opponent with an empty magazine two tiles past it, eight tiles from the player, in one round with no ring,
 * the mutual knockout: the duel's first round with a shot in the air from each fighter at the other, so both fall in the first step and the round is drawn,
 * the three-level terrain preview, or an online room (`?room=<code>`): the duel's arena with only the
 * player in it until the server's snapshots take over, since the server plays the match.
 */
export type Scenario =
  | "practice"
  | "duel"
  | "sparring"
  | "heights"
  | "cover"
  | "cover-hall"
  | "cover-run"
  | "mutual-knockout"
  | "terraced"
  | "overlook"
  | "pickup-race"
  | "fair-duel"
  | "overwatch"
  | "terrain"
  | "room";
