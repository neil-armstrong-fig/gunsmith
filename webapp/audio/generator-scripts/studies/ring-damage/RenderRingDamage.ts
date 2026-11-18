import {createHash} from "node:crypto";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {join, resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {AUDIO_FORMAT} from "@gunsmith/audio-studies/common/format/AudioFormat";
import {makeRingDamageLoop} from "@gunsmith/audio-studies/generators/effects/ring-damage/MakeRingDamageLoop";
import {writeWav} from "@gunsmith/audio-studies/output/wav/WriteWav";
import {encoderArguments} from "@gunsmith/audio-studies/encoding/encoder-arguments/EncoderArguments";
import {encoderBinary} from "@gunsmith/audio-studies/encoding/process/binary/EncoderBinary";
import {encoderVersion} from "@gunsmith/audio-studies/encoding/process/version/EncoderVersion";
import {runEncoder} from "@gunsmith/audio-studies/encoding/process/RunEncoder";
import {decodePcm} from "@gunsmith/audio-studies/encoding/verification/decode/DecodePcm";
import {measurePcm} from "@gunsmith/audio-studies/encoding/pcm/MeasurePcm";

const entry = process.argv[1];
if (entry && pathToFileURL(resolve(entry)).href === import.meta.url) {
  await renderRingDamage(resolve(import.meta.dirname, "../../../studies/ring-damage"));
}

/** Writes only this separate study's master, MP3 and measurements; never rebuilds the approved pack. */
export async function renderRingDamage(output: string): Promise<void> {
  await mkdir(output, {recursive: true});
  const renderedCue = makeRingDamageLoop();
  const measurement = await writeWav(output, renderedCue);
  const binary = encoderBinary();
  const input = join(output, `${renderedCue.key}.wav`);
  const destination = join(output, `${renderedCue.key}.mp3`);
  const commandArguments = encoderArguments({input, destination, format: "mp3"});
  await runEncoder(binary, commandArguments);
  const pcmMeasurement = measurePcm(await decodePcm(binary, destination), 1);
  const report = {
    synthesis: "Deterministic periodic additive PCM; no native Web Audio render",
    sampleRate: AUDIO_FORMAT.sampleRate,
    sampleBits: AUDIO_FORMAT.sampleBits,
    master: measurement,
    encoder: await encoderVersion(binary),
    mp3: {
      ...pcmMeasurement,
      sha256: createHash("sha256")
        .update(await readFile(destination))
        .digest("hex"),
    },
    listeningReview: "user approved in Visual Studio Code, 2026-11-17; runtime combat masking/fatigue not measured",
  };
  await writeFile(join(output, "measurements.json"), JSON.stringify(report, undefined, 2) + "\n");
}
