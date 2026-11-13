import {makeEffects} from "@gunsmith/audio-studies/generators/effects/MakeEffects";
import {MATCH_ARRANGEMENT} from "@gunsmith/audio-studies/generators/music/arrangements/match/MatchArrangement";
import {MENU_ARRANGEMENT} from "@gunsmith/audio-studies/generators/music/arrangements/menu/MenuArrangement";
import {makeMusic} from "@gunsmith/audio-studies/generators/music/MakeMusic";
import type {AudioPack} from "@gunsmith/audio-studies/pack/types/AudioPack";

/** The full art pack: seventeen effects, the 90-second match loop and the 60-second menu loop. */
export function makeAudioPack(): AudioPack {
  return {effects: makeEffects(), match: makeMusic(MATCH_ARRANGEMENT), menu: makeMusic(MENU_ARRANGEMENT)};
}
