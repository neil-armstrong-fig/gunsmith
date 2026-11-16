import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {makeEmptyClick} from "@gunsmith/audio-studies/generators/effects/empty-click/MakeEmptyClick";
import {renderCue} from "@gunsmith/audio-studies/synthesis/RenderCue";
import {writeWav} from "@gunsmith/audio-studies/output/wav/WriteWav";
import {writeMeasurements} from "@gunsmith/audio-studies/output/measurements/WriteMeasurements";
import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";

/** Render the selected empty-magazine click and measurements into the supplied study folder. */
export async function renderEmptyWeaponClick(output: string): Promise<void> {
  await mkdir(output, {recursive: true});
  const measurements: Record<string, Measurement> = {};
  const cue = makeEmptyClick();
  measurements[cue.key] = await writeWav(output, await renderCue(cue));
  await writeMeasurements(output, measurements);
}

const entry = process.argv[1];
if (entry && pathToFileURL(resolve(entry)).href === import.meta.url) {
  const output = resolve(import.meta.dirname, "../../../studies/empty-weapon-click");
  await renderEmptyWeaponClick(output);
  console.log(`Selected click rendered to ${output}`);
}
