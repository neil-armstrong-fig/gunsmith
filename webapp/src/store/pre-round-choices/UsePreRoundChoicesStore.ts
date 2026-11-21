import {rememberedChoicesOfPersisted} from "@src/store/pre-round-choices/browser-storage/RememberedChoicesOfPersisted";
import type {PreRoundChoicesStore} from "@src/store/pre-round-choices/types/PreRoundChoicesStore";
import type {PersistedChoices} from "@src/store/pre-round-choices/types/PersistedChoices";
import {create} from "zustand";
import type {StateStorage} from "zustand/middleware";
import {createJSONStorage, persist} from "zustand/middleware";

/** The name the choices are kept under in the browser's storage. */
const STORAGE_NAME = "gunsmith.preRoundChoices";

/** Where there is no browser (a test in Node, which has a storage of its own that warns when touched) the choices are kept in memory only, and `persist` has nothing to complain about. */
const NO_STORAGE: StateStorage = {getItem: () => null, setItem: () => undefined, removeItem: () => undefined};

/** The pre-round's memory: the weapon for each slot and the arena a player last locked in, kept in this browser's local storage by zustand's `persist`. */
export const usePreRoundChoicesStore = create<PreRoundChoicesStore>()(
  persist(
    set => ({
      firstWeaponId: undefined,
      secondWeaponId: undefined,
      arenaId: undefined,
      remember: choices => {
        set(choices);
      },
    }),
    {
      name: STORAGE_NAME,
      storage: createJSONStorage(browserStorage),
      partialize: (state): PersistedChoices => ({
        firstWeaponId: state.firstWeaponId,
        secondWeaponId: state.secondWeaponId,
        arenaId: state.arenaId,
      }),
      merge: (persisted, current) => ({...current, ...rememberedChoicesOfPersisted(persisted)}),
    },
  ),
);

function browserStorage(): StateStorage {
  if (typeof window === "undefined") {
    return NO_STORAGE;
  }

  return window.localStorage;
}
