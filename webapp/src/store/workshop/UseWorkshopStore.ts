import type {WorkshopStore} from "@src/store/workshop/types/WorkshopStore";
import {create} from "zustand";

/** The workshop's store: the prompt being written and the weapon last made, apart from the app store so typing never wakes the rest of the screen. */
export const useWorkshopStore = create<WorkshopStore>()(set => ({
  prompt: "",
  weapon: undefined,
  madeFromPrompt: "",
  savedId: undefined,
  accountItemId: undefined,
  making: false,
  makeError: undefined,
  setAccountWeapon: ({id, prompt, weapon}) => {
    set({weapon, madeFromPrompt: prompt, savedId: undefined, accountItemId: id});
  },
  setMaking: making => {
    set({making});
  },
  setMakeError: makeError => {
    set({makeError});
  },
  setPrompt: prompt => {
    set({prompt});
  },
  setWeapon: weapon => {
    set(state => ({
      weapon,
      madeFromPrompt: state.prompt,
      savedId: undefined,
      accountItemId: undefined,
      makeError: undefined,
    }));
  },
  setSavedId: savedId => {
    set({savedId});
  },
  showSavedWeapon: (saved, isAccount = false) => {
    const card = {prompt: saved.prompt, weapon: saved.weapon, madeFromPrompt: saved.prompt, makeError: undefined};
    if (isAccount) {
      set({...card, savedId: undefined, accountItemId: saved.id});
      return;
    }

    set({...card, savedId: saved.id, accountItemId: undefined});
  },
}));
