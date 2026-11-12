import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {selectRound} from "@src/store/game/selectors/select-round/SelectRound";
import type {GameStore} from "@src/store/game/types/GameStore";

const world = startingWorld(arenaFrom(["###", "#.#", "###"]));

function storeHolding(held: World): GameStore {
  return {world: held, setWorld: () => undefined};
}

it("reads the round as playing at the start of a match", () => {
  expect(selectRound(storeHolding(world))).toBe("playing");
});

it("reads the round as won or lost once it is", () => {
  expect(selectRound(storeHolding({...world, round: "won"}))).toBe("won");
  expect(selectRound(storeHolding({...world, round: "lost"}))).toBe("lost");
});
