import type {Difficulty} from "@gunsmith/engine/opponent/types/Difficulty";

/** The opponent's difficulty. One table, so a harder or an easier bot is one object. */
export const DIFFICULTY: Difficulty = {
  reactionSeconds: 0.4,
  burstShots: 3,
  restSeconds: 1,
  widestAimError: 0.12,
  narrowestAimError: 0.03,
  aimSettleSeconds: 1.5,
  farRange: 8,
  nearRange: 4,
  speedShare: 0.7,
  strafeMinSeconds: 1,
  strafeMaxSeconds: 2,
  wanderRepickSeconds: 4,
  wanderMinDistance: 3,
  searchLingerSeconds: 3,
  stuckSeconds: 1.5,
  stuckDistance: 0.5,
  arrivalRadius: 0.4,
  coverSamples: 12,
  coverReach: 8,
  ringMargin: 2,
};
