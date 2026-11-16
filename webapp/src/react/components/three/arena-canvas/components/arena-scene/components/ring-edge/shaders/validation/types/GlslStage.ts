/** The two stages a ShaderMaterial has. */
export const GLSL_STAGES = ["vertex", "fragment"] as const;

export type GlslStage = (typeof GLSL_STAGES)[number];
