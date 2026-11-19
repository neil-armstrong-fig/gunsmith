import type {DefineWhen} from "@evals/eval-criteria-mapping/types/DefineWhen";
import type {DefineWhenFor} from "@evals/eval-criteria-mapping/types/DefineWhenFor";

/**
 * `when` for the request a spec makes; inside a trial's scope it nests a group of criteria that read the same answer. `when.each` is the
 * same `when` once per item of a table, as acceptance's `each` is, for a criterion that holds for every member of a set.
 */
export interface WhenBlock {
  (description: string, define: DefineWhen): void;
  each<Item>(items: readonly Item[], name: (item: Item) => string, define: DefineWhenFor<Item>): void;
}
