import {weaponDraftSchema} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

/** A weapon's damage per second: its bullet's damage over its fire interval. Nothing if it does not parse, so it cannot be rated. */
export function damagePerSecondOf(weapon: unknown): number | undefined {
  const parsed = weaponDraftSchema.safeParse(weapon);
  if (!parsed.success) {
    return undefined;
  }

  return parsed.data.bulletDamage / parsed.data.fireIntervalSeconds;
}
