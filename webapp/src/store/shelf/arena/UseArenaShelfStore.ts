import {shelfArenasOfPersisted} from "@src/store/shelf/arena/browser-storage/ShelfArenasOfPersisted";
import {ARENA_SHELF_LIMIT} from "@src/store/shelf/arena/limits/ArenaShelfLimit";
import type {ArenaShelfStore} from "@src/store/shelf/arena/types/ArenaShelfStore";
import {create} from "zustand";
import type {StateStorage} from "zustand/middleware";
import {createJSONStorage, persist} from "zustand/middleware";

const NO_STORAGE: StateStorage = {getItem: () => null, setItem: () => undefined, removeItem: () => undefined};

export const useArenaShelfStore = create<ArenaShelfStore>()(
  persist(
    (set, get) => ({
      arenas: [],
      save: draft => {
        const {arenas} = get();
        if (arenas.length >= ARENA_SHELF_LIMIT) return undefined;

        const id = crypto.randomUUID();
        set({arenas: [...arenas, {...draft, id}]});

        return id;
      },
      replace: (replacedId, draft) => {
        const {arenas} = get();
        if (!arenas.some(arena => arena.id === replacedId)) return undefined;

        const id = crypto.randomUUID();
        const replacement = {...draft, id};
        set({
          arenas: arenas.map(arena => {
            if (arena.id === replacedId) return replacement;

            return arena;
          }),
        });

        return id;
      },
      remove: id => {
        set({arenas: get().arenas.filter(arena => arena.id !== id)});
      },
    }),
    {
      name: "gunsmith.shelf.arenas",
      storage: createJSONStorage(browserStorage),
      partialize: state => ({arenas: state.arenas}),
      merge: (persisted, current) => ({...current, arenas: shelfArenasOfPersisted(persisted)}),
    },
  ),
);

function browserStorage(): StateStorage {
  if (typeof window === "undefined") return NO_STORAGE;

  return window.localStorage;
}
