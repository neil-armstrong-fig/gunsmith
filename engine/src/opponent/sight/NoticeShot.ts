import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {ShotSighting} from "@gunsmith/engine/opponent/sight/types/ShotSighting";

/**
 * The brain with what a shot that hurt it last step told it. A bullet comes from somewhere, so a shot it could not see the
 * shooter for becomes the place it last knew the player to be, and the place `search` goes to (a shooter on higher ground, whom
 * the low ground cannot see, is found this way). When it sees the player, what it sees is truer than the shot, so nothing
 * changes. The shot stays in the brain for `chooseState`; `thinkOpponent` clears it once the state is chosen.
 */
export function noticeShot(brain: OpponentBrain, sighting: ShotSighting): OpponentBrain {
  if (!brain.shotFrom || sighting.sees) {
    return brain;
  }

  return {...brain, lastSeen: brain.shotFrom};
}
