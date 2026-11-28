import cactus from "@src/game/weapon-drawing/search/fixtures/CactusDrawing.json";
import lantern from "@src/game/weapon-drawing/search/fixtures/LanternDrawing.json";

/**
 * The drawings a page's query can name, with `?weaponDrawing=`: a seam for the specs and for looking at a drawing, since nothing links a real weapon to a drawing
 * yet (the engine's `Weapon` has no appearance). `lantern` is art's jellyfish cage; `refused` is the same drawing at a version the schema does not know, so the game
 * draws its stand-in. `cactus` is art's branching cluster. The fixtures ship in the production bundle behind the query, like `?ringDelay=`. A Map, so a name like `constructor` is no drawing.
 */
const NAMED_DRAWINGS = new Map<string, unknown>([
  ["lantern", lantern],
  ["cactus", cactus],
  ["refused", {...lantern, version: 2}],
]);

/** The drawing the query names, as the untrusted `unknown` the renderer must parse; `undefined` when it names none or one the game does not have. The same object every time for a name. */
export function weaponDrawingFromSearch(search: string): unknown {
  const asked = new URLSearchParams(search).get("weaponDrawing");
  if (asked === null) {
    return undefined;
  }

  return NAMED_DRAWINGS.get(asked);
}
