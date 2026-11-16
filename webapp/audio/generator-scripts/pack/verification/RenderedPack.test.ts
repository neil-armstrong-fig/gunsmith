import {mkdtemp, readdir, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {expect, it} from "vitest";
import {renderAudio} from "@gunsmith/audio-studies/RenderAudio";

const COMMITTED = join(import.meta.dirname, "..", "..", "..", "generated-audio");

// Rendering the whole pack takes minutes, so `pnpm checks` skips this. Run it with `pnpm test:render` after any change to the
// recipes, the synthesis or the encoding: the pack in `generated-audio/` must come out byte for byte the same.
const slow = process.env["FULL_RENDER"] === undefined;

it.skipIf(slow)(
  "renders the whole pack to exactly the files committed in generated-audio (slow: run `pnpm test:render`)",
  {timeout: 20 * 60_000},
  async () => {
    const output = await mkdtemp(join(tmpdir(), "gunsmith-full-render-"));
    try {
      await renderAudio(output);

      expect((await readdir(output)).sort()).toStrictEqual(
        (await readdir(COMMITTED)).filter(file => !file.startsWith(".")).sort(),
      );
      for (const file of await readdir(output)) {
        expect(await readFile(join(output, file)), `${file} differs`).toStrictEqual(
          await readFile(join(COMMITTED, file)),
        );
      }
    } finally {
      await rm(output, {recursive: true, force: true});
    }
  },
);
