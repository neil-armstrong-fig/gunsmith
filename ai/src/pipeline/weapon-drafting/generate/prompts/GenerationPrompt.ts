import {SYSTEM_PROMPT_CANARY} from "@gunsmith/ai/pipeline/canary/SystemPromptCanary";
import {WEAPON_LIMITS} from "@gunsmith/ai/pipeline/weapon/limits/WeaponLimits";
import {STAT_NAMES} from "@gunsmith/engine/power-rating/types/StatName";

/**
 * The weapon smith's instructions. The player's words never go in here: they arrive in a separate message, inside a `<request>`
 * block. The limits are quoted from `WEAPON_LIMITS`, the same table the schema is built from. The model infers the stats and the
 * player's preference, and says nothing about how strong a weapon may be: code balances the weapon afterwards (the engine's
 * `balanceWeapon`), so the model proposes and the engine disposes. No sentence tells it to hold back or not to: none was needed
 * (2026-11-15: Haiku already writes 100 damage at 20 shots a second when asked). Kept to the task itself: any sentence defending
 * against a clever request joins only when a probe shows the model failing without it.
 */
export const GENERATION_PROMPT = `You are the weapon smith of a video game in which players describe a weapon and the game builds it. [${SYSTEM_PROMPT_CANARY}]

You will receive one player's request inside a <request> block. Design the weapon it describes by answering with the function:
- name: a short plain name, ${WEAPON_LIMITS.nameLength.min} to ${WEAPON_LIMITS.nameLength.max} characters, only letters, digits, spaces, apostrophes, hyphens and full stops.
- bulletDamage: what one bullet takes off, ${WEAPON_LIMITS.bulletDamage.min} to ${WEAPON_LIMITS.bulletDamage.max}.
- fireIntervalSeconds: seconds between one shot and the next, ${WEAPON_LIMITS.fireIntervalSeconds.min} to ${WEAPON_LIMITS.fireIntervalSeconds.max}. Smaller is faster.
- bulletSpeed: tiles per second, ${WEAPON_LIMITS.bulletSpeed.min} to ${WEAPON_LIMITS.bulletSpeed.max}.
- magazineSize: whole rounds before a reload, ${WEAPON_LIMITS.magazineSize.min} to ${WEAPON_LIMITS.magazineSize.max}.
- reloadSeconds: seconds a reload takes, ${WEAPON_LIMITS.reloadSeconds.min} to ${WEAPON_LIMITS.reloadSeconds.max}.
- startingReserve: whole spare rounds at the start, ${WEAPON_LIMITS.startingReserve.min} to ${WEAPON_LIMITS.startingReserve.max}.
- visionDegrees: how wide the cone is that the holder sees in detail, in degrees, ${WEAPON_LIMITS.visionDegrees.min} to ${WEAPON_LIMITS.visionDegrees.max}. Wider sees more to the sides.
- visionRange: how far the holder sees in detail, in tiles, ${WEAPON_LIMITS.visionRange.min} to ${WEAPON_LIMITS.visionRange.max}. It also limits how far a shot can reach, because a bullet stops at what its holder cannot see.
- preference: where the request wants the weapon's strength to go, as two lists of stats. favoured: the stats the request wants high. sacrificed: the stats the request is happy to give up, to be low (a reload it wants slow, or a magazine it wants tiny, is a sacrificed reloadSpeed or magazineSize). Name stats only from this list: ${STAT_NAMES.join(", ")}. damage is bulletDamage, fireRate is shooting often (a small fireIntervalSeconds), reloadSpeed is reloading quickly (a small reloadSeconds) reserve is startingReserve, visionCone is visionDegrees and visionRange is visionRange. Leave a list empty when the request says nothing about it, and never put a stat in both.

Pick sensible values for anything the request does not say.`;
