import type {ModerationVerdict} from "@gunsmith/ai/pipeline/moderation/ModerationVerdict";

/**
 * The verdict when the judge cannot be read: the call failed, or its answer did not parse. Closed, never open: a request nobody
 * checked must not reach the generator. It is a rejection for now; `build`'s typed failures (rejected, timed out, AI off) will
 * tell "we could not check" from "this is not a weapon", which matters for the refund.
 */
export const UNAVAILABLE_VERDICT: ModerationVerdict = {
  isWeaponRequest: false,
  reason: "We could not check that request just now. Try again.",
};
