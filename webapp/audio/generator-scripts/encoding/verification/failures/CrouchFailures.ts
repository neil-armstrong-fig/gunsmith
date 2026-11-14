import {VERIFICATION_LIMITS} from "@gunsmith/audio-studies/encoding/verification/limits/VerificationLimits";
import type {PcmMeasurement} from "@gunsmith/audio-studies/encoding/pcm/types/PcmMeasurement";

/** The crouched footfalls, by file name, that are not at least the margin quieter than the standing one of the same variant and format. */
export function crouchFailures(files: Readonly<Record<string, PcmMeasurement>>): string[] {
  const failures: string[] = [];
  for (const [name, measurement] of Object.entries(files)) {
    if (!name.startsWith("sfx-step-crouch")) {
      continue;
    }
    const stand = files[name.replace("crouch", "stand")];
    if (stand && measurement.rmsDbfs > stand.rmsDbfs - VERIFICATION_LIMITS.crouchMarginDb) {
      failures.push(`${name}: crouch less than ${VERIFICATION_LIMITS.crouchMarginDb} dB quieter`);
    }
  }

  return failures;
}
