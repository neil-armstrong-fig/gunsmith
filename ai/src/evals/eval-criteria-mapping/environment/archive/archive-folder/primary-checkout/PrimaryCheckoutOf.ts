import {execFileSync} from "node:child_process";
import {basename, dirname, resolve} from "node:path";

/**
 * The main checkout of the repository a folder belongs to, found through git's common directory, so a linked worktree (as
 * `.claude/worktrees/<persona>` is) answers the checkout that outlives it rather than itself. Nothing outside a repository, or in
 * one whose common directory is not a `.git` folder (a bare repository), has a main checkout to answer.
 */
export function primaryCheckoutOf(directory: string): string | undefined {
  const commonDirectory = gitCommonDirectory(directory);
  if (commonDirectory === undefined) {
    return undefined;
  }

  if (basename(commonDirectory) !== ".git") {
    return undefined;
  }

  return dirname(commonDirectory);
}

function gitCommonDirectory(directory: string): string | undefined {
  try {
    const output = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    return resolve(directory, output.trim());
  } catch {
    return undefined;
  }
}
