import {HEARING_RANGES} from "@gunsmith/engine/sound/hearing/HearingRanges";
import {heardInStep} from "@gunsmith/engine/sound/HeardInStep";
import type {NoiseOfFighter} from "@gunsmith/engine/sound/types/NoiseOfFighter";

const LISTENER = {x: 10, y: 10};
const QUIET: NoiseOfFighter = {position: {x: 14, y: 10}, shot: false, footfall: false, tookPickupAt: undefined};

it("hears nothing from a fighter who made no noise", () => {
  expect(heardInStep(LISTENER, QUIET)).toEqual([]);
});

it("hears a shot, a footfall and a pickup in that order, each from where it was made", () => {
  const noisy: NoiseOfFighter = {...QUIET, shot: true, footfall: true, tookPickupAt: {x: 10, y: 15}};

  expect(heardInStep(LISTENER, noisy)).toEqual([
    {kind: "heard", sound: "shot", sector: 2, loudness: "near"},
    {kind: "heard", sound: "step", sector: 2, loudness: "mid"},
    {kind: "heard", sound: "pickup", sector: 0, loudness: "mid"},
  ]);
});

it("hears the pickup from where the weapon lay, not from where the fighter stands", () => {
  const [pickup] = heardInStep(LISTENER, {...QUIET, tookPickupAt: {x: 10, y: 4}});

  expect(pickup).toMatchObject({sound: "pickup", sector: 4});
});

it("hears only the noises within their own range", () => {
  const far: NoiseOfFighter = {
    ...QUIET,
    position: {x: 10 + HEARING_RANGES.step + 1, y: 10},
    shot: true,
    footfall: true,
  };

  expect(heardInStep(LISTENER, far).map(event => event.sound)).toEqual(["shot"]);
});
