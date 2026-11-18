import {reducedMotionOfPage} from "@src/game/motion/ReducedMotionOfPage";
import {shakePixelsOfPage} from "@src/game/motion/ShakePixelsOfPage";
import {mutedOfPage} from "@src/game/sound/MutedOfPage";
import type {AppStore} from "@src/store/app/types/AppStore";
import {create} from "zustand";

/** The app store: choices about the game around the match, apart from the game store so a world written sixty times a second never wakes them. */
export const useAppStore = create<AppStore>()(set => ({
  muted: mutedOfPage(),
  reducedMotion: reducedMotionOfPage(),
  shakePixels: shakePixelsOfPage(),
  toggleMuted: () => {
    set(state => ({muted: !state.muted}));
  },
}));
