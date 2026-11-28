import type {ItemKind} from "@src/shared/accounts/types/ItemKind";

/** A generated item to keep: its id, whose it is, what it is, the prompt that made it, the result (kept as JSON) and when. */
export interface NewGeneratedItem {
  id: string;
  userId: string;
  kind: ItemKind;
  prompt: string;
  payload: unknown;
  now: Date;
}
