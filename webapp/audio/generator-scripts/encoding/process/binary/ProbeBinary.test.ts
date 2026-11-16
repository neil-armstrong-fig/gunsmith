import {expect, it} from "vitest";
import {probeBinary} from "@gunsmith/audio-studies/encoding/process/binary/ProbeBinary";

it("is the system ffprobe when the encoder is found on the path", () => {
  expect(probeBinary("ffmpeg")).toBe("ffprobe");
});

it("is the ffprobe beside an encoder given by its full path, so one build encodes and checks", () => {
  expect(probeBinary("/opt/ffmpeg-full/bin/ffmpeg")).toBe("/opt/ffmpeg-full/bin/ffprobe");
  expect(probeBinary("./tools/ffmpeg")).toBe("tools/ffprobe");
});
