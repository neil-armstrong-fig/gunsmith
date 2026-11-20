import type {ArenaWorkshopStore} from "@src/store/workshop/arena/types/ArenaWorkshopStore";
import {create} from "zustand";

export const useArenaWorkshopStore = create<ArenaWorkshopStore>()(set => ({
  prompt: "",
  result: undefined,
  savedId: undefined,
  practiceWorld: undefined,
  setPrompt: prompt => {
    set({prompt});
  },
  setResult: result => {
    set({result, savedId: undefined});
  },
  setSavedId: savedId => {
    set({savedId});
  },
  iterate: (result, savedId) => {
    set({result, savedId, prompt: result.madeFromPrompt ?? ""});
  },
  setPracticeWorld: practiceWorld => {
    set({practiceWorld});
  },
}));
