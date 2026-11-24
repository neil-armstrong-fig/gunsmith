import {withoutEmptyRectangles} from "@gunsmith/ai/pipeline/arena/arena-shapes/empty-rectangles/WithoutEmptyRectangles";
import {compileArenaShapes} from "@gunsmith/ai/pipeline/arena/arena-shapes/compile/CompileArenaShapes";
import {arenaShapesDraftSchema} from "@gunsmith/ai/pipeline/arena/arena-shapes/draft/ArenaShapesDraft";
import {schemaErrors} from "@gunsmith/ai/pipeline/arena/check/validate/sentences/SchemaErrors";
import {sentenceOf} from "@gunsmith/ai/pipeline/arena/check/validate/sentences/SentenceOf";
import type {ArenaReading} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/types/ArenaReading";

/** Reads a model's reply as shapes: a rectangle with no size is dropped, then zod, then the shapes drawn into rows, each fault a sentence the repair can show. */
export function readArenaShapes(reply: unknown): ArenaReading {
  const shapes = arenaShapesDraftSchema.safeParse(withoutEmptyRectangles(reply));
  if (!shapes.success) {
    return {ok: false, errors: schemaErrors(shapes.error.issues), reason: "invalid-draft"};
  }

  const compiled = compileArenaShapes(shapes.data);
  if (!compiled.ok) {
    return {ok: false, errors: compiled.errors.map(sentenceOf), reason: "invalid-shapes"};
  }

  return {ok: true, drawing: compiled.drawing};
}
