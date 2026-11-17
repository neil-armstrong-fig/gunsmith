import {eventsOfStep} from "@gunsmith/engine/combat-events/EventsOfStep";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";

function turn(changes: Partial<FighterTurn> = {}): FighterTurn {
  return {fighter: centred().player, fires: false, ...changes};
}

it("reports nothing when nothing happened to the player", () => {
  expect(eventsOfStep({playerTurn: turn()})).toBeUndefined();
});

it("reports nothing for a shot that left the weapon", () => {
  expect(eventsOfStep({playerTurn: turn({fires: true})})).toBeUndefined();
});

it("reports a refused trigger with its reason", () => {
  expect(eventsOfStep({playerTurn: turn({refusal: "empty"})})).toEqual([{kind: "fireRefused", reason: "empty"}]);
});
