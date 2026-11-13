import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {makeAudioPack} from "@gunsmith/audio-studies/pack/MakeAudioPack";
import {makeMix} from "@gunsmith/audio-studies/output/mix/MakeMix";
import {writeMeasurements} from "@gunsmith/audio-studies/output/measurements/WriteMeasurements";
import {writeWav} from "@gunsmith/audio-studies/output/wav/WriteWav";
import {renderCue} from "@gunsmith/audio-studies/synthesis/RenderCue";
import type {AudioPack} from "@gunsmith/audio-studies/pack/types/AudioPack";
import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";
import type {RenderedCue} from "@gunsmith/audio-studies/common/types/RenderedCue";

/**
 * Renders the pack into `output` and returns how many WAVs it wrote: every effect, the match and menu loops, and the
 * audition mix of effects over the match loop, with `measurements.json` beside them. An explicit folder keeps verification
 * isolated. The files are written in a fixed order, so the order of the measurements is the same on every run.
 */
export async function renderAudio(output: string, pack: AudioPack = makeAudioPack()): Promise<number> {
  await mkdir(output, {recursive: true});
  const files: Record<string, Measurement> = {};
  const effects = new Map<string, RenderedCue>();
  for (const cue of pack.effects) {
    const renderedCue = await renderCue(cue);
    files[cue.key] = await writeWav(output, renderedCue);
    effects.set(cue.key, renderedCue);
  }
  const match = await renderCue(pack.match);
  const menu = await renderCue(pack.menu);
  for (const renderedCue of [match, menu, makeMix(match, effects)]) {
    files[renderedCue.key] = await writeWav(output, renderedCue);
  }
  await writeMeasurements(output, files);

  return Object.keys(files).length;
}

// Node's native TypeScript support runs this entry point without a transpiler.
const entry = process.argv[1];
if (entry && pathToFileURL(resolve(entry)).href === import.meta.url) {
  const output = resolve(import.meta.dirname, "..", "generated-audio");
  const count = await renderAudio(output);
  console.log(`Rendered ${count} WAV files with node-web-audio-api in ${output}`);
}
