/**
 * The two ways a player may ask for an arena to be made, named for a colour so a name says nothing about the method (decided with the
 * user, 2026-11-23): **blue** makes the arena of any size from shapes, **red** edits one of the built-in arenas, so keeps its
 * standard size (`docs/ai-arena-research.md`). The webapp offers the choice, `api/` takes it from the request and `ai/` maps it to a format.
 */
export const ARENA_STYLES = ["blue", "red"] as const;

/** One style, read off the list so the two cannot drift apart. */
export type ArenaStyle = (typeof ARENA_STYLES)[number];
