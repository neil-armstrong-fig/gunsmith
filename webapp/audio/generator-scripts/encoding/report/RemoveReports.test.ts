import assert from "node:assert/strict";
import {mkdtemp, readdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {after, before, it} from "node:test";
import {removeReports} from "@gunsmith/audio-studies/encoding/report/RemoveReports";

let folder = "";

before(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-reports-"));
});

after(async () => {
  await rm(folder, {recursive: true, force: true});
});

it("removes all three reports and leaves the exports, and does not mind a report that is not there", async () => {
  for (const name of ["report.json", "verification.json", "sfx-hit.ogg"]) {
    await writeFile(join(folder, name), "x");
  }
  await removeReports(folder);

  assert.deepEqual(await readdir(folder), ["sfx-hit.ogg"]);
});
