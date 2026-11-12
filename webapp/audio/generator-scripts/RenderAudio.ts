import {mkdir, writeFile} from "node:fs/promises";
import {join, resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {AUDIO_FORMAT} from "@gunsmith/audio-studies/AudioFormat";
import {makeEffects} from "@gunsmith/audio-studies/effects/MakeEffects";
import {makeMusic} from "@gunsmith/audio-studies/music/MakeMusic";
import {renderCue} from "@gunsmith/audio-studies/synthesis/RenderCue";
import {writeWav} from "@gunsmith/audio-studies/output/WriteWav";
import {makeMix} from "@gunsmith/audio-studies/output/MakeMix";
import type {Measurement} from "@gunsmith/audio-studies/types/Measurement";
import type {RenderedCue} from "@gunsmith/audio-studies/types/RenderedCue";

/** Renders the complete offline art pack. An explicit folder keeps verification isolated. */
export async function renderAudio(output: string): Promise<void> {
  await mkdir(output, {recursive: true});
  const files: Record<string, Measurement> = {};
  const effects = new Map<string, RenderedCue>();
  for (const cue of makeEffects()) {
    const renderedCue = await renderCue(cue);
    files[cue.key] = await writeWav(output, renderedCue);
    effects.set(cue.key, renderedCue);
  }
  const match = await renderCue(makeMusic(false));
  const menu = await renderCue(makeMusic(true));
  for (const renderedCue of [match, menu, makeMix(match, effects)]) {
    files[renderedCue.key] = await writeWav(output, renderedCue);
  }
  await writeFile(
    join(output, "measurements.json"),
    JSON.stringify(
      {
        ...AUDIO_FORMAT,
        key: "D minor",
        engine: "node-web-audio-api@2.2.0",
        seed: 8231,
        files,
        listeningReview: "pending; regenerated with native Web Audio; measurements do not prove perceived quality",
      },
      undefined,
      2,
    ) + "\n",
  );
}

// Node's native TypeScript support runs this entry point without a transpiler.
const entry = process.argv[1];
if (entry && pathToFileURL(resolve(entry)).href === import.meta.url) {
  const output = resolve(import.meta.dirname, "..", "generated-audio");
  await renderAudio(output);
  console.log(`Rendered 14 WAV files with node-web-audio-api in ${output}`);
}
