/**
 * Every way a weapon request can end: a weapon was made, the request was turned away (not a weapon, too long), or it was a weapon
 * request but no valid weapon came out of it, even after the one repair.
 */
export const weaponOutcomeStatuses = ["created", "rejected", "invalid"] as const;

export type WeaponOutcomeStatus = (typeof weaponOutcomeStatuses)[number];
