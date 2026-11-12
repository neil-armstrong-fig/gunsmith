import {AUDIO_FORMAT} from "@gunsmith/audio-studies/AudioFormat";
import type {Cue} from "@gunsmith/audio-studies/types/Cue";
import type {Voice} from "@gunsmith/audio-studies/types/Voice";

/** Related D-minor arrangements: driving match groove and a sparse menu variation. */
export function makeMusic(calm: boolean): Cue {
  const beat = 60 / AUDIO_FORMAT.bpm;
  const voices: Voice[] = [];
  const roots = [38, 38, 34, 36, 38, 41, 34, 36];
  for (const [bar, root] of roots.entries()) {
    const start = bar * 4 * beat;
    for (let index = 0; index < 4; index += 1) {
      const at = start + index * beat;
      if (!calm || index % 2 === 0) {
        voices.push({at, duration: 0.3, frequency: 145, endFrequency: 49, gain: 0.65, cutoff: 900});
      }
      if ((index === 1 || index === 3) && (!calm || bar % 2 === 1)) {
        voices.push({
          at,
          duration: 0.16,
          frequency: 0,
          noise: true,
          seed: 310 + bar * 4 + index,
          cutoff: 2600,
          gain: 0.25,
        });
      }
    }
    for (let index = 0; index < 8; index += 1) {
      if (!calm || index === 2 || index === 6) {
        voices.push({
          at: start + (index * beat) / 2,
          duration: 0.045,
          frequency: 0,
          noise: true,
          seed: 500 + bar * 8 + index,
          cutoff: 7500,
          highpass: true,
          gain: 0.1,
          pan: hatPan(index),
        });
      }
    }
    for (const step of bassSteps(calm)) {
      voices.push({
        at: start + (step * beat) / 4,
        duration: bassDuration(calm, beat),
        frequency: frequency(root),
        wave: "sawtooth",
        cutoff: 680,
        gain: 0.28,
      });
    }
    for (const [index, note] of [62, 65, 69, 65].entries()) {
      if (calm && index % 2 === 1) continue;
      const voice: Voice = {
        at: start + (index + 0.5) * beat,
        duration: 0.62,
        frequency: frequency(note),
        wave: "triangle",
        cutoff: 2200,
        gain: 0.14,
        pan: hatPan(index),
      };
      voices.push(voice, {...voice, at: voice.at + 0.75 * beat, gain: 0.04, pan: -hatPan(index)});
    }
  }
  return {key: musicKey(calm), duration: AUDIO_FORMAT.duration, channels: 2, peak: 0.25, loop: true, voices};
}

function hatPan(index: number): number {
  if (index % 2 === 0) return -0.32;
  return 0.32;
}

function bassSteps(calm: boolean): readonly number[] {
  if (calm) return [0, 3, 6];
  return [0, 2, 3, 6, 8, 10, 11, 14];
}

function bassDuration(calm: boolean, beat: number): number {
  if (calm) return beat * 0.9;
  return beat * 0.43;
}

function frequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

function musicKey(calm: boolean): string {
  if (calm) return "music-loop-menu";
  return "music-loop-match";
}
