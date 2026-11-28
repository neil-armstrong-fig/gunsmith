import type {ItemKind} from "@src/shared/accounts/types/ItemKind";

/** An item on an account's shelf, as the database kept it: `payload` is whatever was stored, `unknown` until a reader parses it. */
export interface SavedItem {
  id: string;
  kind: ItemKind;
  prompt: string;
  payload: unknown;
  savedAt: Date;
}
