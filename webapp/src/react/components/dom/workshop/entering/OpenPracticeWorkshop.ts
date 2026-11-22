import {worldWithFullAmmunition} from "@src/react/components/dom/workshop/full-ammunition/WorldWithFullAmmunition";
import {useAppStore} from "@src/store/app/UseAppStore";
import {useGameStore} from "@src/store/game/UseGameStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";

export function openPracticeWorkshop(): void {
  useGameStore.getState().setWorld(worldWithFullAmmunition(gameState()));
  useAppStore.getState().openWorkshop();
}
