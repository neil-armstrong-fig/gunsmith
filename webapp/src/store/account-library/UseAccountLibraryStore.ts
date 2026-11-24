import type {AccountLibraryStore} from "@src/store/account-library/types/AccountLibraryStore";
import {shelfArenasOfPersisted} from "@src/store/shelf/arena/browser-storage/ShelfArenasOfPersisted";
import {parseAccountWeapon} from "@src/account/weapon/ParseAccountWeapon";
import {z} from "zod";
import {create} from "zustand";

const sessionAnswer = z.object({signedIn: z.boolean()});
const shelfAnswer = z.object({
  limits: z.object({arenas: z.number().int().nonnegative(), weapons: z.number().int().nonnegative()}),
  arenas: z.array(z.unknown()),
  weapons: z.array(z.unknown()),
});
const savedWeaponAnswer = z.object({
  id: z.string().min(1),
  prompt: z.string(),
  weapon: z.unknown(),
  appearance: z.unknown(),
});
const savedArenaAnswer = z.object({
  id: z.string(),
  prompt: z.string(),
  arena: z.object({name: z.string(), rows: z.array(z.string())}),
});

let connecting = false;
let shelfRequest = 0;

export const useAccountLibraryStore = create<AccountLibraryStore>()((set, get) => ({
  session: "checking",
  arenas: [],
  arenaLimit: undefined,
  weapons: [],
  weaponLimit: undefined,
  error: undefined,
  connect: async (sessionUrl, shelfUrl) => {
    if (connecting || get().session !== "checking") return;

    connecting = true;
    try {
      const response = await fetch(sessionUrl, {credentials: "include"});
      if (!response.ok || !sessionAnswer.parse(await response.json()).signedIn) {
        set({session: "guest"});
        return;
      }
    } catch {
      set({session: "guest"});
      return;
    } finally {
      connecting = false;
    }

    set({session: "signed-in"});
    await get().reload(shelfUrl);
  },
  remove: async (shelfUrl, id) => {
    const response = await fetch(`${shelfUrl}/${encodeURIComponent(id)}`, {method: "DELETE", credentials: "include"});
    if (!response.ok) throw new Error();

    await get().reload(shelfUrl);
  },
  reload: async shelfUrl => {
    const request = ++shelfRequest;
    try {
      const response = await fetch(shelfUrl, {credentials: "include"});
      if (!response.ok) throw new Error();

      const {arenas, limits, weapons} = shelfAnswer.parse(await response.json());
      if (request !== shelfRequest) return;

      const entries = arenas.flatMap(value => {
        const saved = savedArenaAnswer.safeParse(value);
        if (!saved.success) return [];

        const {id, prompt, arena} = saved.data;
        return [{...arena, id, prompt}];
      });
      const parsedWeapons = weapons.flatMap(value => {
        const saved = savedWeaponAnswer.safeParse(value);
        if (!saved.success) return [];

        const {id, prompt, weapon: stored, appearance} = saved.data;
        const weapon = parseAccountWeapon(stored, appearance);
        if (!weapon) return [];

        return [{id, prompt, weapon}];
      });
      set({
        arenas: shelfArenasOfPersisted({arenas: entries}),
        arenaLimit: limits.arenas,
        weapons: parsedWeapons,
        weaponLimit: limits.weapons,
        error: undefined,
      });
    } catch {
      if (request === shelfRequest) {
        set({error: "Could not load your account shelf."});
      }
    }
  },
}));
