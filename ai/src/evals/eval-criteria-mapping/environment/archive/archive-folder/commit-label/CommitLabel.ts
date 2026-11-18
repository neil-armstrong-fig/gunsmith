import {execFileSync} from "node:child_process";

/**
 * Which code a run came from, as a folder-name part: the short hash of the commit the checkout is on, plus `-uncommitted` when
 * something no commit contains is in the working tree (the usual case here, where work is left for review), so a result is never
 * mistaken for the commit's own. `no-commit` outside a repository. Ignored files, as the results themselves are, do not count.
 */
export function commitLabel(directory: string): string {
  const commit = git(directory, ["rev-parse", "--short", "HEAD"]);
  if (commit === undefined) {
    return "no-commit";
  }

  const changes = git(directory, ["status", "--porcelain"]);
  if (changes === undefined || changes === "") {
    return commit;
  }

  return `${commit}-uncommitted`;
}

function git(directory: string, gitArguments: string[]): string | undefined {
  try {
    return execFileSync("git", gitArguments, {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}
