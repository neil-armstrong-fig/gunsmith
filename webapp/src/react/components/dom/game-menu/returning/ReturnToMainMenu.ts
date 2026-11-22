import {roomOfPage} from "@src/online/RoomOfPage";
import {loadLocalGameOfPage} from "@src/react/navigation/LoadLocalGameOfPage";

/** Returns to the practice menu. Leaving a room navigates away so the room's socket is closed. */
export function returnToMainMenu(): void {
  if (roomOfPage() !== undefined) {
    location.replace("/?menu=1");
    return;
  }

  history.replaceState(history.state, "", "/");
  loadLocalGameOfPage("main");
}
