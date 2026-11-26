import type {BuiltInArena} from "@gunsmith/engine/built-in-arenas/types/BuiltInArena";

/** A built-in arena the edit format offers as a starting point, with the line the prompt says about it. */
export interface EditBase {
  arena: BuiltInArena;
  description: string;
}
