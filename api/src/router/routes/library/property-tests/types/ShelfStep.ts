/** One step of a run: keep a new item, or save or remove one already kept (picked by `pick`), as the account at `account`. */
export interface ShelfStep {
  action: "keep" | "save" | "remove";
  account: number;
  pick: number;
  weapon: boolean;
}
