---
name: integrate-worktrees
description: Review Git worktrees and integrate their committed changes into main while preserving unfinished work. Use for requests to merge worktree deliveries or persona branches; not for committing their working files, pushing, or deploying.
---

# Integrate Worktrees

Deliver a clean, validated integration checkout containing the reviewed commits from the requested worktrees. Preserve unfinished work in every source checkout.

This skill is the executable form of steps 6-9 of [the worktree flow](../../../docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout). Claude Code and Codex share this one file (`.claude/skills/integrate-worktrees` is a symlink to it). If this file and `Operations.md` disagree, `Operations.md` wins; fix this file afterwards.

Run it from the **main checkout**. The `git log --oneline HEAD..main` start-of-turn merge is a persona-worktree rule, not part of integration.

## Establish scope and evidence

- Read the repository's root instructions, `TODO.md` startup and status board, `HANDOFF.md` and the integration guidance. Discover the actual target branch and integration checkout; default to local `main` only when the request or repository establishes it. Read package/nested instructions and nearby implementation/tests for incoming changes.
- Inventory with `git worktree list --porcelain`, `git -C <path> status --porcelain=v1 --branch`, and `git log --reverse --oneline <target>..<source-tip>`. Include locked worktrees in read-only review; a lock is not a reason to skip their committed deliveries. Skip branches with no unique commits.
- Record each source's absolute path, branch, exact tip, status and index fingerprint before integration. `git ls-files --stage -z` can be hashed without reading file contents. Keep evidence in temporary storage (the session scratchpad or `/private/tmp`), not source checkouts. Never read secrets, `.env*` files or secret-bearing diffs; a secret-guard hook may block them, and if it fires do not look for another way round it.
- Inspect commit contents from Git objects (`git show`, `git diff` between explicit revisions), not dirty worktree files. Review behavior, tests, consumed interfaces, dependencies, assets and delivery notes. Existing branch validation is inherited evidence, not a fresh combined result.
- Require the integration checkout to be clean. If it is dirty, identify the blocker and stop before mutation; do not stash, stage or discard unrelated work. Respect active owners. A request to integrate commits authorizes the necessary merges and merge commits within its stated conflict limits; do not ask again merely because Git writes are involved. If the tool still prompts for permission on a git write, that is expected.

## Merge reviewed commits

- Choose dependency order from actual consumers and overlapping changes; integrate one delivery at a time. Freeze the reviewed tip for each merge so moving branches cannot silently add unreviewed commits.
- Use `git merge --no-ff --no-commit <reviewed-tip>`, inspect the staged result, resolve permitted conflicts and run affected checks, then commit with a Conventional Commit message: `chore: merge <source-branch> into main`. Add the commit attribution trailer the session instructs, if any. A dirty source worktree is safe to merge by committed tip; never include its index or working files.
- Resolve straightforward conflicts yourself when authorized: combine independent delivery notes, keep each owner's latest status, and preserve both compatible code behaviors (shared docs keep both sides; code is merged by meaning). Do not choose whole-file ours/theirs for shared coordination files. Handle diff3 and nested virtual-ancestor markers carefully; inspect the final content and scan for remaining markers.
- Reconcile current status separately from historical delivery logs: remove stale claims that integrated work is still uncommitted, close delivered requests, and retain genuinely unfinished follow-ups. A delivered asset is not evidence that runtime integration exists.
- Ask the user about conflicts where the two sides disagree on behavior (not wording), incompatible interfaces, loss of meaningful work, or uncertain intent. Report the file and concrete alternatives. Leave the merge state intact while awaiting advice; do not reset or abort automatically.
- Main stays integration-only. Do not introduce feature fixes or refactors there to make checks pass. Diagnose a real defect and arrange a committed fix through its owning persona worktree, without modifying someone else's unfinished work.
- Do not commit working files from source worktrees, rebase/reset/stash/clean them, unlock/remove worktrees, delete branches, push, deploy, upgrade dependencies or spend money unless separately authorized. Owners merge the finished target back into their clean worktrees themselves (Operations.md step 8); do not sync active or dirty worktrees automatically.

## Validate the combined result

- Run the repository's typecheck, lint and relevant tests, using its documented combined gate (`pnpm checks`). Add the actual affected integration checks: production-build browser acceptance, engine properties, fake-only AI evals (`pnpm evals`), asset/codec or render verification. Inspect scripts first; do not assume command names or include paid/local model calls without authorization.
- Give browser checks a separate strict port and their own production-preview server. Never reuse or kill another session's server. Prefer the managed startup/cleanup scripts. Run independent checks in parallel only when their resource use and output paths permit it.
- Distinguish failures from permission, startup, timeout and existing-flake evidence. Retry after correcting a demonstrated environment problem, preserving the first result. Abnormally long timings justify investigating system suspension or resource contention; on macOS, `caffeinate -i <check>` can prevent idle sleep during a justified rerun. Do not assume a cause or retry repeatedly until green. If a failure reproduces, investigate or report it; never weaken assertions or tolerances to complete a merge.
- Perform the instruction-required standards and folder/caller review separately from automated checks. Do not claim lint proves layout, ownership, usability or model quality.

## Close the integration

- Re-inventory source tips before finishing. Review and integrate newly committed deliveries in the original scope, then rerun only checks affected by those additions. Do not chase unrelated new work indefinitely; state the final reviewed tips if activity prevents a stable boundary.
- Verify each reviewed tip with `git merge-base --is-ancestor <tip> <target>`. Compare source index fingerprints and statuses with the initial inventory. Other owners may legitimately change their work during integration; report that accurately rather than claiming byte-for-byte preservation from status alone. Investigate unexplained differences and never revert them.
- Update the integration records in `HANDOFF.md` (and the status board in `TODO.md` where it applies) with source tips, merge hashes, the tested code/assets revision, actual pass/fail/skipped results, resolved conflict decisions and outstanding limitations. Keep this a small coordination-only commit when authorized; validate those records too.
- Confirm no merge is pending, the target checkout is clean, and only servers/processes you started have been stopped. Report the final target commit, what was integrated, validation outcomes and preserved unfinished work. Say whether anything remains unmerged; do not imply a push or hosted-CI verification occurred.
