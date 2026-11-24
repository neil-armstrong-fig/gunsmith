import type {RevealedArena} from "@src/durable-objects/match/room/types/RevealedArena";
import type {RevealedWeapons} from "@src/durable-objects/match/room/types/RevealedWeapons";

/** What a seat is told once, when the pre-round has decided (and again if it comes back while the reveal is shown): the arena and the two weapons each seat carries into the match, from the receiving seat's side. */
export interface RevealMessage {
  kind: "reveal";
  /** The arena the match is played in, with its drawing: the same for both seats. */
  arena: RevealedArena;
  weapons: RevealedWeapons;
}
