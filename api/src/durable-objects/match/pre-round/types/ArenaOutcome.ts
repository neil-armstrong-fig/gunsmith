import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";
import type {ArenaHow} from "@src/durable-objects/match/pre-round/types/ArenaHow";

/** What the arena step settled: the arena the match is played in and how. */
export interface ArenaOutcome {
  arena: BuiltInArena;
  how: ArenaHow;
}
