import {makeMetallic} from "@gunsmith/audio-studies/generators/effects/metallic/MakeMetallic";
import {METALLIC_EFFECTS} from "@gunsmith/audio-studies/generators/effects/metallic/recipes/MetallicEffects";
import {makeStep} from "@gunsmith/audio-studies/generators/effects/steps/MakeStep";
import {STEP_VARIANTS} from "@gunsmith/audio-studies/common/step-key/StepVariants";
import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";

/** Original metallic gestures, neutral stingers and dry single footfalls, in the order they are rendered and measured. */
export function makeEffects(): Cue[] {
  const variants = Array.from({length: STEP_VARIANTS}, (_, variant) => variant);

  return [
    ...METALLIC_EFFECTS.map(makeMetallic),
    ...variants.flatMap(variant => [makeStep("stand", variant), makeStep("crouch", variant)]),
  ];
}
