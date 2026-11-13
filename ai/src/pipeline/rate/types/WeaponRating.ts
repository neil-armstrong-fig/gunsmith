/**
 * What `rateWeaponDraft` answers: the damage per second a weapon in the cap was judged by, or one plain sentence saying it is over
 * the cap, short enough to hand to `repair`.
 */
export type WeaponRating = {ok: true; damagePerSecond: number} | {ok: false; errors: string[]};
