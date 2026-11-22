import type {RevealedWeapons} from "@src/durable-objects/match/room/types/RevealedWeapons";

/** What a seat is told once, as the match begins: the two weapons each seat carries into it, from the receiving seat's side. */
export interface RevealMessage {
  kind: "reveal";
  weapons: RevealedWeapons;
}
