import {useGameStore} from "@src/store/game/UseGameStore";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";

export function returnToPractice(): void {
  const store = useArenaWorkshopStore.getState();
  const world = store.practiceWorld;
  if (world === undefined) return;

  useGameStore.getState().setWorld(world);
  store.setPracticeWorld(undefined);
}
