import type {WantedPick} from "@src/game/room-pre-round/types/WantedPick";

/** One thing the player has locked in that the server does not yet hold, and so is to be sent: a weapon for a slot, the arena, the pick, or the ask to begin the match. */
export type DueAction =
  | {kind: "weapon"; slot: 1 | 2; key: string}
  | {kind: "arena"; name: string}
  | {kind: "pick"; pick: WantedPick}
  | {kind: "start"};
