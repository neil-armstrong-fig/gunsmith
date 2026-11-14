import {nextRound} from "@gunsmith/engine/match/NextRound";

it("moves on to the next round and keeps the score", () => {
  expect(nextRound({playerWins: 1, opponentWins: 0, roundNumber: 1})).toEqual({
    playerWins: 1,
    opponentWins: 0,
    roundNumber: 2,
  });
});
