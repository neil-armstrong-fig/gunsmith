import type {WorkshopStore} from "@src/store/workshop/types/WorkshopStore";
import {create} from "zustand";

/** The workshop's store: the prompt being written and the weapon last made, apart from the app store so typing never wakes the rest of the screen. */
export const useWorkshopStore = create<WorkshopStore>()(set => ({
  prompt: "",
  weapon: undefined,
  madeFromPrompt: "",
  savedId: undefined,
  setPrompt: prompt => {
    set({prompt});
  },
  setWeapon: weapon => {
    set(state => ({weapon, madeFromPrompt: state.prompt, savedId: undefined}));
  },
  setSavedId: savedId => {
    set({savedId});
  },
  showSavedWeapon: saved => {
    set({prompt: saved.prompt, weapon: saved.weapon, madeFromPrompt: saved.prompt, savedId: saved.id});
  },
}));
