import assert from "node:assert/strict";
import {it} from "node:test";
import {expectedProbe} from "@gunsmith/audio-studies/encoding/verification/probe/ExpectedProbe";
import type {EncodedFile} from "@gunsmith/audio-studies/encoding/types/EncodedFile";

function fileOf(format: EncodedFile["format"], channels: number): EncodedFile {
  return {key: "sfx-hit", format, sourceSha256: "", sha256: "", bytes: 1, channels, seconds: 1, arguments: []};
}

it("calls Ogg's codec Vorbis", () => {
  assert.equal(expectedProbe(fileOf("ogg", 1)), "vorbis,48000,1");
});

it("calls MP3's codec MP3, and carries the channel count", () => {
  assert.equal(expectedProbe(fileOf("mp3", 2)), "mp3,48000,2");
});
