import {decideMatch} from "@gunsmith/engine/match/DecideMatch";

it("is still being fought at nothing to nothing", () => {
  expect(decideMatch({playerWins: 0, opponentWins: 0, roundNumber: 1})).toBe("playing");
});

it("is still being fought when the player is one round up", () => {
  expect(decideMatch({playerWins: 1, opponentWins: 0, roundNumber: 2})).toBe("playing");
});

it("is still being fought when the opponent is one round up", () => {
  expect(decideMatch({playerWins: 0, opponentWins: 1, roundNumber: 2})).toBe("playing");
});

it("is still being fought at one round each", () => {
  expect(decideMatch({playerWins: 1, opponentWins: 1, roundNumber: 3})).toBe("playing");
});

it("is won when the player has won two rounds, to nothing", () => {
  expect(decideMatch({playerWins: 2, opponentWins: 0, roundNumber: 2})).toBe("won");
});

it("is won when the player has won two rounds, to one", () => {
  expect(decideMatch({playerWins: 2, opponentWins: 1, roundNumber: 3})).toBe("won");
});

it("is lost when the opponent has won two rounds, to nothing", () => {
  expect(decideMatch({playerWins: 0, opponentWins: 2, roundNumber: 2})).toBe("lost");
});

it("is lost when the opponent has won two rounds, to one", () => {
  expect(decideMatch({playerWins: 1, opponentWins: 2, roundNumber: 3})).toBe("lost");
});
