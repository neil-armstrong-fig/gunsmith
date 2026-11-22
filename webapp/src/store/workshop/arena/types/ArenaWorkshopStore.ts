import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {WorkshopArena} from "@src/store/workshop/arena/types/WorkshopArena";

export interface ArenaWorkshopStore {
  prompt: string;
  result: WorkshopArena | undefined;
  savedId: string | undefined;
  practiceWorld: World | undefined;
  making: boolean;
  makeError: string | undefined;
  setPrompt: (prompt: string) => void;
  setResult: (result: WorkshopArena) => void;
  setSavedId: (id: string) => void;
  iterate: (result: WorkshopArena, savedId: string) => void;
  setPracticeWorld: (world: World | undefined) => void;
  setMaking: (making: boolean) => void;
  setMakeError: (makeError: string | undefined) => void;
}
