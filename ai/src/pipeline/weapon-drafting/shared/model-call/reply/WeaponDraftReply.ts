import {z} from "zod";

/**
 * The shape the model is asked to fill, and deliberately a loose one: the same fields as the weapon with their types, so the
 * model writes numbers as numbers (with no type at all it wrote every number as text, measured 2026-11-12), but no limits, no
 * whole-number rule, none required, and any extra field kept. LangChain parses a structured answer against the schema it is
 * given and throws on a value outside it, which would hide the answer from `validate` and `repair`. So the limits live in the
 * prompt, and the strict schema (`weaponDraftSchema` and the preference's) is applied afterwards, by code, where a refusal can be repaired. A value of the
 * wrong type still throws here, and `generateWeaponDraft` turns that into no answer.
 */
export const weaponDraftReplySchema = z.looseObject({
  name: z.string().optional().describe("a short plain name for the weapon"),
  bulletDamage: z.number().optional().describe("what one bullet takes off"),
  fireIntervalSeconds: z.number().optional().describe("seconds between one shot and the next"),
  bulletSpeed: z.number().optional().describe("how fast a bullet flies, in tiles per second"),
  magazineSize: z.number().optional().describe("rounds in the magazine, a whole number"),
  reloadSeconds: z.number().optional().describe("seconds a reload takes"),
  startingReserve: z.number().optional().describe("spare rounds at the start, a whole number"),
  visionDegrees: z.number().optional().describe("how wide the cone the holder sees in detail is, in degrees"),
  visionRange: z.number().optional().describe("how far the holder sees in detail, in tiles"),
  preference: z
    .object({
      favoured: z.array(z.string()).optional().describe("the stats the request wants high"),
      sacrificed: z.array(z.string()).optional().describe("the stats the request would give up, to be low"),
    })
    .optional()
    .describe("where the request wants the weapon's strength to go"),
});
