import {BASS_PATTERNS} from "@gunsmith/audio-studies/generators/music/arrangements/bass/BassPatterns";
import {KICK_PATTERNS} from "@gunsmith/audio-studies/generators/music/arrangements/kick/KickPatterns";
import type {Arrangement} from "@gunsmith/audio-studies/generators/music/types/Arrangement";

/**
 * The driving match track: 90 seconds in D minor at 128 BPM, six sections of eight bars. It opens in an established groove,
 * answers it with a syncopated bass and a reordered motif, climbs, drops to a sparse fourth section, then returns an octave
 * higher and turns round into the opening. Melodies are MIDI notes.
 */
export const MATCH_ARRANGEMENT: Arrangement = {
  key: "music-loop-match",
  sections: [
    {sparse: false, kickBeats: KICK_PATTERNS.everyBeat, bassSteps: BASS_PATTERNS.driving, melody: [62, 65, 69, 65]},
    {sparse: false, kickBeats: KICK_PATTERNS.everyBeat, bassSteps: BASS_PATTERNS.syncopated, melody: [62, 69, 65, 72]},
    {sparse: false, kickBeats: KICK_PATTERNS.everyBeat, bassSteps: BASS_PATTERNS.driving, melody: [69, 72, 74, 72]},
    {sparse: true, kickBeats: KICK_PATTERNS.halves, bassSteps: BASS_PATTERNS.sparse, melody: [57, 60, 65, 60]},
    {sparse: false, kickBeats: KICK_PATTERNS.everyBeat, bassSteps: BASS_PATTERNS.driving, melody: [74, 77, 81, 77]},
    {sparse: false, kickBeats: KICK_PATTERNS.everyBeat, bassSteps: BASS_PATTERNS.syncopated, melody: [69, 65, 64, 60]},
  ],
};
