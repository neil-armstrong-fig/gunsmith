import type {ShownArena} from "@src/game/online-pre-round/types/ShownArena";
import type {SlotReadout} from "@src/game/online-pre-round/types/SlotReadout";

/** What the page knows of one seat while choosing: its two weapons, its arena (the other seat's only once both are locked in) and the flags. */
export interface SeatReadout {
  slots: readonly [SlotReadout, SlotReadout];
  arena: ShownArena | undefined;
  arenaLocked: boolean;
  picked: boolean;
  /** Whether the seat has asked to begin the match, while the decided arena and weapons are shown. */
  ready: boolean;
}
