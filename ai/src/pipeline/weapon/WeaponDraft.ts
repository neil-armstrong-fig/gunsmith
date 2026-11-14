import {z} from "zod";
import {WEAPON_LIMITS} from "@gunsmith/ai/pipeline/weapon/limits/WeaponLimits";

/** Letters (any language) and digits, with spaces, apostrophes, hyphens and full stops inside. No markup, braces or backticks. */
const WEAPON_NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} '.-]*$/u;

/**
 * What a generated weapon is: a name and the six numbers `engine/`'s `Weapon` plays with, each between the floor and cap in
 * `WEAPON_LIMITS`. DRAFT, local to `ai/` until `build` freezes the real contract in `HANDOFF.md`. Strict, so a stray model field
 * is refused, not dropped. The limits bound each number alone; how strong the numbers are together (damage per second) is
 * `rate`'s to judge.
 */
export const weaponDraftSchema = z
  .object({
    name: z.string().min(WEAPON_LIMITS.nameLength.min).max(WEAPON_LIMITS.nameLength.max).regex(WEAPON_NAME_PATTERN),
    bulletDamage: z.number().min(WEAPON_LIMITS.bulletDamage.min).max(WEAPON_LIMITS.bulletDamage.max),
    fireIntervalSeconds: z
      .number()
      .min(WEAPON_LIMITS.fireIntervalSeconds.min)
      .max(WEAPON_LIMITS.fireIntervalSeconds.max),
    bulletSpeed: z.number().min(WEAPON_LIMITS.bulletSpeed.min).max(WEAPON_LIMITS.bulletSpeed.max),
    magazineSize: z.number().int().min(WEAPON_LIMITS.magazineSize.min).max(WEAPON_LIMITS.magazineSize.max),
    reloadSeconds: z.number().min(WEAPON_LIMITS.reloadSeconds.min).max(WEAPON_LIMITS.reloadSeconds.max),
    startingReserve: z.number().int().min(WEAPON_LIMITS.startingReserve.min).max(WEAPON_LIMITS.startingReserve.max),
  })
  .strict();

/** The weapon, read off its schema so the two cannot drift apart. */
export type WeaponDraft = z.infer<typeof weaponDraftSchema>;
