import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {startRing} from "@gunsmith/engine/ring/StartRing";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {nextRoundOfPage} from "@src/game/scenario/NextRoundOfPage";

beforeEach(() => {
  vi.stubGlobal("location", {search: "?scenario=duel&seed=5"});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("makes a fresh duel round with the opponent's seed moved on by one", () => {
  const world = nextRoundOfPage({playerWins: 0, opponentWins: 1, roundNumber: 1});

  expect(world).toEqual({
    ...giveOpponentBrain(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), 6),
    match: {playerWins: 0, opponentWins: 1, roundNumber: 2},
    ring: startRing(),
  });
});

it("keeps the score and goes up one round", () => {
  const world = nextRoundOfPage({playerWins: 1, opponentWins: 1, roundNumber: 2});

  expect(world.match).toEqual({playerWins: 1, opponentWins: 1, roundNumber: 3});
});

it("moves the seed on by a round each time, so a match replays exactly from its seed", () => {
  expect(nextRoundOfPage({playerWins: 1, opponentWins: 0, roundNumber: 2}).opponentBrain?.seed).toBe(7);
});

it("puts both fighters back at full health and full magazines", () => {
  const world = nextRoundOfPage({playerWins: 0, opponentWins: 1, roundNumber: 1});
  const fresh = startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);

  expect(world.player).toEqual(fresh.player);
  expect(world.opponent).toEqual(fresh.opponent);
  expect(world.round).toBe("playing");
  expect(world.bullets).toEqual([]);
});
