import {scoreText} from "@src/react/components/dom/score-text/ScoreText";

it("names each side's rounds, the player first", () => {
  expect(scoreText({playerWins: 1, opponentWins: 0, roundNumber: 2})).toBe("You 1 · Opponent 0");
});

it("shows the opponent ahead as readily as the player", () => {
  expect(scoreText({playerWins: 0, opponentWins: 2, roundNumber: 2})).toBe("You 0 · Opponent 2");
});
