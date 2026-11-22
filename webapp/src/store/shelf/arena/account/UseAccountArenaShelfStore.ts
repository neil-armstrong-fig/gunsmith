import type {AccountArenaShelfStore} from "@src/store/shelf/arena/account/types/AccountArenaShelfStore";
import {shelfArenasOfPersisted} from "@src/store/shelf/arena/browser-storage/ShelfArenasOfPersisted";
import {z} from "zod";
import {create} from "zustand";

const sessionAnswer = z.object({signedIn: z.boolean()});
const shelfAnswer = z.object({
  limits: z.object({arenas: z.number().int().nonnegative()}),
  arenas: z.array(z.unknown()),
});
const savedAnswer = z.object({
  id: z.string(),
  prompt: z.string(),
  arena: z.object({name: z.string(), rows: z.array(z.string())}),
});

let connecting = false;
let shelfRequest = 0;

export const useAccountArenaShelfStore = create<AccountArenaShelfStore>()((set, get) => ({
  session: "checking",
  arenas: [],
  limit: undefined,
  error: undefined,
  connect: async (sessionUrl, shelfUrl) => {
    if (connecting || get().session !== "checking") return;

    connecting = true;
    try {
      const response = await fetch(sessionUrl, {credentials: "include"});
      if (!response.ok || !sessionAnswer.parse(await response.json()).signedIn) {
        set({session: "guest", arenas: [], limit: undefined, error: undefined});
        return;
      }
    } catch {
      set({session: "guest", arenas: [], limit: undefined, error: undefined});
      return;
    } finally {
      connecting = false;
    }

    set({session: "signed-in"});
    await get().reload(shelfUrl);
  },
  reload: async shelfUrl => {
    const request = ++shelfRequest;
    try {
      const response = await fetch(shelfUrl, {credentials: "include"});
      if (!response.ok) throw new Error();

      const {arenas, limits} = shelfAnswer.parse(await response.json());
      if (request !== shelfRequest) return;

      const entries = arenas.flatMap(value => {
        const saved = savedAnswer.safeParse(value);
        if (!saved.success) return [];

        const {id, prompt, arena} = saved.data;
        return [{...arena, id, prompt}];
      });
      set({arenas: shelfArenasOfPersisted({arenas: entries}), limit: limits.arenas, error: undefined});
    } catch {
      if (request === shelfRequest) {
        set({error: "Could not load your saved arenas."});
      }
    }
  },
}));
