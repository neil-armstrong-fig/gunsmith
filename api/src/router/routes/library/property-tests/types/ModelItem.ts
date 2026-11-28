import type {ItemKind} from "@src/shared/accounts/types/ItemKind";

/** The property test's own record of a kept item: whose it is, what kind, and whether the shelf should hold it. */
export interface ModelItem {
  id: string;
  owner: string;
  kind: ItemKind;
  saved: boolean;
}
