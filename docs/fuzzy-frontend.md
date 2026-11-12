# The fuzzy frontend

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
| (nothing built yet) | | | |

## Demo notes

Record here, after each demo, what felt wrong, what the user cut or asked for, and the decision. Newest first.

- (none yet)
