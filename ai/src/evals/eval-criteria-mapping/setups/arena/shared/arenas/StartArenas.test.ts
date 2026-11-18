import {existsSync, mkdtempSync, readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {keepArena} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/KeepArena";
import {startArenas} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/StartArenas";
import {passingArenaOutcome} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/testing/PassingArenaOutcome";

it("leaves the files alone when the run did not ask to keep arenas", () => {
  const folder = temporaryFolder();

  startArenas({folder, tier: "local", enabled: false, runId: "run-1"});

  expect(existsSync(join(folder, "arenas-local-latest.json"))).toBe(false);
});

it("clears the last run's arenas, so a page shows one run and not every run since", () => {
  const folder = temporaryFolder();
  keepOne(folder, "old");

  startArenas({folder, tier: "local", enabled: true, runId: "run-2"});

  expect(kept(folder)).toEqual([]);
});

it("clears what is there when the run has no id, because it cannot tell it from an earlier run", () => {
  const folder = temporaryFolder();
  keepOne(folder, "old");

  startArenas({folder, tier: "local", enabled: true});

  expect(kept(folder)).toEqual([]);
});

it("does not clear what an earlier spec file of the same run kept, because each spec file is a process of its own", () => {
  const folder = temporaryFolder();
  startArenas({folder, tier: "local", enabled: true, runId: "run-1"});
  keepOne(folder, "from the first spec file");

  startArenas({folder, tier: "local", enabled: true, runId: "run-1"});
  keepOne(folder, "from the second spec file");

  expect(kept(folder)).toEqual(["from the first spec file", "from the second spec file"]);
});

it("clears again for the next run, even when the last run left its mark", () => {
  const folder = temporaryFolder();
  startArenas({folder, tier: "local", enabled: true, runId: "run-1"});
  keepOne(folder, "run 1");

  startArenas({folder, tier: "local", enabled: true, runId: "run-2"});

  expect(kept(folder)).toEqual([]);
});

function temporaryFolder(): string {
  return mkdtempSync(join(tmpdir(), "start-arenas-"));
}

function keepOne(folder: string, prompt: string): void {
  keepArena({folder, tier: "local", enabled: true, arena: {prompt, outcome: passingArenaOutcome()}});
}

function kept(folder: string): string[] {
  const arenas = JSON.parse(readFileSync(join(folder, "arenas-local-latest.json"), "utf8")) as {prompt: string}[];

  return arenas.map(arena => arena.prompt);
}
