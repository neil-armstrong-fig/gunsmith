import type {Match} from "@gunsmith/engine/match/types/Match";
import {ROUNDS_TO_WIN} from "@gunsmith/engine/match/winning/RoundsToWin";

/** The score only grows, but for a fresh match once the last is decided. */
export function expectKeptOrRestarted(before: Match, match: Match): void {
  if (match.roundNumber < before.roundNumber) {
    expect(before.playerWins >= ROUNDS_TO_WIN || before.opponentWins >= ROUNDS_TO_WIN).toBe(true);
    expect(match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});

    return;
  }

  expect(match.playerWins).toBeGreaterThanOrEqual(before.playerWins);
  expect(match.opponentWins).toBeGreaterThanOrEqual(before.opponentWins);
}
