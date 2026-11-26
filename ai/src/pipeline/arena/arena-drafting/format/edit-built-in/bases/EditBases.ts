import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import type {EditBase} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/edit-built-in/bases/types/EditBase";

/**
 * The archetypes the edit format starts from: a plain room, one raised level and two raised levels. A base earns its place by giving
 * what rectangles draw badly (legal stairs between levels, a size) and must not itself be a likely answer, since Haiku hands back a
 * base that already fits nearly unchanged (2026-11-25: offered all twenty, it returned Cover yard untouched for cover and Cellblock for
 * two rooms). Walls, cover and rooms are drawn by the model. Four is the ceiling. A test holds the names to engine's pool.
 */
const DESCRIPTIONS: Record<string, string> = {
  Duel: "a plain small room with four wall blocks, no cover and no raised floor",
  "Fair duel": "a small room with a platform one level up in the middle and a stair on each side",
  Ziggurat: "a stepped pyramid in the middle, one level up and then two, with stairs on both sides",
};

export const EDIT_BASES: readonly EditBase[] = BUILT_IN_ARENAS.flatMap(arena => {
  const description = DESCRIPTIONS[arena.name];
  if (description === undefined) return [];

  return [{arena, description}];
});
