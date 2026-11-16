import {expect, it} from "vitest";
import {codecArguments} from "@gunsmith/audio-studies/encoding/encoder-arguments/codec/CodecArguments";

it("encodes Ogg as Vorbis at quality 5 with 20 ms pages", () => {
  expect(codecArguments("ogg")).toStrictEqual(["-c:a", "libvorbis", "-q:a", "5", "-page_duration", "20000"]);
});

it("encodes MP3 with LAME at VBR quality 2, writing the Xing header that carries the loop's delay", () => {
  expect(codecArguments("mp3")).toStrictEqual(["-c:a", "libmp3lame", "-q:a", "2", "-write_xing", "1"]);
});
