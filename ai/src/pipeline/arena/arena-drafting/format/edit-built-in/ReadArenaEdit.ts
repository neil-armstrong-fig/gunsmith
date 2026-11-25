import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {applyArenaEdit} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/edit-built-in/ApplyArenaEdit";
import {arenaEditDraftSchema} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/edit-built-in/ArenaEditDraft";
import {schemaErrors} from "@gunsmith/ai/pipeline/arena/check/validate/sentences/SchemaErrors";
import {sentenceOf} from "@gunsmith/ai/pipeline/arena/check/validate/sentences/SentenceOf";
import type {ArenaReading} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/types/ArenaReading";

/** Reads a model's reply as an edit of a built-in arena: zod, then the arena it names, then its changes drawn onto that arena's rows. */
export function readArenaEdit(reply: unknown): ArenaReading {
  const parsed = arenaEditDraftSchema.safeParse(reply);
  if (!parsed.success) {
    return {ok: false, errors: schemaErrors(parsed.error.issues), reason: "invalid-draft"};
  }

  const {base: baseName, ...changes} = parsed.data;
  const base = BUILT_IN_ARENAS.find(arena => arena.name === baseName);
  if (base === undefined) {
    // Only the model's words are cut: the names are code's, and the repair needs every one of them (twenty since 2026-11-24).
    const names = BUILT_IN_ARENAS.map(arena => `"${arena.name}"`).join(", ");

    return {
      ok: false,
      errors: [`base: there is no built-in arena called "${sentenceOf(baseName)}": use one of ${names}.`],
      reason: "invalid-draft",
    };
  }

  const edited = applyArenaEdit(base.rows, changes);
  if (!edited.ok) {
    return {ok: false, errors: edited.errors.map(sentenceOf), reason: "invalid-shapes"};
  }

  return {ok: true, drawing: edited.drawing};
}
