import {readdirSync, readFileSync} from "node:fs";
import {resolve} from "node:path";

/** One of `art`'s appearance-only examples: the file's name and what it holds, unparsed, as a model's answer would be. */
export interface ArtAppearanceFixture {
  name: string;
  appearance: unknown;
}

const CONCEPTS_FOLDER = resolve(import.meta.dirname, "../../../../../docs/art/concepts");

/** Where `art` keeps appearance JSON, and which files in each folder are one (the first folder also holds drawings). */
const FIXTURE_FOLDERS = [
  {folder: "simple-machinery-04", suffix: "Appearance.json"},
  {folder: "top-down-oddities/appearances", suffix: ".json"},
] as const;

/**
 * Reads every appearance `art` has drawn and handed over straight from `docs/art/`, so the candidate validator is tested against
 * the people who will write the examples, not against a copy of them. If `art` changes a fixture's shape on purpose, these tests
 * fail until the schema or the fixture moves: that is the point. Test-only (reads the disk).
 */
export function readArtAppearanceFixtures(): ArtAppearanceFixture[] {
  return FIXTURE_FOLDERS.flatMap(({folder, suffix}) => {
    const absoluteFolder = resolve(CONCEPTS_FOLDER, folder);

    return readdirSync(absoluteFolder)
      .filter(name => name.endsWith(suffix))
      .sort()
      .map(name => ({
        name,
        appearance: JSON.parse(readFileSync(resolve(absoluteFolder, name), "utf8")) as unknown,
      }));
  });
}
