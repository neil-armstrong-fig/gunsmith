import type {ArenaModerationVerdict} from "@gunsmith/ai/pipeline/arena/prompt-screening/moderation/verdict/ArenaModerationVerdict";

/**
 * The verdict when the judge cannot be read: the call failed, or its answer did not parse. Closed, never open: a request nobody
 * checked must not reach the generator.
 */
export const UNAVAILABLE_ARENA_VERDICT: ArenaModerationVerdict = {
  isArenaRequest: false,
  reason: "We could not check that request just now. Try again.",
};
