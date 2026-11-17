# Session decisions and proposals

These decisions remain task references. Proposals are not frozen runtime contracts.
The current owners and readiness are in [HANDOFF](../../HANDOFF.md).

## User-directed mechanics revision (2026-11-12)

This supersedes the original radius-vision and walkable-ramp assumptions. `art` updates the concepts and shared design
notes; `build` and `ai` must carry these changes into their owned schemas, fixtures, engine, renderer and generation.

- Height changes only at explicit **stairs**, with a visible flight/landing on each of the two connected levels.
  Other height boundaries are impassable. The validator must check routes through stairs. Replace the provisional
  ramp contract with paired stair endpoints; agree the exact manifest keys at M2. No production key is added by art.
- No `L1` / `L2` / `L3` text on the arena in play; floor tone, edge ticks and stairs explain height.
- **Confirmed vision model:** terrain remains dimly visible outside the cone; it is not opaque darkness. A forward
  cone follows aim through a full 360° turn, revealing terrain detail and players/items in its current area, subject
  to walls and height. The equipped **weapon** defines the base cone (configured by its prompt); standing/crouching
  modifies it. Crouch increases range as agreed. Filter dynamic entities on the server; dim known terrain is separate
  from revealing players/items. Cone ownership is settled; only omitted-stat policy remains pending.
- **Crouch increases forward vision range** rather than removing vision. Keep the cone's angle, aim direction and
  wall/height occlusion unchanged. The size of the range bonus is a build-owned tunable, not the illustrative ratio
  in the art sheet. Apply the same rule on the server and client.
- **Art must remain prompt-malleable:** weapon identities, silhouettes, proportions, decorations and effects may vary
  with validated generated descriptions. Behaviour classes are a vocabulary, not a fixed sprite catalogue. Build/AI
  should agree a bounded visual-description contract at M2; current weapon schemas have no visual-part fields.
  Keep generated visuals separate from hitboxes, damage rules, visibility and audio limits. Art's oddities sheet is
  an exploration, not evidence that arbitrary new mechanics are supported.
- Unspecified prompt details must still produce complete, usable results. The user is considering modest defaults
  versus letting the AI choose weaknesses in unspecified weapon fields; policy is awaiting their answer.
  Art recommends deterministic modest defaults with generated values visible at reveal. Exact numbers and cone caps
  belong to build/AI and must be settled together before implementation, not invented by the art concept.

## Research feedback from the user (2026-11-12)

- **Crouch:** substantially slows movement, making the player easier to hit. This is the intended tradeoff for longer
  vision, quieter movement and cover protection. Tune the slowdown through play; do not invent another penalty first.
- **Arena creation:** after the player/AI definitions are resolved, code finalises and validates geometry, stair routes,
  spawn/pickup access and ring escape. Apply the same fairness checks to built-in arenas, which also need deliberate
  authoring and playtesting. Generated content is not an excuse for lower quality; built-ins are the reference set.
- **Pickup proposal:** test weighting the strongest-rated weapon towards contested central space. This interprets
  “winning weapon” as highest power rating, not a new weapon-judging stage. It is weighted placement, not a fixed spawn
  or guaranteed pickup. Central means accessible by fair routes through stairs, not merely the geometric midpoint.
- **Fog clarification (corrected):** this is a dim map with a rotating detailed view, determined by equipped weapon
  and stance. Turning sweeps the cone over terrain and reveals players/items in it. Test both terrain detail and
  entity visibility, rather than describing the mechanic only as opponents appearing/disappearing. Outside-cone
  terrain remains visible at low detail; hidden players/items and their exact-position effects do not.

## Submitted visual-schema proposal (2026-11-12)

The user authorises design-time schema/renderer changes; generated weapons must never change code at runtime.
`art` submitted `docs/art/visual-schema-proposal.md`: a versioned optional appearance block, bounded primitive unions,
known effect/animation presets, palette roles, fixed anchors and one reusable renderer. It includes six fixture targets,
legacy fallback, initial budgets to measure and build/AI/art acceptance criteria. This is an M2 proposal, not a frozen
interface. Build implements the schema and renderer; AI reviews generation/eval cost; art supplies top-down QA.

## Authored weapon-parts experiment (2026-11-14)

Art supplies `docs/art/concepts/weapon-parts-kit-05/Parts.json`, twelve recipes and matching drawings.
Its `Assembly.md` defines the provisional attachment/size/mirroring interface and expansion conventions.
This is a proposed art-data interface for AI's kit probe, not a new production schema or renderer.
All twelve expanded drawings pass AI's current draft validator after temporary format conversion.
User visually approved the kit on 2026-11-14 (“looks really good”). Model selection/placement and
runtime performance remain unmeasured. Build/AI own
those implementations; art's README records unsupported identities and proposed handling.

