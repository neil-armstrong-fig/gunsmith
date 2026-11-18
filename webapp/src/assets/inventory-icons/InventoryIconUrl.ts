const INVENTORY_ICON_URLS = new Map([
  ["rifle", "/assets/ui/ui-weapon-rifle.svg"],
  ["marksman-rifle", "/assets/ui/ui-weapon-marksman-rifle.svg"],
  ["submachine-gun", "/assets/ui/ui-weapon-submachine-gun.svg"],
]);

/** Resolves the HUD's authored icon key. Missing art leaves the slot's fallback to the HUD. */
export function inventoryIconUrl(identity: string | undefined): string | undefined {
  if (identity === undefined) return undefined;

  return INVENTORY_ICON_URLS.get(identity);
}
