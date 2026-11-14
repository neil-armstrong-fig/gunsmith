import {MASTERING} from "@gunsmith/audio-studies/output/mastering/Mastering";

/** What an export must still do after it has been compressed and decoded. A failure here is a finding, never a number to loosen. */
export const VERIFICATION_LIMITS = {
  /** How far a decoded length may be from the master's, in frames. Codecs pad and trim by a few samples. */
  durationToleranceFrames: 1,
  /** The loop-join limit a master was held to, so a loop may not click more after compression than before. */
  maxLoopJump: MASTERING.maxLoopJump,
  /** How much quieter, in decibels, a crouched footfall must be than the standing one beside it. */
  crouchMarginDb: 6,
  /** How far a looped playback may differ from the decoded loop repeated. This is a scheduling check, so it is nearly zero. */
  maxRepeatError: 0.000001,
} as const;
