import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/**
 * The built-in arenas the evals hand the pipeline to fall back to: the mapping's own two small, plain rooms, until engine owns one
 * list of built-ins (requested in `HANDOFF.md`). They are not the game's arenas, only enough to prove the fallback path.
 */
export const BUILT_IN_ARENA_FIXTURES: readonly ArenaDrawing[] = [
  {name: "Open Room", rows: ["##########", "#........#", "#........#", "#........#", "##########"]},
  {name: "Two Rooms", rows: ["############", "#.....#....#", "#..........#", "#.....#....#", "############"]},
];
