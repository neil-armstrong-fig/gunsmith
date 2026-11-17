import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";
import {selectPlayerHealth} from "@src/store/game/selectors/select-player-health/SelectPlayerHealth";
import type {GameStore} from "@src/store/game/types/GameStore";

const world = startingWorld(arenaFrom(["###", "#.#", "###"]));

it("reads full health at the start of a match", () => {
  expect(selectPlayerHealth(storeHolding(world))).toBe(PLAYER_HEALTH);
});

it("reads what is left once the player is hurt", () => {
  expect(selectPlayerHealth(storeHolding({...world, player: {...world.player, health: 35}}))).toBe(35);
});

it("rounds a part of a point up, so it never reads 0 while the player stands, and moves only when the whole number does", () => {
  expect(selectPlayerHealth(storeHolding({...world, player: {...world.player, health: 34.3}}))).toBe(35);
  expect(selectPlayerHealth(storeHolding({...world, player: {...world.player, health: 34.9}}))).toBe(35);
  expect(selectPlayerHealth(storeHolding({...world, player: {...world.player, health: 0.01}}))).toBe(1);
});

it("reads 0 only when there is no health at all", () => {
  expect(selectPlayerHealth(storeHolding({...world, player: {...world.player, health: 0}}))).toBe(0);
});

function storeHolding(held: World): GameStore {
  return {world: held, setWorld: () => undefined};
}
