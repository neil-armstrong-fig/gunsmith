import {weaponDrawingFromSearch} from "@src/game/weapon-drawing/search/WeaponDrawingFromSearch";
import {roomOfPage} from "@src/online/RoomOfPage";

/** The local preview associates its pickup key with the page's untrusted fixture appearance. */
export function weaponDrawingOfPage(weaponKey: string | undefined): unknown {
  if (typeof location === "undefined" || weaponKey !== "submachine-gun" || roomOfPage() !== undefined) {
    return undefined;
  }

  return weaponDrawingFromSearch(location.search);
}
