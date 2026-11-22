import type {ArenaChoice} from "@src/durable-objects/match/messages/types/ArenaChoice";

/** A seat puts an arena forward, a built-in by name or a saved one by id, not yet locked in. */
export interface ChooseArenaAction {
  kind: "chooseArena";
  choice: ArenaChoice;
}
