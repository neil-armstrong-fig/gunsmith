import {damageTakenEvents} from "@gunsmith/engine/combat-events/damage-taken/DamageTakenEvents";
import type {DamageToPlayer} from "@gunsmith/engine/combat-events/types/DamageToPlayer";

const UNHURT: DamageToPlayer = {health: 100, bullet: 0, ring: 0};

it("reports nothing when nothing took any health", () => {
  expect(damageTakenEvents(UNHURT)).toEqual([]);
});

it("reports the health a bullet took, with its cause", () => {
  expect(damageTakenEvents({...UNHURT, bullet: 20})).toEqual([{kind: "damageTaken", cause: "bullet", amount: 20}]);
});

it("reports the health the ring took, with its cause, though it takes a fraction of a point", () => {
  expect(damageTakenEvents({...UNHURT, ring: 0.25})).toEqual([{kind: "damageTaken", cause: "ring", amount: 0.25}]);
});

it("reports a bullet and the ring as two events, the bullet first", () => {
  expect(damageTakenEvents({...UNHURT, bullet: 20, ring: 0.25})).toEqual([
    {kind: "damageTaken", cause: "bullet", amount: 20},
    {kind: "damageTaken", cause: "ring", amount: 0.25},
  ]);
});

it("reports only the health the player had left, not the damage the bullet was worth", () => {
  expect(damageTakenEvents({health: 3, bullet: 20, ring: 0})).toEqual([
    {kind: "damageTaken", cause: "bullet", amount: 3},
  ]);
});

it("gives the ring only what the bullet left of the health", () => {
  expect(damageTakenEvents({health: 10, bullet: 8, ring: 5})).toEqual([
    {kind: "damageTaken", cause: "bullet", amount: 8},
    {kind: "damageTaken", cause: "ring", amount: 2},
  ]);
});

it("reports nothing for a player who has no health left to lose", () => {
  expect(damageTakenEvents({health: 0, bullet: 20, ring: 1})).toEqual([]);
});
