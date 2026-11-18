import {mkdirSync, mkdtempSync, realpathSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createTemporaryRepository} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/testing/CreateTemporaryRepository";
import {primaryCheckoutOf} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/primary-checkout/PrimaryCheckoutOf";

it("answers the repository's own folder when asked from its main checkout", () => {
  const repository = createTemporaryRepository();

  expect(primaryCheckoutOf(repository.root)).toBe(repository.root);
});

it("answers the main checkout, not the worktree, when asked from a linked worktree", () => {
  const repository = createTemporaryRepository();
  const worktree = repository.addWorktree();

  expect(primaryCheckoutOf(worktree)).toBe(repository.root);
});

it("answers the main checkout when asked from a folder inside a linked worktree", () => {
  const repository = createTemporaryRepository();
  const worktree = repository.addWorktree();
  const folder = join(worktree, "ai");
  mkdirSync(folder);

  expect(primaryCheckoutOf(folder)).toBe(repository.root);
});

it("answers nothing outside a repository", () => {
  const outside = realpathSync(mkdtempSync(join(tmpdir(), "gunsmith-not-a-repository-")));

  expect(primaryCheckoutOf(outside)).toBeUndefined();
});
