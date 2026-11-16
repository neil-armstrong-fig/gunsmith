import {mkdtemp, readdir, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterAll, beforeAll, expect, it} from "vitest";
import {removeReports} from "@gunsmith/audio-studies/encoding/report/RemoveReports";

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-reports-"));
});

afterAll(async () => {
  await rm(folder, {recursive: true, force: true});
});

it("removes all three reports and leaves the exports, and does not mind a report that is not there", async () => {
  for (const name of ["report.json", "verification.json", "sfx-hit.ogg"]) {
    await writeFile(join(folder, name), "x");
  }
  await removeReports(folder);

  expect(await readdir(folder)).toStrictEqual(["sfx-hit.ogg"]);
});
