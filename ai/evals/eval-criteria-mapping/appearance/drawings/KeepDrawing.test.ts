import {existsSync, mkdtempSync, readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";
import {keepDrawing} from "@evals/eval-criteria-mapping/appearance/drawings/KeepDrawing";

function folder(): string {
  return mkdtempSync(join(tmpdir(), "drawings-"));
}

it("keeps nothing unless asked to, so an ordinary run writes no extra files", () => {
  const where = folder();
  keepDrawing({
    folder: where,
    tier: "local",
    enabled: false,
    drawing: {prompt: "a gun", outcome: passingAppearanceOutcome()},
  });

  expect(existsSync(join(where, "drawings-local-latest.json"))).toBe(false);
});

it("keeps every drawing of the run, in the order asked, with a page to look at them", () => {
  const where = folder();
  keepDrawing({
    folder: where,
    tier: "paid",
    enabled: true,
    drawing: {prompt: "first", outcome: passingAppearanceOutcome()},
  });
  keepDrawing({
    folder: where,
    tier: "paid",
    enabled: true,
    drawing: {prompt: "second", outcome: passingAppearanceOutcome()},
  });

  const kept = JSON.parse(readFileSync(join(where, "drawings-paid-latest.json"), "utf8")) as {prompt: string}[];
  const page = readFileSync(join(where, "drawings-paid-latest.html"), "utf8");

  expect(kept.map(drawing => drawing.prompt)).toEqual(["first", "second"]);
  expect(page).toContain("first");
  expect(page).toContain("second");
});

function passingAppearanceOutcome(): AppearanceOutcome {
  return {
    status: "valid",
    appearance: passingAppearance(),
    changes: [],
    errors: [],
    nodes: ["generate", "fix", "validate"],
    modelCalls: 1,
    usage: {inputTokens: 3000, outputTokens: 1000},
  };
}
