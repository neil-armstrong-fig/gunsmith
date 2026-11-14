import {z} from "zod";

/**
 * What the moderation judge must answer, and the shape its answer is parsed against: the model's output is `unknown` until this
 * has accepted it. DRAFT, local to `ai/`. Only the fields a case needs are here; a safety or injection flag joins when an eval asks.
 */
export const moderationVerdictSchema = z.object({
  isWeaponRequest: z
    .boolean()
    .describe("true when the request asks for a weapon for the game, however silly, short or in any language"),
  reason: z
    .string()
    .max(200)
    .describe("one short sentence a player may read: why the request is or is not a weapon request"),
});

/** The verdict, read off its schema so the two cannot drift apart. */
export type ModerationVerdict = z.infer<typeof moderationVerdictSchema>;
