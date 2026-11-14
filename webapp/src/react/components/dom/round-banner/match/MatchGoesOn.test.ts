import {matchGoesOn} from "@src/react/components/dom/round-banner/match/MatchGoesOn";

it("goes on when neither side has won two rounds", () => {
  expect(matchGoesOn({playerWins: 1, opponentWins: 1, roundNumber: 3})).toBe(true);
});

it("is over once the player has won two rounds", () => {
  expect(matchGoesOn({playerWins: 2, opponentWins: 0, roundNumber: 2})).toBe(false);
});

it("is over once the opponent has won two rounds", () => {
  expect(matchGoesOn({playerWins: 0, opponentWins: 2, roundNumber: 2})).toBe(false);
});

it("is not going on when there is no match at all", () => {
  expect(matchGoesOn(undefined)).toBe(false);
});
