import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {worldWithFullAmmunition} from "@src/react/components/dom/workshop/hooks/full-ammunition/WorldWithFullAmmunition";
import {usePressedKey} from "@src/react/hooks/use-pressed-key/UsePressedKey";
import {useAppStore} from "@src/store/app/UseAppStore";
import {useGameStore} from "@src/store/game/UseGameStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";

/** B opens the workshop. */
const WORKSHOP_KEY = "KeyB";

/**
 * Opens the workshop when B is pressed on the practice range, and nowhere else: nothing is made in a match. The workshop gives ammunition
 * for free, so both weapons are filled in the same press, before the panel opens (not in an effect after it has rendered, when the loop could
 * take a step first). Only while the workshop is shut does a key reach the window (the open panel keeps what is typed in it to itself), and a
 * held key's repeats do not open it again the moment Escape has shut it.
 */
export function useWorkshopKey(): void {
  usePressedKey(WORKSHOP_KEY, openWorkshopWithFullAmmunition, scenarioOfPage() === "practice");
}

function openWorkshopWithFullAmmunition(): void {
  useGameStore.getState().setWorld(worldWithFullAmmunition(gameState()));
  useAppStore.getState().openWorkshop();
}
