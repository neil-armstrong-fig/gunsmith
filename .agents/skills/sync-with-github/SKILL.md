---
name: sync-with-github
description: Sync a Gunsmith persona worktree with GitHub's main. Fetch, merge main in (resolving conflicts and committing the merge), run the affected checks, then push the user's commits with a fast-forward. Use at the start of a fresh turn and after the user has committed.
---

# Sync with GitHub

Replaces the super turn (retired 2026-11-19). There is no integration checkout: every persona worktree exchanges work with `origin/main` directly. **The user makes every commit of real work.** The standing permission covers only: fetching, pulling, resolving merge conflicts, **committing the merge**, and pushing. Never commit, amend or rewrite your own feature, fix or docs work; leave it for the user and suggest a Conventional Commit message. Never force-push, reset, stash, `checkout`, `restore` or `clean` (other sessions share the stash and the files; see root `AGENTS.md`).

Run it from your persona worktree. Use it at the start of every fresh turn and whenever the user says they have committed.

## Steps

1. **Preflight.** `git status --porcelain=v1 --branch` and `git worktree list`. Confirm you are on your persona's branch (`worktree-<persona>`), with no pending merge, rebase or cherry-pick. Uncommitted work is normal and stays untouched; it only blocks the merge if the incoming changes overwrite the same files (Git will refuse and name them). Then report the work as the user's to commit, ask what to do, and never stash it.
2. **Fetch and inventory.** `git fetch origin`, then `git log --oneline HEAD..origin/main` (incoming) and `git log --oneline origin/main..HEAD` (yours to push). Name both lists.
3. **Bring main in.**
   - Nothing incoming: go to step 5.
   - Incoming and nothing local: `git merge --ff-only origin/main`. No commit.
   - Both: `git merge --no-ff --no-commit origin/main`. Read the incoming diff and the nearest tests, resolve, then commit as `chore: merge main into <branch>` (add the commit attribution trailer the session instructs, if any).
4. **Resolve conflicts yourself unless behaviour is in dispute.** Shared docs keep both sides: combine independent delivery notes, keep each owner's latest status, remove stale claims that integrated work is still uncommitted. Code is merged by meaning, never by whole-file ours/theirs on shared coordination files (`TODO.md`, `HANDOFF.md`). Scan for leftover markers (`<<<<<<<`, `=======`, `>>>>>>>`, diff3 `|||||||`). **Ask the user** when the two sides disagree on behaviour (not wording), have incompatible interfaces, or one would lose meaningful work; name the file and the concrete alternatives, and leave the merge state intact. Never abort or reset on your own. If you need to look at a path another persona owns, read it; do not edit it beyond what the merge needs.
5. **Check what the merge brought.** If it touched code, run the project's typecheck, lint and the relevant tests (`pnpm checks` at the root, plus the package's own tests); report real results. A failure that comes from the incoming side is reported to the user and the owning persona, not patched away: do not weaken assertions to push. A docs-only merge needs no code check.
6. **Push.** `git push origin HEAD:main`, a plain fast-forward. Push only when HEAD is ahead of `origin/main` (the user's commits and/or your merge commit) and checks passed. If the push is rejected because `main` moved, `git fetch origin` and repeat from step 2; never `--force`. Do not push a branch with unresolved conflicts or a failing combined check.
7. **Report.** The incoming commits (or none), whether a merge commit was made and its conflicts and how you resolved them, check results, the pushed range (`<old>..<new>`), and anything left for the user (uncommitted work, a question). Update your checklist's resume with the last merged `origin/main` commit.

## Rules of thumb

- A fresh turn with nothing incoming and nothing to push is just a one-line "up to date at `<sha>`".
- Read secrets nowhere in this flow; a secret-guard hook may block diffs of env files, and if it fires, do not work round it.
- Other worktrees pick your pushed commits up the same way, with this skill. Do not touch their checkouts, and do not fast-forward the `main` checkout for them.
