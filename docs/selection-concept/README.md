# Selection concept: making and choosing weapons and arenas

Owner: play (2026-11-18, the user: play owns this end to end and needs no sign-off from other sessions). A concept, not code:
nothing here is built, and no shared contract is drafted until a screen consumes it. The arena-pick rule is decided in
[the AI pipeline](../ai-pipeline.md#choosing-the-arena-the-players-pick-there-is-no-ai-judge); this page says what the player sees and
what each owner must supply. A clickable mock-up goes with it ([the file](Mockup.html); a private artifact copy exists but is not durable: this file is the record).

## The decision that shapes everything (the user, 2026-11-18)

**Making happens in the workshop, never in a match.** The pre-round only **chooses** from the shelf and the built-ins. Weapons take
about six seconds to make and a player takes far longer to write the prompt, so doing both inside a 60 s window, with both players
waiting for the slower request, was the wrong place for it. This replaces game design's "both players write prompts in the
pre-round, then generation runs" (that document needs the same edit when this is built). Next for the user: a **tutorial**, and the
**workshop first**, so the flows can be tested.

## The workshop (first thing built)

No timer, no opponent. It is the practice arena (game design: the solo arena where a player can spend credits to make and save
weapons) with a panel opened by a key, in place over the dimmed arena, and it is also reachable from the page without starting a
match. The loop is: **write, make, try it on the dummies, save, iterate.** Making an arena is the same with "walk it" in place of
the dummies. Credits spent here are the same daily credits.

## Testing a weapon, easily (the user, 2026-11-18)

Trying a made weapon must be the easiest step in the workshop, because it is the whole point of making one. The loop is **make, try,
change, try**, and the player never leaves the practice arena.

- **One click.** The made card's main button is **Try it**, ahead of Save and Try again. It closes the panel, puts the weapon in slot 2
  and in hand, and the player is already standing in the practice arena. No menu, no loading, no cost.
- **Ready to shoot at.** Four dummies stand at about 3, 6, 9 and 11 tiles (built 2026-11-19; the first plan said 3, 6, 10 and 14, which the
  24-by-14 practice range cannot fit, and the rifle sees only 12), on different bearings so none shields another, so range, spread and
  damage can be felt, and the weapon's vision cone is visible as in a match. (The mock-up still draws 3, 6, 10 and 14.)
- **Never stuck.** Ammunition refills for free in the workshop (opening it fills both weapons), and **T** stands the dummies up again and fills both weapons. Keys 1 and 2
  swap between the default rifle and the new weapon, so it can be compared with something familiar.
- **Straight back.** The same key that opened the panel returns to it with the prompt, the result and the shelf as they were, so
  **Try again** (the edit) and the next **Try it** are one press each.
- **Also from the shelf.** Every saved weapon has **Try it** too, and it works with the AI off: trying and using saved items never
  needs a model. Arenas get **Walk it**, the same but for the player's own feet.

## The pre-round (after the workshop)

About 60 s, tunable, over the dimmed arena. Three choices in a fixed order, each from **the shelf or the built-ins**, free and
instant, with nothing to write and nothing to wait for:

1. **Weapon 1.** Lock it in. Only then does the opponent's weapon 1 appear, carried over from game design's rule that you see theirs
   once yours is in (now it shows the weapon, never anyone's prompt).
2. **Weapon 2.** Unlocks after weapon 1 is locked, so it can answer theirs.
3. **Arena.** Blind until locked in, then the opponent's appears. Each choice shows a **preview of the arena** before it is locked in: the
   real tiles, walls, levels and stairs, and the fair-start places, so the player knows what they are choosing (the opponent's arena
   gets the same preview).
4. **Arena pick.** If the two players put forward different arenas, both are shown to both, and each picks one, "random" or
   nothing; the table in `ai-pipeline.md` settles it and the screen says how (`agreed`, `coin`, `only-pick`, `pick-kept`,
   `random`). One arena, or the same one, skips this step and says so.
5. **Reveal**, about 30 s: the arena preview and the four weapons with stats and power rating; then round 1.

A player who chooses nothing gets the built-ins, so the match starts as it does today. A guest has only built-ins and an empty
shelf, with "Sign in to make your own" in the workshop, never a dead end. Because nothing is generated here, the pre-round has no
model call, no credit and no latency to hide.

## How long making takes

**Measured** (`docs/cost-and-budget.md`, Haiku 5.5, 48 weapons, a developer machine): a weapon with its drawing takes a median of
5.9 s end to end (mean 6.0 s, maximum 8.3 s); the stats alone take 2.7 s. **Not measured:** arenas (about 2.5 times a weapon's output,
so probably slower: a guess), anything through the Worker, a production worst case, and the timeout, which exists but has no number.
Nothing here is a p95. The workshop therefore shows the wait honestly ("making your weapon", the stage it is on), has a hard deadline
once the timeout is measured (after which the built-in is used and the credit refunded), and the real route should record each
request's duration so these numbers come from play.

## The states every prompt box has (workshop)

| State                     | What the player sees                                                                                                                                                        | Cost             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Ready                     | Box, a live character count against the limit (600 for a weapon, 1,000 for an arena), price ("1 credit"), balance ("7 of 10 today")                                         | none             |
| Too long                  | Count turns red and **Make stays off** until it fits; the text is kept                                                                                                      | none (see below) |
| Making                    | The prompt, locked, a spinner and the stage, "usually a few seconds"                                                                                                        | reserved         |
| Made                      | The result card (below)                                                                                                                                                     | spent            |
| Turned away               | The reason in plain words from the pipeline, the text kept for editing                                                                                                      | 0.5              |
| Timed out or failed       | "Used a built-in instead", which one, and "credit refunded"                                                                                                                 | refunded         |
| AI off, or out of credits | Only **making** is paused, with a one-line why. Built-ins and **every saved weapon and arena** (generated ones included) still work: Use, Try it, Walk it and the pre-round | none             |

## The result card

A weapon: the name, its **picture**, the **power rating** (shown before **Use**, decided), the drawing (art's renderer, or the disclosed stand-in), and
the stats as plain rows (damage, shots a second, magazine and reserve, reload, vision cone) using the inventory HUD's icons. The
balancer's changes are **said**, not hidden: "Damage lowered to fit the power limit." A weapon that came out weak on purpose shows
"Weak on purpose" and what it traded, since the balancing notes require the reveal to explain material compromises. Actions: **Use**
(try it on the dummies, or take it into a match), **Try again** (an edit of this result, 1 credit) and **Save**.

An arena: a **preview** (also in the pre-round, see below), a top-down thumbnail drawn from the engine's own arena (the same tiles the game draws; **in delivery these are the game's real tile art** from `public/assets/tiles`, through the game's own tile loader, not a hand-drawn imitation), its name, size and levels, the
fair-start markers, and the built-in pool as a row of the same thumbnails.

## Pictures everywhere a weapon appears

The weapon's drawing is shown on the result card, on the shelf, on the reveal, and beside each choice in the pre-round, not only on
the ground and in hand. Built-ins use art's authored sprites; a made weapon uses its generated appearance through the existing
weapon-drawing path (`useWeaponDrawing`), with the disclosed stand-in when a drawing failed. The mock-up uses the real built-in
sprites and tiles, with stand-in drawings for the made examples.

## Keeping things to iterate on

A player can keep a weapon or a prompt **whether or not they liked it, used it or won with it**, so they can come back and iterate
(the user, 2026-11-18).

- **Save is its own button, never a side effect of Use.** It is offered on every made weapon and arena: in the workshop, at the
  reveal, and on the end screen after a match. A weapon the player rejected, never picked up, or lost with is as saveable as the
  winner. The opponent's weapons and arenas can be saved too (game design: favourite and rename them after a match), labelled "from
  the opponent", with the **drawing and stats only, never the opponent's prompt text**.
- **The prompt is saved with its result.** A prompt that was turned away or came out too long can be saved on its own, with no
  result, at no cost, so the player can fix it later.
- **A saved item opens three ways** from the shelf: **Use** as it is (free: reuse is free), **Iterate** (the prompt opens beside the
  saved result; an edit of that weapon costs 1 credit, a fresh run costs 1), and **Delete**.
- **Weapons and arenas have a space each**, in two clearly separate sections on the shelf (a prompt saved without a result sits in the
  section of what it would have made), each with its own "n of max" meter. **The maximums are not the client's:** the server sets them
  per account and can change them (game design: one config, per account, never expiring), and a **paid option for more spaces** is
  possible later (a stretch goal in game design, with no design, price or privacy review yet). So the page reads both limits from
  the server, shows no number it has made up, and treats "full" as a normal state: saving asks which item to replace, offers more
  spaces only when the server says it can, and never drops anything silently. In the first slice, local storage uses two small
  tunables standing in for the server's numbers.
- **Works without the AI:** the shelf is read from local storage (later the library), so a saved generated weapon or arena can be used, tried and picked when the AI is off or credits are gone. **First slice:** the browser's local storage holds the shelf on this machine, with a small tunable limit. It is a stand-in the
  real library replaces when accounts exist, and nothing in it can reach the opponent.

## Limits are in characters, not tokens

The player cannot count tokens and neither can the page. The pre-check in `ai/` already does not: it estimates tokens as characters
divided by four (`tokenPrecheck`), so the real limits are **600 characters for a weapon and 1,000 for an arena**. The screens show
characters and nothing else, and the box counts live. Because the count is exact, the box can stop an over-long prompt from being
made, so the player is never charged the 0.5 rejection price for a mistake they could see; the server's pre-check stays as the
backstop and keeps that price. Two follow-ups: ai's refusal text says "about 151 tokens" and should say characters, and the two
limits must be one number the page and the pre-check both read, which makes them shared the day the webapp imports them (the root
rule: nothing goes in `shared/` until a second package needs it).

## What each owner must supply

| Owner  | Needed                                                                                                                                                                                                                                  | Today                                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| ai     | The weapon and arena results as one parsed shape: status, reason in player words, weapon or arena, appearance                                                                                                                           | `WeaponOutcome` is a draft with `weapon: unknown`; arena results likewise |
| engine | Power rating and balancer notes on a weapon; `resolveArenaPicks` moved to `engine/` (the webapp may not import `ai/`); built-in pool and limits                                                                                         | pool, limits and the pick rule built in `engine/` (ai deletes its copy)   |
| server | The shelf's per-account limits for weapons and arenas, set by config and possibly sold; a route that makes a weapon or arena for the workshop; later a room pre-round of choices (nothing, a shelf item or a built-in), the pick, clock | no route; the room hard-codes its arena                                   |
| budget | Balance, price and reserve/refund shown to the page                                                                                                                                                                                     | durable objects exist, no caller                                          |
| art    | The look of the cards, the thumbnails and the shelf                                                                                                                                                                                     | none drawn                                                                |

**The webapp cannot call the AI today:** it may import only `shared/` and the engine, and `api/` does not yet import `ai/`, so a
generation route is the one missing link between a prompt and a weapon. The workshop's first slice therefore uses a webapp-side
stand-in that answers with canned results shaped like the outcome the card needs, so the flows can be tested now; the real route
replaces it.

## First slice: the workshop (the user's order)

Local, no AI call. The panel opened by a key in the practice arena, with **Try it** one click away (see above); the prompt box with its character count; the making, made,
turned-away, too-long and timed-out states, answered by the stand-in; the result card with the rating; **Use** (the weapon goes into
slot 2 and can be tried on the dummies), **Try again**, **Save**; and the shelf in local storage with Use, Iterate and Delete.
**Built so far (2026-11-19):** the prompt box, Make (stand-in), the result card, Try it, the free refills and dummy fan, and **Save with a weapon shelf** (local storage, Try it, Iterate, Delete, a full shelf asks which to replace); arenas, prompt-only saves and the making states are not. Acceptance first, as everywhere. The pre-round's choosing, the arena pick and the reveal follow, then the real route, then the
tutorial the user has in mind.

## Decisions (the user, 2026-11-18)

1. **Rating before committing:** shown on the result card before **Use**.
2. **Try again:** an edit of the last result, 1 credit.
3. **Library in the first slice:** a local-storage shelf on this browser, replaced by the real library when accounts exist.
4. **Saving:** any made weapon or prompt can be saved whether or not it was liked, used or picked, to iterate on later.
5. **Where it opens:** a key in the practice arena opens the panel in place; it is also reachable outside a match.
6. **Limits:** shown in characters.
7. **Making is in the workshop only.** The pre-round chooses from the shelf and built-ins; no writing or generating in a match.
8. **Shelf:** weapons and arenas in separate sections with their own limits, which the server sets (and may later sell more of).
9. **Arena preview:** every arena choice in the pre-round shows a preview.
10. **Easy testing:** one-click Try it into the practice arena, free refills, and straight back to the panel.
11. **Order:** the workshop first, then a tutorial, so the flows can be tested.
