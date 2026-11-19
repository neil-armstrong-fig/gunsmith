import type {EvalFixtures} from "@evals/eval-criteria-mapping/types/EvalFixtures";

/** The body of a `when.each`: what a `when` does for one item of its table, handed the item and the DSLs. */
export type DefineWhenFor<Item> = (item: Item, fixtures: EvalFixtures) => void;
