import {readoutText} from "@src/react/components/dom/score-hud/text/ReadoutText";

it("says which round is being fought, then the score", () => {
  expect(readoutText({playerWins: 0, opponentWins: 1, roundNumber: 2})).toBe("Round 2 · You 0 · Opponent 1");
});

it("starts at the first round, nothing to nothing", () => {
  expect(readoutText({playerWins: 0, opponentWins: 0, roundNumber: 1})).toBe("Round 1 · You 0 · Opponent 0");
});
