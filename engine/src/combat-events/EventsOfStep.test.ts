import {eventsOfStep} from "@gunsmith/engine/combat-events/EventsOfStep";
import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {DamageToPlayer} from "@gunsmith/engine/combat-events/types/DamageToPlayer";
import type {EventsRequest} from "@gunsmith/engine/combat-events/types/EventsRequest";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";

const UNHURT: DamageToPlayer = {health: 100, bullet: 0, ring: 0};

function turn(changes: Partial<FighterTurn> = {}): FighterTurn {
  return {fighter: centred().player, fires: false, ...changes};
}

/** What `eventsOfStep` says about a quiet step, with `changes` made to what happened in it. */
function eventsOf(changes: Partial<EventsRequest>): readonly CombatEvent[] | undefined {
  return eventsOfStep({playerTurn: turn(), damageToPlayer: UNHURT, visibleHits: [], ...changes});
}

it("reports nothing when nothing happened to the player", () => {
  expect(eventsOf({})).toBeUndefined();
});

it("reports nothing for a shot that left the weapon", () => {
  expect(eventsOf({playerTurn: turn({fires: true})})).toBeUndefined();
});

it("reports a refused trigger with its reason", () => {
  expect(eventsOf({playerTurn: turn({refusal: "empty"})})).toEqual([{kind: "fireRefused", reason: "empty"}]);
});

it("reports the damage of the bullets that landed as a bullet loss", () => {
  expect(eventsOf({damageToPlayer: {...UNHURT, bullet: 25}})).toEqual([
    {kind: "damageTaken", cause: "bullet", amount: 25},
  ]);
});

it("reports the ring's damage as a ring loss", () => {
  expect(eventsOf({damageToPlayer: {...UNHURT, ring: 4}})).toEqual([{kind: "damageTaken", cause: "ring", amount: 4}]);
});

it("reports a loss no bigger than the health the player had", () => {
  expect(eventsOf({damageToPlayer: {health: 10, bullet: 25, ring: 0}})).toEqual([
    {kind: "damageTaken", cause: "bullet", amount: 10},
  ]);
  expect(eventsOf({damageToPlayer: {health: 3, bullet: 0, ring: 4}})).toEqual([
    {kind: "damageTaken", cause: "ring", amount: 3},
  ]);
});

it("takes the bullets' damage first and leaves the ring only the health that is left", () => {
  expect(eventsOf({damageToPlayer: {health: 30, bullet: 25, ring: 20}})).toEqual([
    {kind: "damageTaken", cause: "bullet", amount: 25},
    {kind: "damageTaken", cause: "ring", amount: 5},
  ]);
});

it("reports no ring loss once the bullets have taken all the health", () => {
  expect(eventsOf({damageToPlayer: {health: 25, bullet: 25, ring: 20}})).toEqual([
    {kind: "damageTaken", cause: "bullet", amount: 25},
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
      damageToPlayer: {...UNHURT, bullet: 25},
      visibleHits: ["opponent"],
    }),
  ).toEqual([
    {kind: "fireRefused", reason: "empty"},
    {kind: "damageTaken", cause: "bullet", amount: 25},
    {kind: "hitLanded", on: "opponent"},
  ]);
});
