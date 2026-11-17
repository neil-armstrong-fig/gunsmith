import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {expect, it} from "vitest";
import {instructionFailures} from "./InstructionFailures.ts";

it.each(["play", "engine", "ai", "server", "budget", "art", "ship"])(
  "checks references in the %s persona checklist",
  persona => {
    const root = mkdtempSync(join(tmpdir(), "gunsmith-persona-"));
    try {
      writeFileSync(join(root, `TODO-${persona}.md`), "[Missing](Missing.md)");
      expect(instructionFailures(root).join("\n")).toContain(`TODO-${persona}.md: missing reference Missing.md`);
    } finally {
      rmSync(root, {recursive: true, force: true});
    }
  },
);

it.each([
  {name: "budget", text: "x".repeat(100), limit: 32, expected: "exceeds 32"},
  {name: "stale startup", text: "The fuzzy frontend comes first", limit: 65536, expected: "stale startup instruction"},
  {name: "missing reference", text: "[Rules](Missing.md)", limit: 65536, expected: "missing reference Missing.md"},
])("detects instruction $name failures", ({text, limit, expected}) => {
  const root = mkdtempSync(join(tmpdir(), "gunsmith-instructions-"));
  try {
    writeFileSync(join(root, "AGENTS.md"), text);
    expect(instructionFailures(root, limit).join("\n")).toContain(expected);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

it("includes nested instruction overrides in the budget", () => {
  const root = mkdtempSync(join(tmpdir(), "gunsmith-override-"));
  try {
    writeFileSync(join(root, "AGENTS.md"), "root");
    mkdirSync(join(root, "nested"));
    writeFileSync(join(root, "nested/AGENTS.override.md"), "x".repeat(100));
    expect(instructionFailures(root, 64).join("\n")).toContain("exceeds 64");
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});
