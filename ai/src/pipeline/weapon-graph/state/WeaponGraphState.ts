import {Annotation} from "@langchain/langgraph";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";
import type {ValidatedWeapon} from "@gunsmith/ai/pipeline/weapon-graph/state/types/ValidatedWeapon";
import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

/**
 * What travels through the weapon graph, and the only thing that does: the models are not in it, they are handed to the nodes
 * that use them, so the state is plain data. Most fields keep the last value written. Three are different on purpose: `errors` and
 * `repaired` are overwritten by each check (an empty `errors` says the last check passed), and `nodes` and `modelCalls` only ever
 * add, so the graph's own trail of what ran and what it cost is the outcome's, with nothing assembled by hand.
 */
export const WeaponGraphState = Annotation.Root({
  /** The player's words: data, never instructions. */
  prompt: Annotation<string>(),
  /** Why the request was turned away (too long, or not a weapon request), in words a player may see. Set at most once, and it ends the run. */
  rejectionReason: Annotation<string | undefined>(),
  /** What the model wrote, `unknown` until `validate` has parsed it. */
  draft: Annotation<unknown>(),
  /** The draft once it has parsed: the weapon as written and the player's preference, for `balance`. */
  candidate: Annotation<ValidatedWeapon | undefined>(),
  /** The weapon once `balance` has brought it inside the limits; what `rate` checks and what the player gets. */
  weapon: Annotation<WeaponDraft | undefined>(),
  /** What the last check refused the draft for; empty when it passed. Handed to `repair`. */
  errors: Annotation<string[]>({reducer: (_current, update) => update, default: () => []}),
  /** Whether the one repair has been spent. */
  repaired: Annotation<boolean>({reducer: (_current, update) => update, default: () => false}),
  /** What the weapon looks like, with how it was drawn; set only by a weapon that passed. */
  appearance: Annotation<AppearanceOutcome | undefined>(),
  /** The nodes that ran, in order; each node adds its own name. A drawing's own nodes are added with an `appearance.` prefix. */
  nodes: Annotation<string[]>({reducer: (current, update) => current.concat(update), default: () => []}),
  /** Model calls made so far, added up across the nodes. */
  modelCalls: Annotation<number>({reducer: (current, update) => current + update, default: () => 0}),
});

/** The whole state, as a node reads it. */
export type WeaponGraphStateValues = typeof WeaponGraphState.State;

/** What a node hands back: only the fields it changes. */
export type WeaponGraphUpdate = typeof WeaponGraphState.Update;
