/** A real git repository in a temporary folder, for the tests of what asks git. It is removed when the test that made it ends. */
export interface TemporaryRepository {
  /** The repository's own folder, as git reports it (symbolic links resolved). */
  root: string;
  /** A linked worktree of the repository, in a folder of its own, as `.claude/worktrees/<persona>` is. */
  addWorktree(): string;
  /** Leaves a file that no commit contains. */
  leaveUncommittedFile(): void;
}
