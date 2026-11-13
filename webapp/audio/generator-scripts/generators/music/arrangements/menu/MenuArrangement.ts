import {BASS_PATTERNS} from "@gunsmith/audio-studies/generators/music/arrangements/bass/BassPatterns";
import {KICK_PATTERNS} from "@gunsmith/audio-studies/generators/music/arrangements/kick/KickPatterns";
import type {Arrangement} from "@gunsmith/audio-studies/generators/music/types/Arrangement";

/**
 * The calmer menu track: 60 seconds in the same key, four sections of eight bars, sparse throughout. It states the theme,
 * answers it higher, drops to a lower phrase with a single kick, and returns to the theme. Melodies are MIDI notes.
 */
export const MENU_ARRANGEMENT: Arrangement = {
  key: "music-loop-menu",
  sections: [
    {sparse: true, kickBeats: KICK_PATTERNS.halves, bassSteps: BASS_PATTERNS.sparse, melody: [62, 65, 69, 65]},
    {sparse: true, kickBeats: KICK_PATTERNS.halves, bassSteps: BASS_PATTERNS.sparse, melody: [65, 69, 72, 69]},
    {sparse: true, kickBeats: KICK_PATTERNS.downbeat, bassSteps: BASS_PATTERNS.sparse, melody: [57, 60, 65, 60]},
    {sparse: true, kickBeats: KICK_PATTERNS.halves, bassSteps: BASS_PATTERNS.sparse, melody: [62, 65, 69, 60]},
  ],
};
