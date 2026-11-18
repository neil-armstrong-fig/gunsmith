import {mkdtempSync, realpathSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createTemporaryRepository} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/testing/CreateTemporaryRepository";
import {commitLabel} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/commit-label/CommitLabel";

it("is the short hash of the commit the checkout is on, when nothing is uncommitted", () => {
  const repository = createTemporaryRepository();

  expect(commitLabel(repository.root)).toMatch(/^[0-9a-f]{7,}$/);
});

it("says the code is not exactly that commit, when something is uncommitted", () => {
  const repository = createTemporaryRepository();
  const clean = commitLabel(repository.root);

  repository.leaveUncommittedFile();

  expect(commitLabel(repository.root)).toBe(`${clean}-uncommitted`);
});

it("reads the commit of a linked worktree, not of the main checkout", () => {
  const repository = createTemporaryRepository();
  const worktree = repository.addWorktree();

  expect(commitLabel(worktree)).toMatch(/^[0-9a-f]{7,}$/);
});

it("says there is no commit outside a repository", () => {
  const outside = realpathSync(mkdtempSync(join(tmpdir(), "gunsmith-not-a-repository-")));

  expect(commitLabel(outside)).toBe("no-commit");
});
