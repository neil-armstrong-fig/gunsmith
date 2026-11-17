import {weaponDrawingFromSearch} from "@src/game/scenario/weapon-drawing/WeaponDrawingFromSearch";

/** The drawing the page was opened with, still `unknown` until the renderer has parsed it. Outside a browser (a unit test) there is no query to read, so none. */
export function weaponDrawingOfPage(): unknown {
  if (typeof location === "undefined") {
    return undefined;
  }

  return weaponDrawingFromSearch(location.search);
}
