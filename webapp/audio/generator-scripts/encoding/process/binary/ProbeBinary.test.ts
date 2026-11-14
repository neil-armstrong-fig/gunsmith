import assert from "node:assert/strict";
import {it} from "node:test";
import {probeBinary} from "@gunsmith/audio-studies/encoding/process/binary/ProbeBinary";

it("is the system ffprobe when the encoder is found on the path", () => {
  assert.equal(probeBinary("ffmpeg"), "ffprobe");
});

it("is the ffprobe beside an encoder given by its full path, so one build encodes and checks", () => {
  assert.equal(probeBinary("/opt/ffmpeg-full/bin/ffmpeg"), "/opt/ffmpeg-full/bin/ffprobe");
  assert.equal(probeBinary("./tools/ffmpeg"), "tools/ffprobe");
});
