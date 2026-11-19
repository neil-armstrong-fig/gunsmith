import {nextRandom} from "@gunsmith/engine/random/NextRandom";
import type {RandomDraw} from "@gunsmith/engine/random/types/RandomDraw";
import {ARENA_PICK_SEED_SALT} from "@gunsmith/engine/arena-picking/seed/ArenaPickSeedSalt";
import type {ArenaPick} from "@gunsmith/engine/arena-picking/types/ArenaPick";
import type {ArenaPickHow} from "@gunsmith/engine/arena-picking/types/ArenaPickHow";
import type {ArenaPicksResolution} from "@gunsmith/engine/arena-picking/types/ArenaPicksResolution";
import type {SettleRandomOptions} from "@gunsmith/engine/arena-picking/types/SettleRandomOptions";
import type {ResolveArenaPicksInput} from "@gunsmith/engine/arena-picking/types/ResolveArenaPicksInput";

/**
 * Says whose arena is played, from what the two players chose when both arenas were shown to them. A player picks an arena, picks
 * nothing, or chooses random:
 * - both picked the same arena: that one (`agreed`);
 * - both picked, but different ones: one draw, a coin between the two picks (`coin`);
 * - one picked and the other picked nothing: the pick stands (`only-pick`);
 * - one picked and the other chose random: a first draw decides between the pick and random. Under a half keeps the pick
 *   (`pick-kept`); a half or more lets random win, and a second draw then chooses which of the two submitted arenas is played (`random`);
 * - both chose random, or one chose random against nothing, or nobody picked: there is no pick to set against random, so just the
 *   draw over the two submitted arenas (`random`).
 * Draws come one at a time, as needed, from a salted stream of the engine's generator (`seed ^ ARENA_PICK_SEED_SALT`, so it never
 * shares a draw with another stream). A draw over two arenas under a half takes the first player listed, a half or more the second.
 * The same seed and picks always give the same arena, and nothing reads the clock or `Math.random`. A pure rule that makes no model
 * call.
 */
export function resolveArenaPicks(input: ResolveArenaPicksInput): ArenaPicksResolution {
  const [first, second] = requireTwoPicks(input.picks);
  const submitted: readonly [string, string] = [first.playerId, second.playerId];
  const firstPicked = pickedPlayerId(first);
  const secondPicked = pickedPlayerId(second);

  if (first.choice.kind === "random" || second.choice.kind === "random") {
    return settleRandom({pick: firstPicked ?? secondPicked, submitted, seed: input.seed});
  }

  if (firstPicked === undefined) {
    if (secondPicked === undefined) {
      return arenaOf(submitted, saltedDraw(input.seed).value, "random");
    }

    return {chosenPlayerId: secondPicked, how: "only-pick"};
  }

  if (secondPicked === undefined) {
    return {chosenPlayerId: firstPicked, how: "only-pick"};
  }

  if (firstPicked === secondPicked) {
    return {chosenPlayerId: firstPicked, how: "agreed"};
  }

  return arenaOf([firstPicked, secondPicked], saltedDraw(input.seed).value, "coin");
}

/**
 * Someone chose random. With a pick on the table, a first draw decides between the pick and random, and only if random wins is
 * a second draw taken for the arena. With no pick, the first draw is the arena.
 */
function settleRandom(options: SettleRandomOptions): ArenaPicksResolution {
  const firstDraw = saltedDraw(options.seed);
  if (options.pick === undefined) {
    return arenaOf(options.submitted, firstDraw.value, "random");
  }

  if (firstDraw.value < 0.5) {
    return {chosenPlayerId: options.pick, how: "pick-kept"};
  }

  return arenaOf(options.submitted, nextRandom(firstDraw.seed).value, "random");
}

/** The first draw of the pick's own stream: the seed, mixed with a salt of its own. */
function saltedDraw(seed: number): RandomDraw {
  return nextRandom(seed ^ ARENA_PICK_SEED_SALT);
}

/** A draw over two arenas: under a half is the first of the two, a half or more the second. */
function arenaOf(arenas: readonly [string, string], draw: number, how: ArenaPickHow): ArenaPicksResolution {
  if (draw < 0.5) {
    return {chosenPlayerId: arenas[0], how};
  }

  return {chosenPlayerId: arenas[1], how};
}

function pickedPlayerId(pick: ArenaPick): string | undefined {
  if (pick.choice.kind === "arena") {
    return pick.choice.chosenPlayerId;
  }

  return undefined;
}

function requireTwoPicks(picks: readonly ArenaPick[]): readonly [ArenaPick, ArenaPick] {
  const [first, second] = picks;
  if (picks.length !== 2 || first === undefined || second === undefined) {
    throw new Error(`An arena is picked by exactly two picks, but ${picks.length} were made.`);
  }

  if (first.playerId === second.playerId) {
    throw new Error("An arena is picked with one pick for each player, but a player picked twice.");
  }

  const playerIds = [first.playerId, second.playerId];
  for (const pick of [first, second]) {
    if (pick.choice.kind === "arena" && !playerIds.includes(pick.choice.chosenPlayerId)) {
      throw new Error("A pick must be of an arena submitted by one of the two players.");
    }
  }

  return [first, second];
}
