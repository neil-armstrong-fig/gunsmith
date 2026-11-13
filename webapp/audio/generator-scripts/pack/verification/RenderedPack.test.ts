import assert from "node:assert/strict";
import {mkdtemp, readdir, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {it} from "node:test";
import {renderAudio} from "@gunsmith/audio-studies/RenderAudio";

const COMMITTED = join(import.meta.dirname, "..", "..", "..", "generated-audio");

// Rendering the whole pack takes minutes, so `pnpm checks` skips this. Run it with `pnpm test:render` after any change to the
// recipes, the synthesis or the encoding: the pack in `generated-audio/` must come out byte for byte the same.
const skip = process.env["FULL_RENDER"] === undefined && "slow: run `pnpm test:render` to render the whole pack";

it(
  "renders the whole pack to exactly the files committed in generated-audio",
  {skip, timeout: 20 * 60_000},
  async () => {
    const output = await mkdtemp(join(tmpdir(), "gunsmith-full-render-"));
    try {
      await renderAudio(output);

      assert.deepEqual(
        (await readdir(output)).sort(),
        (await readdir(COMMITTED)).filter(file => !file.startsWith(".")).sort(),
      );
      for (const file of await readdir(output)) {
        assert.ok(
          (await readFile(join(output, file))).equals(await readFile(join(COMMITTED, file))),
          `${file} differs`,
        );
      }
    } finally {
      await rm(output, {recursive: true, force: true});
    }
  },
);
