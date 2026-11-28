import type {ItemKind} from "@src/shared/accounts/types/ItemKind";

/** For a choices test: an item an account keeps, with the payload a generation route would have stored. */
export interface ItemOfAccount {
  accountId: string;
  id: string;
  kind: ItemKind;
  payload: unknown;
}
