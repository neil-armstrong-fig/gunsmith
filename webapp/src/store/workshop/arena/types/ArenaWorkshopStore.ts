import type {ArenaStyle} from "@gunsmith/shared/arena-style/ArenaStyle";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {WorkshopArena} from "@src/store/workshop/arena/types/WorkshopArena";

export interface ArenaWorkshopStore {
  prompt: string;
  /** The style the real Make will ask for (`blue` or `red`, `shared/arena-style/`); Make is still a stand-in, so it does not change what is made yet. */
  style: ArenaStyle;
  result: WorkshopArena | undefined;
  savedId: string | undefined;
  practiceWorld: World | undefined;
  setPrompt: (prompt: string) => void;
  setStyle: (style: ArenaStyle) => void;
  setResult: (result: WorkshopArena) => void;
  setSavedId: (id: string) => void;
  iterate: (result: WorkshopArena, savedId: string) => void;
  setPracticeWorld: (world: World | undefined) => void;
}
