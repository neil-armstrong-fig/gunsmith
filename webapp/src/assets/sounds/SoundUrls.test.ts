import {readFileSync} from "node:fs";
import {SOUND_KEYS} from "@src/assets/sounds/SoundKeys";
import {SOUND_URLS} from "@src/assets/sounds/SoundUrls";

it("knows every key", () => {
  expect(Object.keys(SOUND_URLS).sort()).toEqual([...SOUND_KEYS].sort());
});

it.each(SOUND_KEYS)("has an address for %s that names its key", key => {
  expect(SOUND_URLS[key]).toContain(key);
});

it.each(SOUND_KEYS)("has a separate, nonempty MP3 asset for %s", key => {
  expect(SOUND_URLS[key]).toContain(".mp3");
  expect(SOUND_URLS[key]).not.toMatch(/^data:/);
  expect(readFileSync(new URL(`./files/${key}.mp3`, import.meta.url)).length).toBeGreaterThan(0);
});
