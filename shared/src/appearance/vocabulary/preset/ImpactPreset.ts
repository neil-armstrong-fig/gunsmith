/** The decorative impact effects a renderer knows. Cosmetic only: none of them damages anything or shows a hidden player. */
export const IMPACT_PRESETS = ["spark", "burst", "ring", "pop"] as const;

/** One impact preset, read off the list so the two cannot drift apart. */
export type ImpactPreset = (typeof IMPACT_PRESETS)[number];
