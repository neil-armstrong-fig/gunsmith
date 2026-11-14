import type {Match} from "@gunsmith/engine/match/types/Match";

/** The score in words, the player first: "You 1 · Opponent 0". The banner and the score readout both say it. */
export function scoreText(match: Match): string {
  return `You ${match.playerWins} · Opponent ${match.opponentWins}`;
}
