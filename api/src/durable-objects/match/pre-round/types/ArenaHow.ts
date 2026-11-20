import type {ArenaPickHow} from "@gunsmith/engine/arena-picking/types/ArenaPickHow";

/** How the arena was settled: the engine's rule, or `same` when both seats put forward one arena and nobody had to pick. */
export type ArenaHow = ArenaPickHow | "same";
