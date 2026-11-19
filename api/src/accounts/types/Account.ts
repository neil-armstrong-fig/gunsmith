/** A player's account as the rest of the Worker sees it: an opaque id (never Google's `sub`) and a generated display name. */
export interface Account {
  id: string;
  displayName: string;
}
