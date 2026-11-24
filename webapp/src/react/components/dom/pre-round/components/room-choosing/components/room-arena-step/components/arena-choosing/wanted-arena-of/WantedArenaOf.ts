import type {OfferedArena} from "@src/game/pre-round/types/OfferedArena";
import type {WantedArena} from "@src/game/room-pre-round/types/WantedArena";
import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";

/**
 * What the room is to be told for the arena the player chose: one of their saved arenas by its library id when the choice is one of them, else a
 * built-in by its name. A saved arena is never sent by its name or its rows, since the server finds the id among that account's saved items.
 */
export function wantedArenaOf(chosen: OfferedArena, savedArenas: readonly ShelfArena[]): WantedArena {
  if (savedArenas.some(saved => saved.id === chosen.id)) {
    return {kind: "saved", id: chosen.id};
  }

  return {kind: "builtIn", name: chosen.name};
}
