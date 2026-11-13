import {STEP_VARIANTS, stepKey} from "@gunsmith/audio-studies/common/step-key/StepKey";
import type {MixEvent} from "@gunsmith/audio-studies/output/mix/timeline/types/MixEvent";

/** How long one run of effects takes, in seconds, and how many runs the audition plays back to back over the music. */
const REPEAT_SECONDS = 30;
const REPEATS = 3;

/** Seconds between standing steps and between crouched steps: a walk and a slower creep. */
const STAND_SPACING = 0.42;
const CROUCH_SPACING = 0.65;

/**
 * Where each effect sits in the audition mix: in each of three 30-second runs, a pickup, a reload, a ring warning and a hit,
 * then four standing steps from 2 seconds and four crouched steps from 9.5, alternating, one footfall variant at a time. It
 * is for listening, not a gameplay event schedule.
 */
export function mixTimeline(): MixEvent[] {
  const timeline: MixEvent[] = [];
  for (let repeat = 0; repeat < REPEATS; repeat += 1) {
    const offset = repeat * REPEAT_SECONDS;
    timeline.push(
      {at: offset + 1.2, key: "sfx-pickup"},
      {at: offset + 4.1, key: "sfx-reload"},
      {at: offset + 7.2, key: "sfx-ring-warning"},
      {at: offset + 12.3, key: "sfx-hit"},
    );
    for (let variant = 0; variant < STEP_VARIANTS; variant += 1) {
      timeline.push(
        {at: offset + 2 + variant * STAND_SPACING, key: stepKey("stand", variant)},
        {at: offset + 9.5 + variant * CROUCH_SPACING, key: stepKey("crouch", variant)},
      );
    }
  }

  return timeline;
}
