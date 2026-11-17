# TODO: the north star path

The shared path all three personas feed. Each persona keeps their own checklist (`TODO-build.md`, `TODO-ai.md`,
`TODO-art.md`); this file says **what the whole project is heading for, in what order, and who is blocking whom.**

## Sync protocol (every fresh session)

1. Read root `AGENTS.md`, `HANDOFF.md`, this status board and the current milestone. Scan blocker/request headings and read those involving your task or its dependencies; future milestones and unrelated requests are references.
2. Read your own checklist's current resume section and the tasks in scope. Read other persona checklists only for dependencies; historical archives are optional task references.
3. Before editing code, explicitly read every applicable package and nested `AGENTS.md` in full. Starting Codex at the repository root does not automatically load package instructions. Never assume a file was loaded; recover any truncated instruction read in smaller sections.
4. Say which milestone is current, what the other personas are doing or waiting on, and what you will do. Use this board for their current status.
5. Finish by updating your checklist, current status and blockers, and adding a concise delivery to `HANDOFF.md`. Move detailed historical narratives to `docs/history/`; keep current decisions and unfinished tasks visible.
6. Report actual verification results. A standards review must name the instruction files and include the folder/caller audit; it is separate from lint and test results.

Start a session with: **"You are build|ai|art, continue the TODO."**

## Status board

| Persona | Current focus | Updated |
| ------- | ------------- | ------- |
| build | M1: finish stairs/bot work in its existing session; incoming damage, hit feedback, shake and approved inventory integration. Pickups and empty click are committed. | 2026-11-17 |
| ai | Integrate separate stats/appearance calls (five maximum); preserve cumulative spend. Research 2's v1 labels and AI-chosen omitted-stat policy are approved; owner agreement, probes and balancing remain pending. | 2026-11-17 |
| art | Session 1: MP3 runtime switch authorized; empty click now uses MP3. Safari timing and combat masking remain follow-up QA. Inventory approved. Research 2: labels/policy review complete; handoff ready. | 2026-11-17 |

Detailed current tasks: [build](TODO-build.md), [AI](TODO-ai.md), [art](TODO-art.md).
Earlier status, requests and measurements: [snapshot](docs/history/2026-11-17-compaction/SharedTodo.md).

## The path

M0 is complete; M1 is current. Later milestones proceed when their consumers and dependencies exist; owner checklists hold the implementation tasks.

| # | Milestone | Done when |
| - | --------- | --------- |
| M0 | **Foundation** (this repo's docs) | A fresh session can start from the docs alone. *Done 2026-11-12.* |
| M1 | **A fun, playable game** (was: fuzzy frontend, dropped 2026-11-12) | Someone who has never seen it can play a best-of-three against the scripted opponent in a full-screen arena with fog, heights, crouch and the ring, and it is fun. First look by the user. |
| M2 | **Contracts frozen** (un-frozen 2026-11-12: nothing is drafted until the game needs it) | `HANDOFF.md` "What is ready" rows 1 to 4 are ticked and `ai` and `art` have signed off in the delivery log. |
| M3 | **Focus: ATDD and the real engine** | `pnpm checks` green; acceptance suite green on a production build; engine property tests green; first art files delivered. |
| M4 | **Multiplayer for real** | Two browsers play a match through the real Worker; a hidden opponent is absent from the network snapshot; spike result recorded. |
| M5 | **Real AI behind the adapter** | A player can type a weapon and an arena and play with the result; the shutdown drill passes; rejection and timeout paths work. |
| M6 | **Art and audio wired in** | The game looks and sounds like itself; no manifest key is missing. |
| M7 | **Ship** | Live at `gunsmith.neilarmstrong.dev`; acceptance passes against live; alerts and kill switch armed. |
| M8 | **Case study and polish** | The case study can be written from `docs/focused-case-study.md` and real numbers. |

## Blockers and requests

- Build coordinates with the separate stairs/bot session before overlapping its files; pickup-seeking follows that work.
- Build: integrate approved [inventory](docs/art/concepts/inventory-display/README.md) and remaining [combat feedback](docs/art/concepts/combat-feedback/Handover.md), agreeing minimum hook/event/manifest data first.
- Build/AI: implement [arena fairness](docs/art/arena-fairness-research.md), including transformed stairs/heights, matching spawns, clearance and paired playtests. Preserve random ring centres; use escape measurements as diagnostics.
- AI coding owner: follow the [five-call integration handoff](docs/ai-visual-generation.md#ai-session-handoff-2026-11-15); reconcile actual cumulative spend before authorized paid runs. The research assignment remains documentation/review only.
- AI/build: use the approved v1 labels and AI-chosen unspecified values/trade-offs in the [preference-probe brief](docs/ai-stat-preference-probe.md). Agree balancing ownership/rating, then probe encodings after integration; see [the study](docs/ai-stat-balancing.md). Power remains a ceiling preserving deliberate weakness, including tactical bad weapons in the arena. No production solver/budget is frozen.
- Build/art: MP3 is approved for production; the empty click now uses MP3. Retain recorded Safari timing findings as follow-up QA, with no blanket trimming or threshold changes. Future static cues use MP3 as build integrates them.
- Build/AI: act on the visual reviews' identity/readability findings during integration (duck/cactus, lantern evidence, pose/muzzle alignment, teapot contrast). Kit generation remains shelved.
- Build/AI: implement the [fair-play/privacy handover](docs/art/fair-play-research.md) with online play: sign-in for public play, bounded/private replays and reporting, isolated restricted queues, clean-match recovery/human override and retention/erasure checks. This does not block M1.
- M2 contracts/manifest remain unfrozen until real consumers exist and owners review them. API/infra, root eval/property/API commands and CI remain tracked in the owner checklists.

## Open questions and tunables

- [ ] Tune movement/vision, health, ring, spawn/arena and power parameters through play; later spectator delay, saved-item limits and rating windows.
- [ ] Choose free versus Workers Paid after real Durable Object and AI CPU measurements.
- [ ] Final name/domain check and case-study publication home.

API imports AI in the Worker; that hosting decision is settled. Completed work and superseded requests belong in linked history, not this queue.
