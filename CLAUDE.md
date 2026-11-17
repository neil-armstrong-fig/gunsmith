@AGENTS.md

# Claude Code notes

`AGENTS.md` is the source of truth for coding standards. Follow the startup protocol in `TODO.md`.
Main is integration-only. Develop in the assigned persona worktree and follow the bidirectional main sync in docs/agent-reference/Operations.md.
Read current status, the handoff and your own current checklist; use other checklists and historical archives only when relevant.
Explicitly read applicable package and nested instructions before editing. Report real checks and the folder/caller review.
In a worktree, start every fresh turn with `git log --oneline HEAD..main`: if main has moved, merge it in, resolve the conflicts (ask only for a real decision) and commit the merge (`docs/agent-reference/Operations.md`).
Never commit, push, add dependencies, spend money or read secrets without the authorization required by the root instructions.
