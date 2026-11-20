import type {PlayOptions} from "@src/sound/types/PlayOptions";

/**
 * Wires one sound's source to the speakers. With no `options` it goes straight there; with them it goes through a gain (how loud) and
 * then a stereo panner (how much to the left and how much to the right ear, equal power, so the sound stays as loud as it pans).
 */
export function connectVoice(
  context: BaseAudioContext,
  source: AudioBufferSourceNode,
  options: PlayOptions | undefined,
): void {
  if (!options) {
    source.connect(context.destination);

    return;
  }

  const gain = context.createGain();
  gain.gain.value = options.gain;
  const panner = context.createStereoPanner();
  panner.pan.value = options.pan;

  source.connect(gain);
  gain.connect(panner);
  panner.connect(context.destination);
}
