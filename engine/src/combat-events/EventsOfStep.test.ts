import {eventsOfStep} from "@gunsmith/engine/combat-events/EventsOfStep";
import type {DamageToPlayer} from "@gunsmith/engine/combat-events/types/DamageToPlayer";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";

const UNHURT: DamageToPlayer = {health: 100, bullet: 0, ring: 0};

function turn(changes: Partial<FighterTurn> = {}): FighterTurn {
  return {fighter: centred().player, fires: false, ...changes};
}

it("reports nothing when nothing happened to the player", () => {
  expect(eventsOfStep({playerTurn: turn(), damage: UNHURT})).toBeUndefined();
});

it("reports nothing for a shot that left the weapon", () => {
  expect(eventsOfStep({playerTurn: turn({fires: true}), damage: UNHURT})).toBeUndefined();
});

it("reports a refused trigger with its reason", () => {
  expect(eventsOfStep({playerTurn: turn({refusal: "empty"}), damage: UNHURT})).toEqual([
    {kind: "fireRefused", reason: "empty"},
  ]);
});

it("reports the damage the step did to the player, with its cause", () => {
  expect(eventsOfStep({playerTurn: turn(), damage: {...UNHURT, bullet: 20, ring: 0.25}})).toEqual([
    {kind: "damageTaken", cause: "bullet", amount: 20},
    {kind: "damageTaken", cause: "ring", amount: 0.25},
  ]);
});

it("reports a damage and an empty click together", () => {
  expect(eventsOfStep({playerTurn: turn({refusal: "empty"}), damage: {...UNHURT, bullet: 5}})).toEqual([
    {kind: "fireRefused", reason: "empty"},
    {kind: "damageTaken", cause: "bullet", amount: 5},
  ]);
});
