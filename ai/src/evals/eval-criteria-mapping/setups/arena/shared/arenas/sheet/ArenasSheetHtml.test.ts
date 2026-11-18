import {arenasSheetHtml} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/sheet/ArenasSheetHtml";
import {passingArenaOutcome} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/testing/PassingArenaOutcome";

it("shows the rows of an arena the model made, in a block that keeps their shape", () => {
  const page = arenasSheetHtml([{prompt: "a box", outcome: passingArenaOutcome()}]);

  expect(page).toContain("<pre>#####\n#...#\n#####</pre>");
  expect(page).toContain("Pillars");
});

it("says how the request ended, beside the words that asked for it", () => {
  const page = arenasSheetHtml([{prompt: "a box", outcome: passingArenaOutcome()}]);

  expect(page).toContain("a box");
  expect(page).toContain("created");
  expect(page).toContain("2 calls");
});

it("shows why a request was turned away, and no arena", () => {
  const outcome = passingArenaOutcome({status: "rejected", arena: undefined, reason: "not an arena", modelCalls: 1});

  const page = arenasSheetHtml([{prompt: "a recipe", outcome}]);

  expect(page).toContain("not an arena");
  expect(page).toContain("1 call");
  expect(page).not.toContain("1 calls");
  expect(page).not.toContain("<pre>");
});

it("says when a built-in arena was given instead and the credit went back", () => {
  const outcome = passingArenaOutcome({status: "builtIn", refunded: true, reason: "the arena could not be played"});

  expect(arenasSheetHtml([{prompt: "a wall", outcome}])).toContain("credit refunded");
});

it("escapes whatever a player or a model wrote, so a prompt cannot put markup on the page", () => {
  const outcome = passingArenaOutcome({arena: {name: "<b>name</b>", rows: ["<script>alert(1)</script>"]}});

  const page = arenasSheetHtml([{prompt: "<img src=x onerror=alert(1)>", outcome}]);

  expect(page).not.toContain("<script>alert");
  expect(page).not.toContain("<img src=x");
  expect(page).not.toContain("<b>name</b>");
  expect(page).toContain("&lt;script&gt;");
});
