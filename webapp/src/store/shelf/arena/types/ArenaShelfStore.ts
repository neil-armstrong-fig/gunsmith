import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";
import type {ShelfArenaDraft} from "@src/store/shelf/arena/types/ShelfArenaDraft";

export interface ArenaShelfStore {
  arenas: ShelfArena[];
  save: (draft: ShelfArenaDraft) => string | undefined;
  replace: (id: string, draft: ShelfArenaDraft) => string | undefined;
  remove: (id: string) => void;
}
