/** What the store hands to the browser's storage: its three ids, each absent until the first lock in. */
export interface PersistedChoices {
  firstWeaponId: string | undefined;
  secondWeaponId: string | undefined;
  arenaId: string | undefined;
}
