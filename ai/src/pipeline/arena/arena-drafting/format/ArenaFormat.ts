/** The ways a model may be asked to describe an arena: the drawing's rows, shapes that code draws into rows (`arena-shapes/`), or an edit of a built-in arena (`format/edit-built-in/`: a base arena named, then changes drawn onto it). */
export const ARENA_FORMATS = ["rows", "shapes", "editBuiltIn"] as const;

export type ArenaFormat = (typeof ARENA_FORMATS)[number];
