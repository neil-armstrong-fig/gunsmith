import type {FeedbackStore} from "@src/store/feedback/types/FeedbackStore";
import {create} from "zustand";

/**
 * The feedback store: what the player's health panel needs to know about the damage taken that the game store's last world
 * cannot say (which cause, and every step of a frame, not the last). It changes only when a hit lands or the ring starts or
 * stops hurting, so it wakes the panel a few times a second at most.
 */
export const useFeedbackStore = create<FeedbackStore>()(set => ({
  bulletHits: 0,
  ringHurting: false,
  setCues: cues => {
    set(cues);
  },
}));
