import {defineWhen} from "@evals/eval-criteria-mapping/mapping/when/DefineWhen";
import type {DefineWhenFor} from "@evals/eval-criteria-mapping/types/DefineWhenFor";

/** A `when` for each item of a table, named from the item, each row carrying its own reason. */
export function defineEachWhen<Item>(
  items: readonly Item[],
  name: (item: Item) => string,
  define: DefineWhenFor<Item>,
): void {
  for (const item of items) {
    defineWhen(name(item), fixtures => define(item, fixtures));
  }
}
