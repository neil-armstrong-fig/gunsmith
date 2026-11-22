import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {openPracticeWorkshop} from "@src/react/components/dom/workshop/entering/OpenPracticeWorkshop";
import {usePressedKey} from "@src/react/hooks/use-pressed-key/UsePressedKey";
import {useAppStore} from "@src/store/app/UseAppStore";

/** B opens the workshop. */
const WORKSHOP_KEY = "KeyB";

/**
 * Opens the workshop when B is pressed on the practice range, and nowhere else: nothing is made in a match. The workshop gives ammunition
 * for free, so both weapons are filled in the same press, before the panel opens (not in an effect after it has rendered, when the loop could
 * take a step first). Only while the workshop is shut does a key reach the window (the open panel keeps what is typed in it to itself), and a
 * held key's repeats do not open it again the moment Escape has shut it.
 */
export function useWorkshopKey(): void {
  usePressedKey(WORKSHOP_KEY, () => {
    if (scenarioOfPage() !== "practice") return;

    const {menuView, workshopOpen} = useAppStore.getState();
    if (menuView === undefined && !workshopOpen) openPracticeWorkshop();
  });
}
