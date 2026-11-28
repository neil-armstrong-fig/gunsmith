import {BUILT_IN_ARENAS} from "@gunsmith/engine/arena/built-in/BuiltInArenas";
import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";
import type {ChosenArena} from "@src/durable-objects/match/pre-round/types/ChosenArena";

/** The arena a choice names: the built-in with that name (`undefined` if there is none) or the saved arena the room already checked. */
export function arenaOfChoice(choice: ChosenArena | undefined): BuiltInArena | undefined {
  if (choice?.kind === "saved") {
    return choice.arena;
  }

  return BUILT_IN_ARENAS.find(arena => arena.name === choice?.name);
}
