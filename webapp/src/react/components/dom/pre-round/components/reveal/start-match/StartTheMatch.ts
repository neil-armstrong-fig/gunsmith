import {worldWithPicks} from "@src/game/pre-round/WorldWithPicks";
import type {PreRoundPicks} from "@src/game/pre-round/types/PreRoundPicks";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {useGameStore} from "@src/store/game/UseGameStore";
import {usePreRoundStore} from "@src/store/pre-round/UsePreRoundStore";

/** What "Start the match" does: the player carries the weapons they locked in, written to the game store before the pre-round ends so the loop never steps the old loadout. */
export function startTheMatch(picks: PreRoundPicks): void {
  useGameStore.getState().setWorld(worldWithPicks(gameState(), picks));
  usePreRoundStore.getState().startMatch();
}
