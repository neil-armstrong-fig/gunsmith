import type {WantedPick} from "@src/game/room-pre-round/types/WantedPick";

/** What the player has locked in, step by step, for the loop to send until the server holds it: the built-in weapon keys for slot 1 and slot 2, the built-in arena's name, the pick, and whether they asked to begin the match. */
export interface RoomWants {
  weapons: readonly [string | undefined, string | undefined];
  arena: string | undefined;
  pick: WantedPick | undefined;
  start: boolean;
}
