import {mkdtempSync, readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {keepDrawing} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/KeepDrawing";
import {startDrawings} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/StartDrawings";

it("clears the last run's drawings, so a page shows one run and not every run since", () => {
  const folder = mkdtempSync(join(tmpdir(), "start-"));
  const outcome = {
    status: "valid" as const,
    appearance: passingAppearance(),
    changes: [],
    errors: [],
    nodes: ["generate", "fix", "validate"],
    modelCalls: 1,
    usage: {inputTokens: 1, outputTokens: 1},
  };
  keepDrawing({folder, tier: "local", enabled: true, drawing: {prompt: "old", outcome}});

  startDrawings({folder, tier: "local", enabled: true});

  expect(JSON.parse(readFileSync(join(folder, "drawings-local-latest.json"), "utf8"))).toEqual([]);
});

it("leaves the files alone when the run did not ask to keep drawings", () => {
  const folder = mkdtempSync(join(tmpdir(), "start-"));

  startDrawings({folder, tier: "local", enabled: false});

  expect(() => readFileSync(join(folder, "drawings-local-latest.json"), "utf8")).toThrow();
});
