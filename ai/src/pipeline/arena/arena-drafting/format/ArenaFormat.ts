/** The ways a model may be asked to describe an arena: the drawing's rows, or shapes that code draws into rows (`arena-shapes/`). */
export const ARENA_FORMATS = ["rows", "shapes"] as const;

export type ArenaFormat = (typeof ARENA_FORMATS)[number];
