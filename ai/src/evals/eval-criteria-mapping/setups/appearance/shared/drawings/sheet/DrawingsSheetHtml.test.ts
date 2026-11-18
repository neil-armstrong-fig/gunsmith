import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";
import {drawingsSheetHtml} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/sheet/DrawingsSheetHtml";

it("shows each request's drawing beside what it asked, how it ended and what it cost", () => {
  const html = drawingsSheetHtml([
    {prompt: "a rubber duck cannon", outcome: {...passingAppearanceOutcome(), status: "repaired", modelCalls: 2}},
  ]);

  expect(html).toContain("a rubber duck cannon");
  expect(html).toContain("<svg");
  expect(html).toContain("repaired");
  expect(html).toContain("2 calls");
});

it("escapes what a player wrote", () => {
  const html = drawingsSheetHtml([{prompt: "<script>alert(1)</script>", outcome: passingAppearanceOutcome()}]);

  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;");
});

it("says what was still wrong when a stand-in is shown", () => {
  const html = drawingsSheetHtml([
    {
      prompt: "a gun",
      outcome: {
        ...passingAppearanceOutcome(),
        status: "fallback",
        errors: ["body.#: reaches outside the 64 by 64 space"],
      },
    },
  ]);

  expect(html).toContain("reaches outside the 64 by 64 space");
});

it("does not fall over on an appearance that is not a drawing", () => {
  const html = drawingsSheetHtml([
    {prompt: "broken", outcome: {...passingAppearanceOutcome(), appearance: "nonsense"}},
  ]);

  expect(html).toContain("no drawing");
});

it("shows the tokens a request cost going in as well as coming out, because the kit's catalogue is in the prompt", () => {
  const html = drawingsSheetHtml([
    {prompt: "a gun", outcome: {...passingAppearanceOutcome(), usage: {inputTokens: 1320, outputTokens: 245}}},
  ]);

  expect(html).toContain("1320 tokens in");
  expect(html).toContain("245 tokens out");
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
