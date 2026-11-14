import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";

const arena = arenaFrom(["#######", "#.....#", "#.....#", "#######"]);

it("gives the opponent a starting brain, with the seed it is given, where it stands", () => {
  const world = giveOpponentBrain(startingWorld(arena, [], {x: 4.5, y: 1.5}), 17);

  expect(world.opponentBrain).toEqual(startingBrain({seed: 17, position: {x: 4.5, y: 1.5}}));
});

it("changes nothing else about the world", () => {
  const before = startingWorld(arena, [], {x: 4.5, y: 1.5});

  expect({...giveOpponentBrain(before, 17), opponentBrain: undefined}).toEqual({...before, opponentBrain: undefined});
});

it("leaves a world with no opponent as it is", () => {
  const before = startingWorld(arena);

  expect(giveOpponentBrain(before, 17)).toBe(before);
});
