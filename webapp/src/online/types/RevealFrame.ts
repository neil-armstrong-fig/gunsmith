import type {RevealedArena} from "@src/online/types/RevealedArena";
import type {RevealedWeapons} from "@src/online/types/RevealedWeapons";

/**
 * What the server sends each browser once, when the pre-round has decided (and again if it comes back while the reveal is shown): the arena and the weapons both players carry into the match, a saved weapon with its numbers
 * and drawing since this page does not have the other player's. Written out here as `api/` writes it.
 */
export interface RevealFrame {
  kind: "reveal";
  arena: RevealedArena;
  weapons: RevealedWeapons;
}
