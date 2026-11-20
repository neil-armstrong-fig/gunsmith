import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";

/** The part of the shelf's store that is kept in the browser: the saved weapons, and not the limit or the actions. */
export interface PersistedShelf {
  weapons: ShelfWeapon[];
}
