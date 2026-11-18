import {execFileSync} from "node:child_process";
import {mkdtempSync, realpathSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {onTestFinished} from "vitest";
import type {TemporaryRepository} from "@evals/eval-criteria-mapping/environment/archive/archive-folder/testing/types/TemporaryRepository";

/** A temporary git repository with one commit. Test-only; it removes itself, and every worktree it added, when the test ends. */
export function createTemporaryRepository(): TemporaryRepository {
  const folder = mkdtempSync(join(tmpdir(), "gunsmith-archive-"));
  const root = realpathSync(folder);
  let worktrees = 0;

  git(root, "init", "--quiet");
  git(root, "commit", "--quiet", "--allow-empty", "--message", "first");
  onTestFinished(() => rmSync(folder, {recursive: true, force: true}));

  return {
    root,
    addWorktree: () => {
      worktrees += 1;
      const worktree = join(root, "..", `${folder.split("/").pop()}-worktree-${worktrees}`);
      git(root, "worktree", "add", "--quiet", "--detach", worktree);
      onTestFinished(() => rmSync(worktree, {recursive: true, force: true}));

      return realpathSync(worktree);
    },
    leaveUncommittedFile: () => writeFileSync(join(root, "uncommitted.txt"), "no commit has this\n"),
  };
}

function git(directory: string, ...gitArguments: string[]): void {
  const identity = ["-c", "user.name=Test", "-c", "user.email=test@example.com", "-c", "commit.gpgsign=false"];

  execFileSync("git", [...identity, ...gitArguments], {cwd: directory, stdio: "ignore"});
}
