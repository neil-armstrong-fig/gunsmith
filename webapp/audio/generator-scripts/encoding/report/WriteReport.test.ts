import {mkdtemp, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterAll, beforeAll, expect, it} from "vitest";
import {writeReport} from "@gunsmith/audio-studies/encoding/report/WriteReport";

let folder = "";

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "gunsmith-report-"));
});

afterAll(async () => {
  await rm(folder, {recursive: true, force: true});
});

it("writes JSON with open objects, a final newline and short arrays on one line", async () => {
  const path = join(folder, "a.json");
  await writeReport(path, {a: 1, b: [2, 3]});

  expect(await readFile(path, "utf8")).toBe('{\n  "a": 1,\n  "b": [2, 3]\n}\n');
});

it("wraps a long array the way Prettier does, instead of writing it on one line", async () => {
  const path = join(folder, "b.json");
  await writeReport(path, {list: Array.from({length: 40}, (_, index) => `item-${index}`)});
  const lines = (await readFile(path, "utf8")).split("\n");

  expect(lines.length, "the array is wrapped").toBeGreaterThan(10);
});
