import type {Match} from "@gunsmith/engine/match/types/Match";
import {scoreText} from "@src/react/components/dom/score-text/ScoreText";

/** What the score readout says: the round being fought, then the score. */
export function readoutText(match: Match): string {
  return `Round ${match.roundNumber} · ${scoreText(match)}`;
}
