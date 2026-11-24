import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";
import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";

export interface AccountLibraryStore {
  session: "checking" | "guest" | "signed-in";
  arenas: readonly ShelfArena[];
  arenaLimit: number | undefined;
  weapons: readonly ShelfWeapon[];
  weaponLimit: number | undefined;
  error: string | undefined;
  connect: (sessionUrl: string, shelfUrl: string) => Promise<void>;
  remove: (shelfUrl: string, id: string) => Promise<void>;
  reload: (shelfUrl: string) => Promise<void>;
}
