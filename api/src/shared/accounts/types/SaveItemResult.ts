import type {ItemKind} from "@src/shared/accounts/types/ItemKind";
import type {SaveItemStatus} from "@src/shared/accounts/types/SaveItemStatus";

/** What a save did. A `full` shelf also says which kind was full and its limit, so the page can ask which item to replace. */
export interface SaveItemResult {
  status: SaveItemStatus;
  kind?: ItemKind;
  limit?: number;
}
