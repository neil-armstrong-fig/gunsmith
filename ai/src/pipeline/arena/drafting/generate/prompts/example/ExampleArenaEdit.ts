import type {ArenaEdit} from "@gunsmith/ai/pipeline/arena/drafting/format/edit-built-in/ArenaEditDraft";

/**
 * The one edit the edit prompt shows the model: the "Duel" arena with a wall block in the middle of its north side, so a request
 * for "a duel with something to hide behind in the middle" is answered by changing a little and keeping the rest. It adds no cover
 * block (`c`) on purpose: a model copies its example, so cover here would make a copy look like cover the model chose. A test holds it to the validator.
 */
export const EXAMPLE_ARENA_EDIT: ArenaEdit = {
  name: "Duel With A Block",
  base: "Duel",
  walls: [{x: 9, y: 1, width: 2, height: 2}],
};
