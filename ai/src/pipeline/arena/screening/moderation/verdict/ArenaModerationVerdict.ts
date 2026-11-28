import {z} from "zod";

/**
 * What the arena moderation judge must answer, and the shape its answer is parsed against: the model's output is `unknown` until
 * this has accepted it. DRAFT, local to `ai/`, the arena's twin of the weapon's verdict (a weapon request is not an arena request).
 */
export const arenaModerationVerdictSchema = z.object({
  isArenaRequest: z
    .boolean()
    .describe(
      "true when the request asks for an arena (a place to fight) for the game, however short or in any language",
    ),
  reason: z
    .string()
    .max(200)
    .describe("one short sentence a player may read: why the request is or is not an arena request"),
});

/** The verdict, read off its schema so the two cannot drift apart. */
export type ArenaModerationVerdict = z.infer<typeof arenaModerationVerdictSchema>;
