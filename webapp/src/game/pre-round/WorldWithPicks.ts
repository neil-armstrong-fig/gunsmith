import type {World} from "@gunsmith/engine/game-loop/types/World";
import {fullCarriedWeapon} from "@src/game/loadout/FullCarriedWeapon";
import type {PreRoundPicks} from "@src/game/pre-round/types/PreRoundPicks";

/** The world with the player carrying the weapons they locked in, both full, the first in hand and no reload going. The opponent and everything else stand as they were. */
export function worldWithPicks(world: World, picks: PreRoundPicks): World {
  return {
    ...world,
    player: {
      ...world.player,
      loadout: [fullCarriedWeapon(picks.first), fullCarriedWeapon(picks.second)],
      equippedIndex: 0,
      reloadRemainingSeconds: undefined,
    },
  };
}
