import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import type {OfferedArena} from "@src/game/pre-round/types/OfferedArena";
import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";

const BUILT_IN_CHOICES: readonly OfferedArena[] = BUILT_IN_ARENAS.map(builtIn => ({
  id: `built-in:${builtIn.name}`,
  name: builtIn.name,
  arena: arenaFrom(builtIn.rows),
}));

/**
 * What a player may put forward as their arena: the built-in arenas, then every arena on the shelf in the order it was saved. `offered`
 * names the built-ins a room offers today, in its order (a name that is not a built-in is left out); every built-in unless given.
 */
export function arenaChoicesOf(saved: readonly ShelfArena[], offered?: readonly string[]): OfferedArena[] {
  return [
    ...builtInChoicesOf(offered),
    ...saved.map(item => ({id: item.id, name: item.name, arena: arenaFrom(item.rows)})),
  ];
}

function builtInChoicesOf(offered: readonly string[] | undefined): readonly OfferedArena[] {
  if (!offered) {
    return BUILT_IN_CHOICES;
  }

  return offered.flatMap(name => BUILT_IN_CHOICES.filter(choice => choice.name === name));
}
