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
