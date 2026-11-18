import {mkdirSync} from "node:fs";
import {join} from "node:path";
import {createTemporaryRepository} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/testing/CreateTemporaryRepository";
import {archiveFolder} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/ArchiveFolder";

const RUN = "20261118-171245";

it("is nothing when the run has no id, so a run started by hand archives nothing", () => {
  const repository = createTemporaryRepository();
  mkdirSync(join(repository.root, "private-source"));

  expect(archiveFolder({}, repository.root)).toBeUndefined();
});

it("is nothing when archiving is switched off", () => {
  const repository = createTemporaryRepository();
  mkdirSync(join(repository.root, "private-source"));

  expect(archiveFolder({EVAL_RUN_ID: RUN, EVAL_ARCHIVE: "0"}, repository.root)).toBeUndefined();
});

it("is nothing when the checkout has no private-source folder, as in CI and a fresh clone", () => {
  const repository = createTemporaryRepository();

  expect(archiveFolder({EVAL_RUN_ID: RUN}, repository.root)).toBeUndefined();
});

it("is nothing outside a repository", () => {
  expect(archiveFolder({EVAL_RUN_ID: RUN}, "/")).toBeUndefined();
});

it("is a folder for the run and its commit inside the checkout's private-source", () => {
  const repository = createTemporaryRepository();
  mkdirSync(join(repository.root, "private-source"));

  expect(archiveFolder({EVAL_RUN_ID: RUN}, repository.root)).toMatch(
    new RegExp(`^${repository.root}/private-source/eval-results/${RUN}-[0-9a-f]{7,}$`),
  );
});

it("is inside the MAIN checkout's private-source when asked from a linked worktree, so a removed worktree loses nothing", () => {
  const repository = createTemporaryRepository();
  const worktree = repository.addWorktree();
  mkdirSync(join(repository.root, "private-source"));

  const folder = archiveFolder({EVAL_RUN_ID: RUN}, worktree);

  expect(folder?.startsWith(`${repository.root}/private-source/eval-results/`)).toBe(true);
  expect(folder?.startsWith(worktree)).toBe(false);
});

it("marks a run whose code no commit contains", () => {
  const repository = createTemporaryRepository();
  mkdirSync(join(repository.root, "private-source"));
  repository.leaveUncommittedFile();

  expect(archiveFolder({EVAL_RUN_ID: RUN}, repository.root)).toMatch(/-[0-9a-f]{7,}-uncommitted$/);
});

it("is the folder the run already has, even when the working tree changed since the run's first file", () => {
  const repository = createTemporaryRepository();
  mkdirSync(join(repository.root, "private-source"));
  const first = archiveFolder({EVAL_RUN_ID: RUN}, repository.root) ?? "";
  mkdirSync(first, {recursive: true});

  repository.leaveUncommittedFile();

  expect(archiveFolder({EVAL_RUN_ID: RUN}, repository.root)).toBe(first);
});

it("is a folder of its own for a different run", () => {
  const repository = createTemporaryRepository();
  mkdirSync(join(repository.root, "private-source"));
  const first = archiveFolder({EVAL_RUN_ID: RUN}, repository.root) ?? "";
  mkdirSync(first, {recursive: true});

  expect(archiveFolder({EVAL_RUN_ID: "20261118-190000"}, repository.root)).not.toBe(first);
});
