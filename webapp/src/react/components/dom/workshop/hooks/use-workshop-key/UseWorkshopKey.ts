import {scenarioOfPage} from "@src/game/scenario/ScenarioOfPage";
import {useAppStore} from "@src/store/app/UseAppStore";
import {useEffect} from "react";

/** B opens the workshop. */
const WORKSHOP_KEY = "KeyB";

/**
 * Opens the workshop when B is pressed on the practice range, and nowhere else: nothing is made in a match. Only while the workshop is
 * shut does a key reach the window (the open panel keeps what is typed in it to itself), and a held key's repeats do not open it again
 * the moment Escape has shut it.
 */
export function useWorkshopKey(): void {
  useEffect(() => {
    if (scenarioOfPage() !== "practice") {
      return undefined;
    }

    window.addEventListener("keydown", press);

    return () => {
      window.removeEventListener("keydown", press);
    };

    function press(event: KeyboardEvent): void {
      if (event.code === WORKSHOP_KEY && !event.repeat) {
        useAppStore.getState().openWorkshop();
      }
    }
  }, []);
}
