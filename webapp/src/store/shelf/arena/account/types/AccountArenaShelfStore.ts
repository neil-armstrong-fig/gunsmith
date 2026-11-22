import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";

export interface AccountArenaShelfStore {
  session: "checking" | "guest" | "signed-in";
  arenas: readonly ShelfArena[];
  limit: number | undefined;
  error: string | undefined;
  connect: (sessionUrl: string, shelfUrl: string) => Promise<void>;
  reload: (shelfUrl: string) => Promise<void>;
}
