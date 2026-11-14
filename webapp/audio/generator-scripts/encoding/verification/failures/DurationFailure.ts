import {ENCODER_SETTINGS} from "@gunsmith/audio-studies/encoding/settings/EncoderSettings";
import {VERIFICATION_LIMITS} from "@gunsmith/audio-studies/encoding/verification/limits/VerificationLimits";
import type {DurationCheck} from "@gunsmith/audio-studies/encoding/verification/failures/types/DurationCheck";

/** What is wrong with an export's length, or `undefined` when it decoded to the master's, give or take the tolerance. */
export function durationFailure(check: DurationCheck): string | undefined {
  const expected = Math.round(check.seconds * ENCODER_SETTINGS.sampleRate);
  if (Math.abs(check.frames - expected) <= VERIFICATION_LIMITS.durationToleranceFrames) {
    return undefined;
  }

  return `${check.name}: duration mismatch (${check.frames} frames; expected ${expected})`;
}
