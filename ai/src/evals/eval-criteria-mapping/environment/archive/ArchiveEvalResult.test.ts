import {existsSync, mkdirSync, readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {createTemporaryRepository} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/testing/CreateTemporaryRepository";
import {archiveEvalResult} from "@evals/eval-criteria-mapping/environment/archive/ArchiveEvalResult";

const RUN = "20261118-171245";

it("keeps the file in the MAIN checkout's private-source when the run started in a linked worktree", () => {
  const repository = createTemporaryRepository();
  const worktree = repository.addWorktree();
  mkdirSync(join(repository.root, "private-source"));
  startRunIn(worktree);

  archiveEvalResult("AskingForAWeapon-local.json", '{"criteria": 3}\n');

  const runFolder = onlyRunFolderIn(repository.root);
  expect(readFileSync(join(runFolder, "AskingForAWeapon-local.json"), "utf8")).toBe('{"criteria": 3}\n');
  expect(existsSync(join(worktree, "private-source"))).toBe(false);
});

it("names the run folder after the run and the commit, so a later run never overwrites it", () => {
  const repository = createTemporaryRepository();
  mkdirSync(join(repository.root, "private-source"));
  startRunIn(repository.root);

  archiveEvalResult("a-fake.json", "{}\n");

  expect(onlyRunFolderIn(repository.root)).toMatch(new RegExp(`/eval-results/${RUN}-[0-9a-f]{7,}$`));
});

it("keeps every file of one run in the same folder", () => {
  const repository = createTemporaryRepository();
  mkdirSync(join(repository.root, "private-source"));
  startRunIn(repository.root);

  archiveEvalResult("first-fake.json", "1\n");
  archiveEvalResult("second-fake.json", "2\n");

  expect(readdirSync(onlyRunFolderIn(repository.root)).sort()).toEqual(["first-fake.json", "second-fake.json"]);
});

it("keeps nothing when archiving is switched off", () => {
  const repository = createTemporaryRepository();
  mkdirSync(join(repository.root, "private-source"));
  startRunIn(repository.root);
  vi.stubEnv("EVAL_ARCHIVE", "0");

  archiveEvalResult("a-fake.json", "{}\n");

  expect(existsSync(join(repository.root, "private-source", "eval-results"))).toBe(false);
});

it("keeps nothing, and does not fail the run, when the main checkout has no private-source", () => {
  const repository = createTemporaryRepository();
  startRunIn(repository.root);

  expect(() => archiveEvalResult("a-fake.json", "{}\n")).not.toThrow();
  expect(existsSync(join(repository.root, "private-source"))).toBe(false);
});

function startRunIn(directory: string): void {
  vi.stubEnv("EVAL_RUN_ID", RUN);
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
}

function onlyRunFolderIn(checkout: string): string {
  const results = join(checkout, "private-source", "eval-results");
  const folders = readdirSync(results);

  expect(folders).toHaveLength(1);

  return join(results, folders[0] ?? "");
}
