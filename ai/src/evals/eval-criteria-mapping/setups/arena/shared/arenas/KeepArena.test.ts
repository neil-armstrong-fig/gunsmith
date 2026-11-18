import {existsSync, mkdtempSync, readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {keepArena} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/KeepArena";
import {passingArenaOutcome} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/testing/PassingArenaOutcome";

it("keeps nothing unless asked to, so an ordinary run writes no extra files", () => {
  const folder = temporaryFolder();

  keepArena({folder, tier: "local", enabled: false, arena: {prompt: "a box", outcome: passingArenaOutcome()}});

  expect(existsSync(join(folder, "arenas-local-latest.json"))).toBe(false);
});

it("keeps every arena of the run, in the order asked, with a page to look at them", () => {
  const folder = temporaryFolder();

  keepArena({folder, tier: "local", enabled: true, arena: {prompt: "first", outcome: passingArenaOutcome()}});
  keepArena({folder, tier: "local", enabled: true, arena: {prompt: "second", outcome: passingArenaOutcome()}});

  const kept = JSON.parse(readFileSync(join(folder, "arenas-local-latest.json"), "utf8")) as {prompt: string}[];
  const page = readFileSync(join(folder, "arenas-local-latest.html"), "utf8");
  expect(kept.map(arena => arena.prompt)).toEqual(["first", "second"]);
  expect(page).toContain("first");
  expect(page).toContain("second");
});

it("keeps a request that was turned away too, so the page says why", () => {
  const folder = temporaryFolder();
  const outcome = passingArenaOutcome({status: "rejected", arena: undefined, reason: "not an arena", modelCalls: 1});

  keepArena({folder, tier: "local", enabled: true, arena: {prompt: "a recipe", outcome}});

  expect(readFileSync(join(folder, "arenas-local-latest.html"), "utf8")).toContain("not an arena");
});

function temporaryFolder(): string {
  return mkdtempSync(join(tmpdir(), "keep-arena-"));
}
