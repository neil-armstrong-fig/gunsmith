import type {HitTarget} from "@gunsmith/engine/bullet/types/HitTarget";

/** One of the player's bullets landing on a target in a step, before anyone has asked whether the player could see it. */
export interface LandedHit {
  on: HitTarget;
  /** The place in the list of the dummy that was hit; absent unless `on` is `"dummy"`. */
  dummyIndex: number | undefined;
}
