import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {worldWithRangeReset} from "@src/react/components/dom/workshop/hooks/use-practice-reset-key/range-reset/WorldWithRangeReset";
import {usePressedKey} from "@src/react/hooks/use-pressed-key/UsePressedKey";
import {useGameStore} from "@src/store/game/UseGameStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";

/** T resets the range. */
const RESET_KEY = "KeyT";

/**
 * Stands the practice range's dummies up and fills both weapons when T is pressed on the practice range, and nowhere else: a match has no
 * dummies to stand up and no free ammunition. Like B, it hears only a key that reaches the window, so what is typed in the open panel never
 * resets.
 */
export function usePracticeResetKey(): void {
  usePressedKey(RESET_KEY, resetThePracticeRange, scenarioOfPage() === "practice");
}

function resetThePracticeRange(): void {
  const world = gameState();
  if (world.arena !== PRACTICE_ARENA) return;

  useGameStore.getState().setWorld(worldWithRangeReset(world));
}
