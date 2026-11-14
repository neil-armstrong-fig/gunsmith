import {limitPeak} from "@gunsmith/audio-studies/common/levels/limit/LimitPeak";
import {MASTERING} from "@gunsmith/audio-studies/output/mastering/Mastering";
import {AUDITION_KEY} from "@gunsmith/audio-studies/output/mix/AuditionKey";
import {layerCue} from "@gunsmith/audio-studies/output/mix/layer/LayerCue";
import {mixTimeline} from "@gunsmith/audio-studies/output/mix/timeline/MixTimeline";
import type {RenderedCue} from "@gunsmith/audio-studies/common/types/RenderedCue";

/**
 * Puts the effects over the match music at the times of `mixTimeline`, each centred, without positional inference or runtime
 * ducking. If the sum is louder than the mastering mix ceiling the whole mix is turned down together, never a cue against
 * the music, so their ratios stay as rendered. The track it is given is not changed.
 */
export function makeMix(match: RenderedCue, effects: ReadonlyMap<string, RenderedCue>): RenderedCue {
  const channels = match.channels.map(channel => new Float32Array(channel));
  for (const event of mixTimeline()) {
    layerCue(channels, monoOf(effects, event.key), event.at);
  }
  limitPeak(channels, MASTERING.mixPeak);

  return {key: AUDITION_KEY, channels};
}

function monoOf(effects: ReadonlyMap<string, RenderedCue>, key: string): Float32Array {
  const mono = effects.get(key)?.channels[0];
  if (mono === undefined) {
    throw new Error(`The mix needs the effect ${key}`);
  }

  return mono;
}
