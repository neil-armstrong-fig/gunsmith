import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";
import type {ArenaHow} from "@src/durable-objects/match/pre-round/types/ArenaHow";

/** What the pre-round decided, once it has: the arena the match is played in and how it was settled. */
export interface PreRoundOutcome {
  arena: BuiltInArena;
  how: ArenaHow;
}
