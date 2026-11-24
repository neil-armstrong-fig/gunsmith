import {validateArenaDraft} from "@gunsmith/ai/pipeline/arena/check/validate/ValidateArenaDraft";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ArenaFormat";
import type {ArenaGraphStateValues} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphStateValues";
import type {ArenaGraphUpdate} from "@gunsmith/ai/pipeline/arena/arena-graph/state/types/ArenaGraphUpdate";

/**
 * The first place the model's answer is trusted as an arena: zod, the engine's reading of the drawing and the playability rules. A
 * draft that passes becomes the arena and the last refusal is cleared; one that does not is refused with a sentence for each fault.
 */
export function validateNode(state: ArenaGraphStateValues, format: ArenaFormat): ArenaGraphUpdate {
  const validation = validateArenaDraft(state.draft, format);
  if (!validation.ok) {
    return {
      errors: validation.errors,
      nodes: ["validate"],
      codeEdits: validation.codeEdits,
      validationFailure: validation.reason,
    };
  }

  return {arena: validation.arena, errors: [], nodes: ["validate"], codeEdits: validation.codeEdits};
}
