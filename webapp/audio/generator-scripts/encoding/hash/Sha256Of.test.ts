import {expect, it} from "vitest";
import {sha256Of} from "@gunsmith/audio-studies/encoding/hash/Sha256Of";

it("is the lowercase hex SHA-256 of the bytes", () => {
  expect(sha256Of(Buffer.from("abc"))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

it("hashes nothing to the SHA-256 of the empty input", () => {
  expect(sha256Of(Buffer.alloc(0))).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
});
