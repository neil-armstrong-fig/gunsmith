import {isMusicKey} from "@gunsmith/audio-studies/encoding/files/IsMusicKey";
import {VERIFICATION_LIMITS} from "@gunsmith/audio-studies/encoding/verification/limits/VerificationLimits";
import type {LoopCheck} from "@gunsmith/audio-studies/encoding/verification/failures/types/LoopCheck";

/** What is wrong with a music loop's join, or `undefined` when it is within the limit or is not a loop. */
export function loopFailure(check: LoopCheck): string | undefined {
  if (!isMusicKey(check.key)) {
    return undefined;
  }
  if (check.loopJump > VERIFICATION_LIMITS.maxLoopJump) {
    return `${check.name}: loop discontinuity`;
  }

  return undefined;
}
