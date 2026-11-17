import {z} from "zod";
import {weaponDraftSchema} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

/**
 * What the model may write for a weapon, before code has dealt with it: the finished weapon's shape and name rule, but with no
 * range on any of the six stats. A number past either end of its range is data (the user's design, 2026-11-16: "code clamps it"),
 * so it is accepted here and `balance` brings it to the end of the range, instead of costing a repair call. What stays refused is
 * what is not a number the balancer can read: text, a missing field, a number that is not finite (zod refuses those), a fraction
 * where a whole number is needed, a stray field, a bad name. Strict like the weapon, so a stray field is refused, not dropped.
 */
export const weaponProposalSchema = weaponDraftSchema.extend({
  bulletDamage: z.number(),
  fireIntervalSeconds: z.number(),
  bulletSpeed: z.number(),
  magazineSize: z.number().int(),
  reloadSeconds: z.number(),
  startingReserve: z.number().int(),
});
