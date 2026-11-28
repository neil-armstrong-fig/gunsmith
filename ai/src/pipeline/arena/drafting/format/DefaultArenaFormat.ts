import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/drafting/format/ArenaFormat";

/**
 * The format a model is asked to describe an arena in when nobody chose one, and the one place that says so (`createArenaGraph`
 * resolves it once, so a first try and its repair can never ask in different formats). Shapes: on Haiku 5.5 it fell back 0 of 12
 * times against 2 of 12 for rows, at the same cost (`docs/ai-arena-research.md`). A tunable, until the research turn compares the
 * candidates on Haiku and settles it.
 */
export const DEFAULT_ARENA_FORMAT: ArenaFormat = "shapes";
