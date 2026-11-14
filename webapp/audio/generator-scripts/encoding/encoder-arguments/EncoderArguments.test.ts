import assert from "node:assert/strict";
import {it} from "node:test";
import {encoderArguments} from "@gunsmith/audio-studies/encoding/encoder-arguments/EncoderArguments";

it("reads the first audio stream, drops the metadata, keeps 48 kHz and adds the codec's own flags before the destination", () => {
  assert.deepEqual(encoderArguments({input: "in.wav", destination: "out.ogg", format: "ogg"}), [
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
    "out.ogg",
  ]);
});

it("changes only the codec flags between the two formats", () => {
  const ogg = encoderArguments({input: "in.wav", destination: "out.x", format: "ogg"});
  const mp3 = encoderArguments({input: "in.wav", destination: "out.x", format: "mp3"});

  assert.deepEqual(ogg.slice(0, 12), mp3.slice(0, 12));
  assert.notDeepEqual(ogg.slice(12), mp3.slice(12));
});
