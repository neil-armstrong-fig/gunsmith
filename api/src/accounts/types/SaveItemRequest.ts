import type {ShelfLimits} from "@src/accounts/types/ShelfLimits";

/** A request to put a kept item on its account's shelf: which item, whose it must be, when, and the limits it must stay within. */
export interface SaveItemRequest {
  id: string;
  userId: string;
  now: Date;
  limits: ShelfLimits;
}
