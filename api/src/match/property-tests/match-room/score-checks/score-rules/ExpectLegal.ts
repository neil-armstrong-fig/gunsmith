import type {Match} from "@gunsmith/engine/match/types/Match";
import {ROUNDS_TO_WIN} from "@gunsmith/engine/match/winning/RoundsToWin";

/** Neither side has more than the rounds that win a match, both have not, and no more rounds are scored than have been fought. */
export function expectLegal(match: Match): void {
  expect(match.playerWins).toBeLessThanOrEqual(ROUNDS_TO_WIN);
  expect(match.opponentWins).toBeLessThanOrEqual(ROUNDS_TO_WIN);
  expect(match.playerWins + match.opponentWins).toBeLessThanOrEqual(match.roundNumber);
  expect(match.playerWins >= ROUNDS_TO_WIN && match.opponentWins >= ROUNDS_TO_WIN).toBe(false);
}
