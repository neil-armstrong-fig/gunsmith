/**
 * The animations a renderer knows, by name only. `art` proposes a bounded amount and speed for the moving ones and has not
 * defined them, so a preset here carries no parameters yet and the fixtures use only `none`.
 */
export const ANIMATION_PRESETS = ["none", "pulse", "spin", "recoil"] as const;

/** One animation preset, read off the list so the two cannot drift apart. */
export type AnimationPreset = (typeof ANIMATION_PRESETS)[number];
