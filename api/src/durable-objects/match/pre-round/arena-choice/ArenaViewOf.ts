import type {ArenaView} from "@src/durable-objects/match/pre-round/types/ArenaView";
import type {ChosenArena} from "@src/durable-objects/match/pre-round/types/ChosenArena";

/**
 * How a seat is shown an arena: a built-in by name, a saved one by its name (never its id), with its drawing when `withDrawing` says the
 * seat is not the one who chose it and must see it (a page has only its own saved arenas).
 */
export function arenaViewOf(choice: ChosenArena, withDrawing: boolean): ArenaView {
  if (choice.kind === "builtIn") {
    return {kind: "builtIn", name: choice.name};
  }
  if (withDrawing) {
    return {kind: "saved", name: choice.arena.name, rows: choice.arena.rows};
  }

  return {kind: "saved", name: choice.arena.name};
}
