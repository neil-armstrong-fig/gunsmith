import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {makeDamageCandidates} from "@gunsmith/audio-studies/generators/effects/damage/MakeDamageCandidates";
import {renderCue} from "@gunsmith/audio-studies/synthesis/RenderCue";
import {writeWav} from "@gunsmith/audio-studies/output/wav/WriteWav";
import {writeMeasurements} from "@gunsmith/audio-studies/output/measurements/WriteMeasurements";
import type {Measurement} from "@gunsmith/audio-studies/output/measurements/types/Measurement";

const entry = process.argv[1];
if (entry && pathToFileURL(resolve(entry)).href === import.meta.url) {
  const output = resolve(import.meta.dirname, "../../../studies/combat-feedback");
  await renderCombatFeedback(output);
  console.log(`Study candidates rendered to ${output}`);
}

/**
 * Renders the selected incoming-damage crunch into `output`, with its `measurements.json`. It is a separate audition render
 * and never adds to or replaces the approved pack. Run as a script, it writes to `webapp/audio/studies/combat-feedback/`:
 * `node generator-scripts/studies/combat-feedback/RenderCombatFeedback.ts`, from `webapp/audio`.
 */
export async function renderCombatFeedback(output: string): Promise<void> {
  await mkdir(output, {recursive: true});
  const measurements: Record<string, Measurement> = {};
  for (const cue of makeDamageCandidates()) {
    measurements[cue.key] = await writeWav(output, await renderCue(cue));
  }
  await writeMeasurements(output, measurements);
}
