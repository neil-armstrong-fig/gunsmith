import {startMatch} from "@gunsmith/engine/match/StartMatch";

it("starts with no round won by either side, in the first round", () => {
  expect(startMatch()).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
});
