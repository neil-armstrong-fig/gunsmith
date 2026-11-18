import {eventsOfStep} from "@gunsmith/engine/combat-events/EventsOfStep";
import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {DamageToPlayer} from "@gunsmith/engine/combat-events/types/DamageToPlayer";
import type {EventsRequest} from "@gunsmith/engine/combat-events/types/EventsRequest";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";

const UNHURT: DamageToPlayer = {health: 100, bullet: 0, ring: 0};

it("reports nothing when nothing happened to the player", () => {
  expect(eventsOf({})).toBeUndefined();
});

it("reports nothing for a shot that left the weapon", () => {
  expect(eventsOf({playerTurn: turn({fires: true})})).toBeUndefined();
});

it("reports a refused trigger with its reason", () => {
  expect(eventsOf({playerTurn: turn({refusal: "empty"})})).toEqual([{kind: "fireRefused", reason: "empty"}]);
});

it("reports the damage the step did to the player, with its cause", () => {
  expect(eventsOf({damage: {...UNHURT, bullet: 20, ring: 0.25}})).toEqual([
    {kind: "damageTaken", cause: "bullet", amount: 20},
    {kind: "damageTaken", cause: "ring", amount: 0.25},
  ]);
});

it("reports a hit landed for each visible hit, on what it landed on", () => {
  expect(eventsOf({visibleHits: ["opponent", "dummy", "dummy"]})).toEqual([
    {kind: "hitLanded", on: "opponent"},
    {kind: "hitLanded", on: "dummy"},
    {kind: "hitLanded", on: "dummy"},
  ]);
});

it("reports a refusal, a loss and a hit together, the loss before the hit", () => {
  expect(
    eventsOf({
      playerTurn: turn({refusal: "empty"}),
      damage: {...UNHURT, bullet: 25},
      visibleHits: ["opponent"],
    }),
  ).toEqual([
    {kind: "fireRefused", reason: "empty"},
    {kind: "damageTaken", cause: "bullet", amount: 25},
    {kind: "hitLanded", on: "opponent"},
  ]);
});

/** What `eventsOfStep` says about a quiet step, with `changes` made to what happened in it. */
function eventsOf(changes: Partial<EventsRequest>): readonly CombatEvent[] | undefined {
  return eventsOfStep({playerTurn: turn(), damage: UNHURT, visibleHits: [], ...changes});
}

function turn(changes: Partial<FighterTurn> = {}): FighterTurn {
  return {fighter: centred().player, fires: false, ...changes};
}
