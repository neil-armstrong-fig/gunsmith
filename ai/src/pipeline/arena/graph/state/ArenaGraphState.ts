import type {ArenaRelevance} from "@gunsmith/ai/pipeline/arena/types/ArenaRelevance";
import type {ArenaValidationFailure} from "@gunsmith/ai/pipeline/arena/check/validate/types/ArenaValidationFailure";
import type {ArenaProblemKind} from "@gunsmith/engine/arena-validation/types/ArenaProblemKind";
import {Annotation} from "@langchain/langgraph";
import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/**
 * What travels through the arena graph, and the only thing that does: the models are not in it, they are handed to the nodes that
 * use them, so the state is plain data. Most fields keep the last value written. Three are different on purpose: `errors` and
 * `repaired` are overwritten by each check (an empty `errors` says the last check passed), and `nodes` and `modelCalls` only ever
 * add, so the graph's own trail of what ran and what it cost is the outcome's, with nothing assembled by hand.
 */
export const ArenaGraphState = Annotation.Root({
  /** The player's words: data, never instructions. */
  prompt: Annotation<string>(),
  /** Why the request was turned away (too long, or not an arena request), in words a player may see. Set at most once, and it ends the run. */
  rejectionReason: Annotation<string | undefined>(),
  /** What the model wrote, `unknown` until `validate` has parsed it. */
  draft: Annotation<unknown>(),
  /** The arena once `validate` has accepted it: what the player gets. Never set by a draft that was refused. */
  arena: Annotation<ArenaDrawing | undefined>(),
  /** What the last check refused the draft for; empty when it passed. Handed to `repair`. */
  errors: Annotation<string[]>({reducer: (_current, update) => update, default: () => []}),
  relevance: Annotation<ArenaRelevance | undefined>(),
  validationFailure: Annotation<ArenaValidationFailure | undefined>(),
  /** The kinds of fault the last check found in an arena it read but could not accept; empty for any other refusal. Overwritten by each check, so the last one's are what is told. */
  problemKinds: Annotation<ArenaProblemKind[]>({reducer: (_current, update) => update, default: () => []}),
  codeEdits: Annotation<number>({reducer: (current, update) => current + update, default: () => 0}),
  /** Whether the one repair has been spent. */
  repaired: Annotation<boolean>({reducer: (_current, update) => update, default: () => false}),
  /** The nodes that ran, in order; each node adds its own name. */
  nodes: Annotation<string[]>({reducer: (current, update) => current.concat(update), default: () => []}),
  /** Model calls made so far, added up across the nodes. */
  modelCalls: Annotation<number>({reducer: (current, update) => current + update, default: () => 0}),
});
