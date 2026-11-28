import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/** What drawing an arena's shapes gives: the drawing, or a sentence for each shape that does not fit the arena. */
export type ArenaShapesCompilation = {ok: true; drawing: ArenaDrawing} | {ok: false; errors: string[]};
