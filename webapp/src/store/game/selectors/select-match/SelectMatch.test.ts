import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {selectMatch} from "@src/store/game/selectors/select-match/SelectMatch";
import type {GameStore} from "@src/store/game/types/GameStore";

const world = startingWorld(arenaFrom(["###", "#.#", "###"]));

it("reads nothing when the game is not a match", () => {
  expect(selectMatch(storeHolding(world))).toBeUndefined();
});

it("reads the match the world belongs to", () => {
  const match = {...startMatch(), opponentWins: 1};

  expect(selectMatch(storeHolding({...world, match}))).toBe(match);
});

it("reads the very same match on every frame in which the score has not changed", () => {
  const first = storeHolding({...world, match: startMatch()});
  const next = storeHolding({...first.world, elapsedSeconds: 1});

  expect(selectMatch(next)).toBe(selectMatch(first));
});

function storeHolding(held: World): GameStore {
  return {world: held, setWorld: () => undefined};
}
