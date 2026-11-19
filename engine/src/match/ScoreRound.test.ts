import type {Match} from "@gunsmith/engine/match/types/Match";
import {scoreRound} from "@gunsmith/engine/match/ScoreRound";

const LEVEL: Match = {playerWins: 1, opponentWins: 1, roundNumber: 3};

it("gives the player a win for a won round", () => {
  expect(scoreRound(LEVEL, "won")).toEqual({playerWins: 2, opponentWins: 1, roundNumber: 3});
});

it("gives the opponent a win for a lost round", () => {
  expect(scoreRound(LEVEL, "lost")).toEqual({playerWins: 1, opponentWins: 2, roundNumber: 3});
});

it("gives nobody a win for a drawn round", () => {
  expect(scoreRound(LEVEL, "drawn")).toEqual(LEVEL);
});

it("changes nothing while the round is still being fought", () => {
  expect(scoreRound(LEVEL, "playing")).toEqual(LEVEL);
});

it("does not change the match it is given", () => {
  const match: Match = {playerWins: 0, opponentWins: 0, roundNumber: 1};

  scoreRound(match, "won");

  expect(match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
});
