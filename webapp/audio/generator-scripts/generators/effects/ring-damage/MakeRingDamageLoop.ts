import {AUDIO_FORMAT} from "@gunsmith/audio-studies/common/format/AudioFormat";
import type {RenderedCue} from "@gunsmith/audio-studies/common/types/RenderedCue";

/** Inharmonic electrical partials, a shallow two-Hz erosion pulse and quiet headroom for transient cues. */
const RING_DAMAGE = {
  seconds: 2,
  frequencies: [97, 151, 233, 347, 503, 719, 1013, 1429],
  amplitude: 0.05,
  pulseHz: 2,
  pulseDepth: 0.12,
  falloff: 1.2,
} as const;

/**
 * Every oscillator completes whole cycles in two seconds. Alternating phases keep the zero-crossing seam's slope small
 * without fading the bed; the inharmonic frequencies avoid a melodic warning or a percussive damage accent.
 */
export function makeRingDamageLoop(): RenderedCue {
  const channel = new Float32Array(AUDIO_FORMAT.sampleRate * RING_DAMAGE.seconds);
  for (let frame = 0; frame < channel.length; frame += 1) {
    const seconds = frame / AUDIO_FORMAT.sampleRate;
    let sample = 0;
    for (const [index, frequency] of RING_DAMAGE.frequencies.entries()) {
      sample += Math.sin(2 * Math.PI * frequency * seconds + index * Math.PI) / (index + 1) ** RING_DAMAGE.falloff;
    }
    const pulse =
      1 - RING_DAMAGE.pulseDepth + RING_DAMAGE.pulseDepth * Math.cos(2 * Math.PI * RING_DAMAGE.pulseHz * seconds);
    channel[frame] = sample * pulse * RING_DAMAGE.amplitude;
  }

  return {key: "sfx-ring-damage-loop", channels: [channel], loop: true};
}
