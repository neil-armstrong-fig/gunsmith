import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";
import {selectPlayerHealth} from "@src/store/game/selectors/select-player-health/SelectPlayerHealth";
import type {GameStore} from "@src/store/game/types/GameStore";

const world = startingWorld(arenaFrom(["###", "#.#", "###"]));

function storeHolding(held: World): GameStore {
  return {world: held, setWorld: () => undefined};
}

it("reads full health at the start of a match", () => {
  expect(selectPlayerHealth(storeHolding(world))).toBe(PLAYER_HEALTH);
});

it("reads what is left once the player is hurt", () => {
  expect(selectPlayerHealth(storeHolding({...world, player: {...world.player, health: 35}}))).toBe(35);
});
