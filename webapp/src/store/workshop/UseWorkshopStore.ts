import type {WorkshopStore} from "@src/store/workshop/types/WorkshopStore";
import {create} from "zustand";

/** The workshop's store: the prompt being written and the weapon last made, apart from the app store so typing never wakes the rest of the screen. */
export const useWorkshopStore = create<WorkshopStore>()(set => ({
  prompt: "",
  weapon: undefined,
  setPrompt: prompt => {
    set({prompt});
  },
  setWeapon: weapon => {
    set({weapon});
  },
}));
