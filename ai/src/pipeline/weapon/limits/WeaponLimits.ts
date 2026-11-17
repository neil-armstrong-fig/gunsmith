import {STAT_RANGES} from "@gunsmith/engine/power-rating/ranges/StatRanges";

/**
 * The floor and cap of every weapon field. The schema is built from this table and the generation prompt quotes it, so the
 * rule the model is told and the rule the code enforces cannot drift apart. The six stats' ranges are the engine's
 * (`STAT_RANGES`, the one home of them, which the balancer trims within); the name's length is the only limit that is `ai/`'s own.
 * DRAFT, local to `ai/` until `build` freezes the real contract in `HANDOFF.md`; every number is a tunable, set by play.
 */
export const WEAPON_LIMITS = {
  nameLength: {min: 2, max: 24},
  ...STAT_RANGES,
} as const;
