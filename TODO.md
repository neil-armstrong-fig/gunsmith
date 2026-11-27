# TODO: the north star path

**FOCUS ON MVP TASKS FIRST**

The shared path. Since 2026-11-27 sessions are ad hoc: the standing ones are **ai** and **netcode**, each with a `TODO-<session>.md`; everything else is done by whichever session meets it, from [MVP-TODO.md](MVP-TODO.md) and [POSTMVP-TODO.md](POSTMVP-TODO.md). This file says **what the whole project is heading for, in what order, and who is blocking whom.**

## Sync protocol (every fresh session)

1. Check status/branch/worktree: a standing session resumes in its worktree, synced with `origin/main` first (`sync-with-github` skill); an ad hoc session works where the user says. Record the path, branch and last merged main commit in your resume (see Operations.md). Read root `AGENTS.md`, `HANDOFF.md`, this status board and the current milestone. Scan blocker/request headings and read those involving your task or its dependencies; future milestones and unrelated requests are references.
2. Read your own checklist's current resume section and the tasks in scope. Read other persona checklists only for dependencies; historical archives are optional task references.
3. Before editing code, explicitly read every applicable package and nested `AGENTS.md` in full. Starting Codex at the repository root does not automatically load package instructions. Never assume a file was loaded; recover any truncated instruction read in smaller sections.
4. Say which milestone is current, what the other personas are doing or waiting on, and what you will do. Use this board for their current status.
5. Finish by updating your checklist resume (current slice, owned files, next failing test/check and next action), your status row and blockers, and adding a concise delivery to `HANDOFF.md`. Keep completed session narratives outside the public documentation; preserve current decisions and unfinished tasks.
6. Report actual verification results. A standards review must name the instruction files and include the folder/caller audit; it is separate from lint and test results.

Start a standing session with: **"You are netcode, continue the TODO."** (or ai). An ad hoc session starts from [MVP-TODO.md](MVP-TODO.md).

## Status board

| Persona | Model | Checklist | Current focus | Updated |
| --- | --- | --- | --- | --- |
| ai | Claude | [TODO-ai.md](TODO-ai.md) | **The live generation smoke passed on production (2026-11-26, docs only): a signed-in Make of a weapon (9.0 s, the model's own drawing after ship's fix) and a Blue arena (2.9 s), both tried, saved and back after a reload, and an off-topic prompt refused by moderation for 0.5 credit; D1 rows checked with wrangler.** Private Make history keeps every completed attempt's prompt after best-effort redaction in code (`ai/src/privacy/RedactPersonalInformation`); capture stays off until the Worker var `GENERATION_HISTORY_CAPTURE` is `"true"`, after art's assessments and notice. Arena generation: Blue (shapes) is the default, Red edits one of three archetypes (`EDIT_BASES`), and no built-in substitute is given for an unusable arena. The attack specs and the MVP's weapon, drawing and arena evals are regressions on Haiku, **the watchtower too since 2026-11-27** (ai built engine's platform growth, `arena-repair/stairs/WidenPlatform`, at the user's go; 3 of 3 at level 2; engine reviews it; committed `e62a2a3c`). | 2026-11-27 |
| netcode | Claude | `TODO-netcode.md` (written by its first session) | Not started. Plan: the measuring bench, a slimmer snapshot, lag compensation, a version handshake and hardening. | 2026-11-27 |

Select one slice from an active workstream and record concrete reservations and contracts in HANDOFF.md. Each shared file has one writer per slice. The model column records session defaults. The Art checklist records its deliveries and handoffs.


## The path

M0 is complete; M1 is current. Later milestones proceed when their consumers and dependencies exist; owner checklists hold the implementation tasks.

| # | Milestone | Done when |
| - | --------- | --------- |
| M0 | **Foundation** (this repo's docs) | A fresh session can start from the docs alone. *Done 2026-11-12.* |
| M1 | **A fun, playable game** (replaced the first fuzzy frontend, 2026-11-12; same rough-parts-first intent, applied to the game: [approach](docs/build-approach.md)) | Someone who has never seen it can play a best-of-three against the scripted opponent in a full-screen arena with fog, heights, crouch and the ring, and it is fun. First look by the user. |
| M2 | **Contracts frozen** (un-frozen 2026-11-12: nothing is drafted until the game needs it) | Real consumers have reviewed the required schemas, adapter, ledger and asset manifest; domain owners and affected consumers sign off in HANDOFF.md. |
| M3 | **Focus: ATDD and the real engine** | `pnpm checks` green; acceptance suite green on a production build; engine property tests green; first art files delivered. |
| M4 | **Multiplayer for real** | Two browsers play a match through the real Worker; a hidden opponent is absent from the network snapshot; spike result recorded. |
| M5 | **Real AI behind the adapter** | A player can type a weapon and an arena and play with the result; the shutdown drill passes; rejection and timeout paths work. |
| M6 | **Art and audio wired in** | The game looks and sounds like itself; no manifest key is missing. |
| M7 | **Ship** | Live at `gunsmith.neilarmstrong.dev`; acceptance passes against live; alerts and kill switch armed. |
| M8 | **Case study and polish** | Measured outcomes and lessons are ready for a case study. |

## MVP integration priorities

Use **hosted private rooms** as the working MVP scope. A player can sign in, make a weapon and an arena in the workshop, try and save them, reload the shelf, and use the saved items in a best-of-three with a second browser. Guests can play practice and private rooms with built-ins. Public matchmaking, ratings, spectators and replay have their own backlog. M1 remains current until the local first-time-player checkpoint is recorded.

The open MVP work, with who may take it, is in [MVP-TODO.md](MVP-TODO.md).

## Blockers and requests

- **Privacy pages (art closed 2026-11-27):** the Privacy Policy, Terms of Service and Make notice are on main; the deployed provider disclosures are checked before they are published ([MVP-TODO.md](MVP-TODO.md#privacy-and-policies)).
- **ai → engine work:** `repairArena`'s `widenPlatform` direction review ([MVP-TODO.md](MVP-TODO.md#arenas)); ai may take it.
- **netcode:** owns the online match's feel and fairness; it changes `MatchRoom`'s input intake and the browser's prediction, so other sessions touching those coordinate in [HANDOFF.md](HANDOFF.md).
- Current milestone remains M1. Add menus, shared contracts and future packages only with real consumers.

## Open questions and tunables

- [ ] Tune movement/vision, health, ring, spawn/arena and power parameters through play; later spectator delay, saved-item limits and rating windows.
- [ ] Choose free versus Workers Paid after real Durable Object and AI CPU measurements.
- [ ] Final name/domain check and case-study publication home.

API imports AI in the Worker; that hosting decision is settled. Keep this queue focused on unfinished work and durable decisions.
