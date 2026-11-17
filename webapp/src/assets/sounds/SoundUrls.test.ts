import {readFileSync} from "node:fs";
import {SOUND_KEYS} from "@src/assets/sounds/SoundKeys";
import {SOUND_URLS} from "@src/assets/sounds/SoundUrls";

/** The bytes of the file for `key`, read from the folder that holds them. */
function fileOf(key: string): Buffer {
  return readFileSync(new URL(`./files/${key}.wav`, import.meta.url));
}

it("knows every key", () => {
  expect(Object.keys(SOUND_URLS).sort()).toEqual([...SOUND_KEYS].sort());
});

it.each(SOUND_KEYS)("has an address for %s that names its key", key => {
  expect(SOUND_URLS[key]).toContain(key);
});

it.each(SOUND_KEYS)("has a mono 48 kHz 16-bit WAV file for %s", key => {
  const bytes = fileOf(key);

  expect(bytes.toString("ascii", 0, 4)).toBe("RIFF");
  expect(bytes.toString("ascii", 8, 12)).toBe("WAVE");
  expect(bytes.readUInt16LE(22)).toBe(1);
  expect(bytes.readUInt32LE(24)).toBe(48_000);
  expect(bytes.readUInt16LE(34)).toBe(16);
});
