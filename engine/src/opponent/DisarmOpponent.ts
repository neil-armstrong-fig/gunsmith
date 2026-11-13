import type {World} from "@gunsmith/engine/game-loop/types/World";

/**
 * The same world with an opponent who cannot shoot: every magazine and reserve it carries is empty, and it has no brain,
 * so it takes no action at all. It can be shot, so it is a target that stands and takes it, for sparring. A world with
 * no opponent comes back as it is.
 */
export function disarmOpponent(world: World): World {
  const {opponent} = world;
  if (!opponent) {
    return world;
  }

  const loadout = opponent.loadout.map(carried => ({...carried, rounds: 0, reserve: 0}));

  return {...world, opponent: {...opponent, loadout}, opponentBrain: undefined};
}
