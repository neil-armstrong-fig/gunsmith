import {expect, it} from "vitest";
import {expectedProbe} from "@gunsmith/audio-studies/encoding/verification/probe/ExpectedProbe";
import type {EncodedFile} from "@gunsmith/audio-studies/encoding/types/EncodedFile";

it("calls Ogg's codec Vorbis", () => {
  expect(expectedProbe(fileOf("ogg", 1))).toBe("vorbis,48000,1");
});

it("calls MP3's codec MP3, and carries the channel count", () => {
  expect(expectedProbe(fileOf("mp3", 2))).toBe("mp3,48000,2");
});

function fileOf(format: EncodedFile["format"], channels: number): EncodedFile {
  return {key: "sfx-hit", format, sourceSha256: "", sha256: "", bytes: 1, channels, seconds: 1, arguments: []};
}
