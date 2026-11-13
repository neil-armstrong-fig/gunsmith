import type {Cue} from "@gunsmith/audio-studies/common/types/Cue";

/** Everything one render makes: the effects, and the two music loops. The audition mix is made from these, not listed. */
export interface AudioPack {
  effects: readonly Cue[];
  match: Cue;
  menu: Cue;
}
