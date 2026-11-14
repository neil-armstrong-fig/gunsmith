import assert from "node:assert/strict";
import {it} from "node:test";
import {codecArguments} from "@gunsmith/audio-studies/encoding/encoder-arguments/codec/CodecArguments";

it("encodes Ogg as Vorbis at quality 5 with 20 ms pages", () => {
  assert.deepEqual(codecArguments("ogg"), ["-c:a", "libvorbis", "-q:a", "5", "-page_duration", "20000"]);
});

it("encodes MP3 with LAME at VBR quality 2, writing the Xing header that carries the loop's delay", () => {
  assert.deepEqual(codecArguments("mp3"), ["-c:a", "libmp3lame", "-q:a", "2", "-write_xing", "1"]);
});
