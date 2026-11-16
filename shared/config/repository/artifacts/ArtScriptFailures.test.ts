import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {expect, it} from "vitest";
import {artScriptFailures} from "./ArtScriptFailures.ts";

it("checks executable HTML scripts while skipping JSON data", () => {
  const root = mkdtempSync(join(tmpdir(), "gunsmith-art-"));
  try {
    mkdirSync(join(root, "docs/art"), {recursive: true});
    const file = join(root, "docs/art/Study.html");
    writeFileSync(file, '<script type="application/json">{"key":1}</script><script>const value = ;</script>');
    expect(artScriptFailures(root).length).toBeGreaterThan(0);
    writeFileSync(file, '<script type="application/json">{"key":1}</script><script>const value = 1;</script>');
    expect(artScriptFailures(root)).toEqual([]);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

it("skips unquoted JSON data script tags", () => {
  const root = mkdtempSync(join(tmpdir(), "gunsmith-art-data-"));
  try {
    mkdirSync(join(root, "docs/art"), {recursive: true});
    writeFileSync(join(root, "docs/art/Study.html"), '<script type=application/json>{"key":1}</script>');
    expect(artScriptFailures(root)).toEqual([]);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
