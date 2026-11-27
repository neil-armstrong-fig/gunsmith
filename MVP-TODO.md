# MVP TODO

Everything still open for the MVP, from the closed sessions (play, engine, server, budget, ship, art) gathered on 2026-11-27. Whichever session meets
an item does it, reading the package `AGENTS.md` files on its path first. The standing sessions are ai (`TODO-ai.md`) and netcode
(`TODO-netcode.md`). Tick an item here when it is done, and move anything that turns out not
to be MVP to [POSTMVP-TODO.md](POSTMVP-TODO.md).

**MVP scope** ([TODO.md](TODO.md#mvp-integration-priorities)): hosted private rooms. A player signs in, makes a weapon and an arena in the
workshop, tries and saves them, reloads the shelf, and uses the saved items in a best of three against a second browser. Guests play practice
and private rooms with built-ins.

The closed sessions' checklists, with their evidence and delivery history, are in git: `git show 76f7374c:TODO-<persona>.md`.

## Decisions and checks for the user

- [ ] **M1 first-time-player playtest** (the M1 gate). Tell the newcomer nothing beyond the screen. Watch whether they find move, aim, fire,
      crouch and weapon switch unaided, whether fog and heights read, whether they notice and escape the ring, and whether Play again and the
      pre-round make sense. Record their words on fun and your verdict here.
- [ ] **Controls hint or tutorial.** Nothing on screen names the controls. Scope: a one-screen hint, or a guided first round.
- [ ] **The bot wins in seconds** against a standing player (median 8.3 s over 300 seeds). Tune it before the playtest, or not.
- [ ] **The high-ground edge rule.** Look at `?scenario=fair-duel`, `?scenario=heights` and Ridgeline or Twin ridges, then play a paired
      playtest to settle `EDGE_REACH_TILES` (1, `engine/src/height/EdgeReach.ts`).
- [ ] **The HUD can be used to hide in.** The ammunition and health panels are fixed DOM boxes at 80% opacity over the arena's bottom corners,
      so a fighter standing under one is mostly hidden. Draw fighters above the HUD, move the panels, or keep the corners out of play.
- [ ] **Blocked generation history rows.** A signed-in player with no credits writes one blocked row per request, kept for 14 days. Cap it
      (suggested: one per account per reason per hour), or leave it.

## Rooms and saved items

- [ ] **A saved item played end to end on a real signed-in seat.** The specs stand in by rewriting frames. This needs a local sign-in seam in
      `api/`, or the live acceptance below.
- [ ] **A saved arena in a day's-five room** has no acceptance criterion yet.
- [ ] **The remembered arena scrolled into view** when the arena list opens (about one line in `ArenaPicker`).
- [ ] **"Opponent is away" notice:** netcode slice S6 (`TODO-netcode.md`), with the wording agreed with the user.

## Arenas

- [ ] **`repairArena`'s `widenPlatform` tries `CLIMBS` east first**, so a matching pair of towers grows in different directions. A symmetric
      choice keeps generated arenas fairer (ai's review request, HANDOFF 2026-11-27; ai may take it).
- [ ] **Sunken court** (the 21st built-in) is not yet checked against the edge rule, or for cover touching raised floor.

## Privacy and policies

The Privacy Policy and Terms of Service (`webapp/public/privacy.html`, `terms.html`) and the signed-in Make notice are built, linked from the
Game menu and both Workshop tabs ([privacy design](docs/privacy-and-data.md#make-notices)).

- [ ] **Before publishing the policies:** check the deployed provider disclosures and hosting settings against them.
- [ ] **The controller's review** of the legitimate interests and children's impact assessments in [privacy and data](docs/privacy-and-data.md).

## Release and production checks

The manual release steps are in [MANUAL-SETUP-STEPS.md](MANUAL-SETUP-STEPS.md#first-deploy).

- [ ] **Live private-room acceptance** against production, once authorised: sign in, make, save, and play the saved items in a room with a
      second browser. Prove hidden opponents stay off the wire and the pre-round makes zero model calls.
- [ ] **Production sign-in round trip** and the **first daily account-retention sweep** (04:00 UTC): verify each and record the evidence.
- [ ] **Hosted CI:** profile the next sharded run against the 36-minute baseline
      ([Operations](docs/agent-reference/Operations.md#ci-and-deployment)), and validate the four preview shards and their blob artifacts.
- [ ] **The live shutdown drill** (`docs/cost-and-budget.md`). It needs the deployed Worker and `ALERT_TO_ADDRESS`, and can lower the caps with
      the `DAILY_SPEND_CAP_MICRODOLLARS` and `MONTHLY_SPEND_CAP_MICRODOLLARS` Worker vars. It must prove that new generation stops, credits are
      refunded, the AI-off banner shows, and saved items and guest play still work.
- [ ] **Settled spend against the Anthropic Console:** compare the spend ledger with the real bill after the first paid calls, under a cost
      ceiling the user sets.
