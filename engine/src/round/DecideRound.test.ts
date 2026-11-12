import {decideRound} from "@gunsmith/engine/round/DecideRound";

it("keeps playing while both sides have health", () => {
  expect(decideRound({playerHealth: 100, opponentHealth: 100})).toBe("playing");
});

it("is won when the opponent has no health left", () => {
  expect(decideRound({playerHealth: 40, opponentHealth: 0})).toBe("won");
});

it("is lost when the player has no health left", () => {
  expect(decideRound({playerHealth: 0, opponentHealth: 40})).toBe("lost");
});

it("is lost when both fall in the same step", () => {
  expect(decideRound({playerHealth: 0, opponentHealth: 0})).toBe("lost");
});

it("never ends when there is no opponent", () => {
  expect(decideRound({playerHealth: 100, opponentHealth: undefined})).toBe("playing");
});

it("is lost with no opponent too, when the player has no health left", () => {
  expect(decideRound({playerHealth: 0, opponentHealth: undefined})).toBe("lost");
});
