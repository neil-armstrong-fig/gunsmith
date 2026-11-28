import type {ItemKind} from "@src/shared/accounts/types/ItemKind";

/** For a library test: an item to keep for an account and put on its shelf at `savedAt`. */
export interface ItemToSave {
  accountId: string;
  id: string;
  kind: ItemKind;
  savedAt: Date;
}
