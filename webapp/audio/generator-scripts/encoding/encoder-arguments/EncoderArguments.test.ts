import {expect, it} from "vitest";
import {encoderArguments} from "@gunsmith/audio-studies/encoding/encoder-arguments/EncoderArguments";

it("reads the first audio stream, drops the metadata, keeps 48 kHz and adds the codec's own flags before the destination", () => {
  expect(encoderArguments({input: "in.wav", destination: "out.ogg", format: "ogg"})).toStrictEqual([
    "-v",
    "error",
    "-nostdin",
    "-y",
    "-i",
    "in.wav",
    "-map",
    "0:a:0",
    "-map_metadata",
    "-1",
    "-ar",
    "48000",
    "-c:a",
    "libvorbis",
    "-q:a",
    "5",
    "-page_duration",
    "20000",
    "out.ogg",
  ]);
});

it("changes only the codec flags between the two formats", () => {
  const ogg = encoderArguments({input: "in.wav", destination: "out.x", format: "ogg"});
  const mp3 = encoderArguments({input: "in.wav", destination: "out.x", format: "mp3"});

  expect(ogg.slice(0, 12)).toStrictEqual(mp3.slice(0, 12));
  expect(ogg.slice(12)).not.toStrictEqual(mp3.slice(12));
});
