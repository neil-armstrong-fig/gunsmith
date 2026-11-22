import type {RevealedWeapons} from "@src/online/types/RevealedWeapons";

/**
 * What the server sends each browser once, as the match begins: the weapons both players carry into it, a saved weapon with its numbers
 * and drawing since this page does not have the other player's. Written out here as `api/` writes it.
 */
export interface RevealFrame {
  kind: "reveal";
  weapons: RevealedWeapons;
}
