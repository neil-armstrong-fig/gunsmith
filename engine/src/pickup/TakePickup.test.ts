import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";
import {takePickup} from "@gunsmith/engine/pickup/TakePickup";
import {PICKUP_REACH} from "@gunsmith/engine/pickup/taking/PickupReach";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

const world = startingWorld(arenaFrom(["###########", "#.........#", "###########"]), [], {x: 9.5, y: 1.5});
const player = {...world.player, position: {x: 1.5, y: 1.5}};
const opponent = world.opponent ?? player;
const lying: Pickup = {position: {x: 5.5, y: 1.5}, weapon: SUBMACHINE_GUN};

it("is taken by the player who stands on it, who holds it and leaves nothing lying", () => {
  const taking = takePickup(lying, {player: {...player, position: at(5.5)}, opponent});

  expect(taking.pickup).toBeUndefined();
  expect(taking.player.loadout[0]?.weapon).toBe(SUBMACHINE_GUN);
  expect(taking.player.equippedIndex).toBe(0);
  expect(taking.opponent).toEqual(opponent);
  expect(taking.playerTookPickup).toBe(true);
  expect(taking.opponentTookPickup).toBe(false);
});

it("is taken by the opponent by the same rule", () => {
  const taking = takePickup(lying, {player, opponent: {...opponent, position: at(5.5)}});

  expect(taking.pickup).toBeUndefined();
  expect(taking.opponent?.loadout[0]?.weapon).toBe(SUBMACHINE_GUN);
  expect(taking.player).toEqual(player);
  expect(taking.opponentTookPickup).toBe(true);
  expect(taking.playerTookPickup).toBe(false);
});

it("is taken from just inside its reach and not from just outside it", () => {
  expect(
    takePickup(lying, {player: {...player, position: at(5.5 - PICKUP_REACH + 0.01)}, opponent}).pickup,
  ).toBeUndefined();
  expect(takePickup(lying, {player: {...player, position: at(5.5 - PICKUP_REACH - 0.01)}, opponent}).pickup).toBe(
    lying,
  );
});

it("goes to the nearer fighter when both are within reach", () => {
  const taking = takePickup(lying, {
    player: {...player, position: at(5.5 - 0.1)},
    opponent: {...opponent, position: at(5.5 + 0.3)},
  });

  expect(taking.player.loadout[0]?.weapon).toBe(SUBMACHINE_GUN);
  expect(taking.opponent).toEqual({...opponent, position: at(5.5 + 0.3)});
});

it("goes to the opponent when both are exactly as near", () => {
  const taking = takePickup(lying, {
    player: {...player, position: at(5.4)},
    opponent: {...opponent, position: at(5.6)},
  });

  expect(taking.opponent?.loadout[0]?.weapon).toBe(SUBMACHINE_GUN);
  expect(taking.player.loadout[0]?.weapon).not.toBe(SUBMACHINE_GUN);
});

it("is not taken by a fighter with no health left", () => {
  const taking = takePickup(lying, {player: {...player, position: at(5.5), health: 0}, opponent});

  expect(taking.pickup).toBe(lying);
});

it("changes nothing when nothing lies there, or there is no opponent", () => {
  expect(takePickup(undefined, {player, opponent})).toEqual({
    pickup: undefined,
    player,
    opponent,
    playerTookPickup: false,
    opponentTookPickup: false,
  });
  expect(takePickup(lying, {player: {...player, position: at(5.5)}}).opponent).toBeUndefined();
});

function at(x: number): Point {
  return {x, y: 1.5};
}
