import type {LimitRange} from "@gunsmith/engine/arena-limits/types/LimitRange";

/**
 * How many characters a generated arena's name may have. The schema is built from it and the generation prompt quotes it, so the rule
 * the model is told and the rule the code enforces cannot drift apart. The arena's size is engine's (`ARENA_LIMITS`); the name is a
 * rule only a model-drawn arena has, so it stays here. A tunable, set by play.
 */
export const ARENA_NAME_LENGTH: LimitRange = {min: 2, max: 30};
