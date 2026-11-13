import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {worldOfPage} from "@src/game/scenario/WorldOfPage";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("makes the duel the page asks for, with the seed the page asks for", () => {
  vi.stubGlobal("location", {search: "?scenario=duel&seed=5"});

  expect(worldOfPage()).toEqual(giveOpponentBrain(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), 5));
});

it("makes a different match, with a fresh seed, each time the page asks for no seed", () => {
  vi.stubGlobal("location", {search: "?scenario=duel"});
  const seeds = new Set<number | undefined>();
  for (let index = 0; index < 10; index++) {
    seeds.add(worldOfPage().opponentBrain?.seed);
  }

  expect(seeds.size).toBeGreaterThan(5);
});

it("makes the practice range when the page asks for nothing", () => {
  vi.stubGlobal("location", {search: ""});

  expect(worldOfPage().opponent).toBeUndefined();
});
