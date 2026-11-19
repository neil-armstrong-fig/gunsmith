import {shelfWeaponsOfPersisted} from "@src/store/shelf/browser-storage/ShelfWeaponsOfPersisted";
import type {PersistedShelf} from "@src/store/shelf/types/PersistedShelf";
import type {ShelfStore} from "@src/store/shelf/types/ShelfStore";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";
import type {ShelfWeaponRequest} from "@src/store/shelf/types/ShelfWeaponRequest";
import {WEAPON_SHELF_LIMIT} from "@src/store/shelf/WeaponShelfLimit";
import {create} from "zustand";
import type {StateStorage} from "zustand/middleware";
import {createJSONStorage, persist} from "zustand/middleware";

/** The name the shelf is kept under in the browser's storage. */
const STORAGE_NAME = "gunsmith.shelf.weapons";

/** Where there is no browser (a test in Node, which has a storage of its own that warns when touched) the shelf is kept in memory only, and `persist` has nothing to complain about. */
const NO_STORAGE: StateStorage = {getItem: () => null, setItem: () => undefined, removeItem: () => undefined};

/**
 * The shelf's store: the weapons a player has saved, kept in this browser's local storage by zustand's `persist` so they outlast the page and need no AI to use. Only the
 * weapons are kept (the limit is the page's, the actions are code), and what comes back is parsed before it is trusted (`shelfWeaponsOfPersisted`). It is apart from the
 * workshop's store (what is being written and made now) so a save does not wake the prompt box.
 */
export const useShelfStore = create<ShelfStore>()(
  persist(
    (set, get) => ({
      weapons: [],
      weaponLimit: WEAPON_SHELF_LIMIT,
      saveWeapon: request => {
        const {weapons, weaponLimit} = get();
        if (weapons.length >= weaponLimit) {
          return undefined;
        }

        const saved = shelfWeaponOf(request);
        set({weapons: [...weapons, saved]});

        return saved.id;
      },
      replaceWeapon: (id, request) => {
        const {weapons} = get();
        if (!weapons.some(saved => saved.id === id)) {
          return undefined;
        }

        const replacement = shelfWeaponOf(request);
        set({
          weapons: weapons.map(saved => {
            if (saved.id === id) {
              return replacement;
            }

            return saved;
          }),
        });

        return replacement.id;
      },
      deleteWeapon: id => {
        set({weapons: get().weapons.filter(saved => saved.id !== id)});
      },
    }),
    {
      name: STORAGE_NAME,
      storage: createJSONStorage(browserStorage),
      partialize: (state): PersistedShelf => ({weapons: state.weapons}),
      merge: (persisted, current) => ({...current, weapons: shelfWeaponsOfPersisted(persisted)}),
    },
  ),
);

function shelfWeaponOf(request: ShelfWeaponRequest): ShelfWeapon {
  return {id: crypto.randomUUID(), prompt: request.prompt, weapon: request.weapon};
}

function browserStorage(): StateStorage {
  if (typeof window === "undefined") {
    return NO_STORAGE;
  }

  return window.localStorage;
}
