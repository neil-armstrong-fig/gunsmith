# The fuzzy frontend (tried and dropped 2026-11-12)

> **Status: not used.** See the first demo note below. Kept for the screen map and the reasoning. The ledger and the "Fakes to build" table describe code that no longer exists.

Source: [Fuzzy Frontend](https://neilarmstrong.dev/blog/fuzzy-frontend/). Read in full on 2026-11-12.

The approach, in the author's terms: build the UI and UX of the whole feature end to end at low fidelity, with fake data
and no backend. Every screen exists and every path works, so someone can click from start to finish and the flow can
be demoed and challenged before the rest is built. Some parts are very rough on purpose. **A facade gets thrown away. A
fuzzy frontend becomes the product.** "I'd rather find out in hours I'm wrong rather than days after I've built the
entire thing end to end."

For gunsmith this matters twice: the game is a feel-driven product, and the pre-round flow (prompt, judge, generate,
reveal) has many states whose awkwardness only shows when clicked through. `build` therefore starts here, fast, and
brings ATDD in as the fast follow.

## Rules

1. **Whole flow first.** Map every screen and path, then make them all clickable before polishing any one.
2. **Fake everything behind interfaces that are the real ones.** A fake server, a fake AI adapter, fixture weapons and
   arenas, a scripted opponent and practice dummies. Shape the fakes as the real contracts (`HANDOFF.md`) so swapping a
   real one in later changes no screen.
3. **Rough is fine, broken is not.** Primitive geometry and plain Tailwind are acceptable; a path that dead-ends is not.
4. **A hotkey jumps to any step.** Backtick opens a step jumper listing every screen and every awkward state. This is
   how a reviewer sees the whole game in minutes.
5. **Keep it, don't discard it.** Code written here is real code: typed, named by the standards in `AGENTS.md`,
   and structured so it can be firmed up in place.
6. **Log what is still fuzzy.** The ledger below says which areas are rough and what closes each row.
7. **Show it early.** When the demo checkpoint passes, tell the user, and use their reaction to decide what to cut or add
   before the ATDD phase.
8. **ATDD follows.** Each ledger row is closed test-first, one area at a time, with the flow still clickable. Engine,
   API and AI work are never fuzzy.

## Screen map (every box must be clickable end to end)

```
Landing ──► Practice arena (solo, dummies, spend credits to make weapons) ──► Library
   │
   ├─► Sign in (fake Google) ──► Account (credits, history, delete)
   │
   ├─► Private room ──► waiting (code, spectators, host sets delay) ──┐
   └─► Public queue ──► searching ──────────────────────────────────┤
                                                                      ▼
                         Pre-round: weapon prompt 1 ─► (see opponent's first) ─► weapon prompt 2
                                    arena prompt (blind until submitted)
                                                  ▼
                         Generation progress (token check → judge → generate → validate → rate)
                                                  ▼
                         Reveal (~30 s): arena preview, 4 weapons with stats and power rating
                                                  ▼
                         Match: round 1 ─► round 2 ─► (round 3)   [HUD, fog, heights, crouch, ring of fire]
                                                  ▼
                         Match end: result, rating change, favourite / rename / keep weapons and arenas ─► Library
Spectator view (delayed, host-configured)         Match history
```

States the step jumper must reach directly: prompt over the token limit; prompt rejected by the judge (half credit); out
of credits; generation timeout (built-in pool and refund); AI off (kill switch); opponent never submitted; opponent
disconnected with the 30 s countdown; round forfeited; ring of fire closing; library full; sign-in failed.

## Fakes to build (and what later replaces them)

| Fake | Replaced by | Owner of the real one |
| ---- | ----------- | --------------------- |
| In-browser fake server (state in memory and `localStorage`): sign-in, credits, library, rooms | `api/` over HTTP and WebSocket | `build` |
| Fake `AiAdapter` with fixtures, delay, progress events and failure modes | the LangGraph pipeline | `ai` |
| Scripted opponent that wanders and shoots; practice dummies | a real second player (dummies stay for the practice arena) | `build` |
| Hand-written weapons and arenas | AI-generated ones, validated by the same schemas | `ai` |
| Primitive shapes, placeholder sounds | art and audio from the asset manifest | `art` |
| Client-only simulation | server-authoritative simulation with prediction | `build` |

## Definition of "ready for a first look"

A person who has never seen it can, with no explanation: open the landing page, play the practice arena, sign in, create
a private room, go through the pre-round with the fake AI, see the reveal, play a best-of-three against the scripted
opponent with fog, three height levels, crouch and the closing ring, finish the match, and save a weapon to the library.

## Ledger (update as you go)

Statuses: `fuzzy` (works, rough), `focused` (acceptance spec exists and was watched to fail), `real` (backed by the real
service). Add a row per screen or system.

| Area | Status | Still fuzzy | Closed by |
| ---- | ------ | ----------- | --------- |
| One-page shell (rail, stage, side panel), step jumper | fuzzy | Plain Tailwind and no icons; the stage is a fixed three-column grid that wraps the three arena levels when narrow | Acceptance specs for the jumper and for each screen's path |
| Pre-round: prompt entry, blind arena, reveal of the opponent's first | fuzzy | Opponent is scripted; no 60 s window or countdown; guests can type but only get the built-in pool | Spec for the order rules, then a real second player |
| Generation progress | fuzzy | Items run one after another (about ten seconds); the real pipeline may run them in parallel | Spec with the fake adapter's failures (rejection, timeout, AI off, over the limit) |
| Reveal | fuzzy | Power rating is a stand-in formula in `webapp/src/game/power/`; the arena is flat coloured squares; no 30 s timer | The `engine/` power rating, then art |
| Credits and the ledger | fuzzy | Fake ledger in `localStorage`; charge up front, refund the difference; no D1 | `CreditLedger` contract suite shared with the D1 one |
| Library, account, history | fuzzy | Redux only, so a reload forgets them (credits survive); no rename; history is partly invented | Specs for save, favourite, slot limit; the API |
| Private room, public queue, spectating | fuzzy | Buttons stand in for the opponent joining; the queue finds someone after 2.5 s; spectating shows nothing | Real rooms and the matchmaker (Phase E) |
| Match, round end, match end | fuzzy | **No simulation:** two stand-in buttons win or lose a round; the arena canvas is a WASD square with no walls, shooting, fog, heights or ring | The playable core, then Phase D |

## Demo notes

Record here, after each demo, what felt wrong, what the user cut or asked for, and the decision. Newest first.

- 2026-11-12, **the user's reaction, and the cut.** After the self-review below, the user looked at it and said it was "a
  bunch of menus": the game should take up the whole screen with menus appearing as required (unlike janggi, it does not
  need to be "always on board"), and the amount of code in `shared/` was worrying. Decision: **the method was tried and
  dropped for this project.** All of Phase A was deleted, `shared/` went back to tool config, and development restarts
  slowly, test first, building a fun game before anything around it (`TODO-build.md`). What the attempt taught: a clickable
  shell of menus is cheap to build and says almost nothing about whether the game is fun; the contracts it forced
  (schemas, adapters, ledgers) were drafted before any consumer needed them and became code to carry. If the method is
  used again, point it at the game's feel first, not its surrounding flow. The rest of this file is kept for the history.
- 2026-11-12, `build` (self-review, not yet shown to the user): clicked sign in, private room, both weapon prompts and the blind
  arena prompt, generation, reveal, a 2 to 1 match, match end and history in a real browser, then used the jumper for
  "prompt over the limit". It works end to end. Found and fixed while clicking: the fake picker gave a ricochet SMG prompt a
  plain slug thrower (generic words were tried first), and weapon colour swatches were missing (Tailwind drops theme
  variables only an inline style names). **Felt wrong, not fixed:** the reveal stacks three arena levels vertically in a
  1200 px window; generation is slow to watch with six rows in sequence; the guest path through the pre-round is a dead end
  of "built-in" notes, so a guest would want a clearer nudge; there is no way to see a weapon's sound yet. The game is not
  yet ready for the user's first look: it has no playable round.
