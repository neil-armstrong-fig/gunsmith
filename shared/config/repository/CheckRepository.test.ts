import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {expect, it} from "vitest";
import {checkRepository} from "./CheckRepository.ts";

it("reports both instruction and executable-art failures from the repository entry point", () => {
  const root = mkdtempSync(join(tmpdir(), "gunsmith-repository-"));
  try {
    writeFileSync(join(root, "AGENTS.md"), "The fuzzy frontend comes first");
    mkdirSync(join(root, "docs/art"), {recursive: true});
    writeFileSync(join(root, "docs/art/Study.html"), "<script>const value = ;</script>");
    const failures = checkRepository(root).join("\n");
    expect(failures).toContain("AGENTS.md: stale startup instruction");
    expect(failures).toContain("docs/art/Study.html script 1: Parsing error");
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

it("ignores private archived instructions while still checking live instructions", () => {
  const root = mkdtempSync(join(tmpdir(), "gunsmith-private-"));
  try {
    mkdirSync(join(root, "private-source/originals"), {recursive: true});
    writeFileSync(join(root, "private-source/originals/AGENTS.md"), "[Private](Missing.md)");
    expect(checkRepository(root)).toEqual([]);
    writeFileSync(join(root, "AGENTS.md"), "[Live](Missing.md)");
    expect(checkRepository(root).join("\n")).toContain("AGENTS.md: missing reference Missing.md");
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
