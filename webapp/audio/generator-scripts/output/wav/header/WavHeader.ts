import {AUDIO_FORMAT} from "@gunsmith/audio-studies/common/format/AudioFormat";
import {PCM16} from "@gunsmith/audio-studies/output/wav/pcm/format/Pcm16";
import type {WavShape} from "@gunsmith/audio-studies/output/wav/header/types/WavShape";

const HEADER_BYTES = 44;
const FORMAT_CHUNK_BYTES = 16;
const LINEAR_PCM = 1;

/** The 44-byte header of a canonical little-endian PCM WAV holding `frames` frames of `channelCount` 16-bit channels. */
export function wavHeader(shape: WavShape): Buffer {
  const blockAlign = shape.channelCount * PCM16.bytesPerSample;
  const dataBytes = shape.frames * blockAlign;
  const header = Buffer.alloc(HEADER_BYTES);
  header.write("RIFF", 0);
  header.writeUInt32LE(HEADER_BYTES - 8 + dataBytes, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(FORMAT_CHUNK_BYTES, 16);
  header.writeUInt16LE(LINEAR_PCM, 20);
  header.writeUInt16LE(shape.channelCount, 22);
  header.writeUInt32LE(AUDIO_FORMAT.sampleRate, 24);
  header.writeUInt32LE(AUDIO_FORMAT.sampleRate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(AUDIO_FORMAT.sampleBits, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataBytes, 40);

  return header;
}
