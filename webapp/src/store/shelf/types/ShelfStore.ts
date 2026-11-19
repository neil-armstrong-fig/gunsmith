import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";
import type {ShelfWeaponRequest} from "@src/store/shelf/types/ShelfWeaponRequest";

/**
 * Everything the shelf's store holds: the weapons a player has saved, on this browser, in the order they were saved. It is the stand-in for the library
 * (saved items on the account), which will say how many a player may keep; until then `weaponLimit` is a tunable of the page.
 */
export interface ShelfStore {
  weapons: ShelfWeapon[];
  /** The most weapons the shelf holds. */
  weaponLimit: number;
  /** Keeps a weapon at the end of the shelf and gives its id, or gives nothing and changes nothing when the shelf is full. */
  saveWeapon: (request: ShelfWeaponRequest) => string | undefined;
  /** Puts a weapon where the saved weapon `id` stood and gives the new weapon's id, or gives nothing and changes nothing when no weapon has that id. */
  replaceWeapon: (id: string, request: ShelfWeaponRequest) => string | undefined;
  deleteWeapon: (id: string) => void;
}
