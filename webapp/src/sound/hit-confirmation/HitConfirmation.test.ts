import {BURST_SECONDS} from "@src/sound/burst-window/BurstSeconds";
import {HitConfirmation} from "@src/sound/hit-confirmation/HitConfirmation";
import type {HitRequest} from "@src/sound/hit-confirmation/types/HitRequest";

const TICK = 1 / 60;
const OPPONENT_HIT: HitRequest = {events: [{kind: "hitLanded", on: "opponent"}], round: "playing", seconds: TICK};
const DUMMY_HIT: HitRequest = {events: [{kind: "hitLanded", on: "dummy"}], round: "playing", seconds: TICK};
const QUIET: HitRequest = {events: undefined, round: "playing", seconds: TICK};
const STEPS_IN_BURST = Math.round(BURST_SECONDS / TICK);

/** Runs one step per request and says which of them sounded, by position. */
function soundsOf(requests: readonly HitRequest[]): number[] {
  const confirmation = new HitConfirmation();

  return requests.flatMap((request, index) => {
    if (confirmation.shouldPlay(request)) {
      return [index];
    }

    return [];
  });
}

it("sounds at once for a hit on the opponent", () => {
  expect(soundsOf([OPPONENT_HIT])).toEqual([0]);
});

it("sounds for a hit on a dummy", () => {
  expect(soundsOf([DUMMY_HIT])).toEqual([0]);
});

it("sounds once for several bullets that land together", () => {
  expect(soundsOf([{...OPPONENT_HIT, events: [...(OPPONENT_HIT.events ?? []), ...(DUMMY_HIT.events ?? [])]}])).toEqual([
    0,
  ]);
});

it("does not sound for anything else the step reports", () => {
  const damage: HitRequest = {...QUIET, events: [{kind: "damageTaken", cause: "bullet", amount: 20}]};
  const refused: HitRequest = {...QUIET, events: [{kind: "fireRefused", reason: "empty"}]};

  expect(soundsOf([QUIET, damage, refused])).toEqual([]);
});

it("merges a second hit inside the burst into the first sound, and sounds again once it has passed", () => {
  expect(soundsOf([OPPONENT_HIT, ...Array.from({length: STEPS_IN_BURST - 2}, () => QUIET), OPPONENT_HIT])).toEqual([0]);
  expect(soundsOf([OPPONENT_HIT, ...Array.from({length: STEPS_IN_BURST - 1}, () => QUIET), OPPONENT_HIT])).toEqual([
    0,
    STEPS_IN_BURST,
  ]);
});

it("sounds for the hit that ends the round", () => {
  expect(soundsOf([{...OPPONENT_HIT, round: "won"}])).toEqual([0]);
});
