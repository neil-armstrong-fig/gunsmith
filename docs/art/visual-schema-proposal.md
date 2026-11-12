# Proposal: prompt-built visuals from strict JSON

**Scheduling update, 2026-11-12:** the user subsequently dropped the fuzzy frontend and build withdrew the shared
contracts. This document remains a future proposal, not a dependency for the playable game. References below to the
existing weapon schema describe the now-withdrawn draft. Build should revisit the idea only when the game needs it;
all prototype work follows the current test-first rule, not the superseded fuzzy exception.

Submitted by `art`, 2026-11-12, at the user's request. **Proposal for M2, not an implemented or frozen schema.**
The user clarified that code and schemas can evolve during development; weapon generation must never change code at
runtime. Build owns the shared zod schemas and renderer; AI owns generation/evals; art supplies visual fixtures and QA.

## Capability

Build one fixed renderer that composes bounded visual data. The AI describes a weapon's appearance in strict JSON;
the renderer interprets known shapes and effects. No per-weapon implementation, runtime code generation or image-model
call is needed during a match. The six [oddity concepts](concepts/prompt-built-oddities.md) are target fixtures.

An object can look like a duck, teapot or fax machine regardless of its firing behaviour. Keep appearance separate from
mechanics: shape cannot create gravity, extra pellets, penetration, damage, a larger hitbox or additional vision.
Named gameplay behaviours remain implemented rules. Schema-driven vision and stairs are the separate requirements
already recorded in `HANDOFF.md`; neither is a cosmetic shape property.

## Proposed appearance block

Add an optional, versioned `appearance` block to the weapon definition. Omission uses a built-in composition appropriate
to the weapon behaviour. Existing fixtures and saved weapons remain readable; explicit unknown fields are rejected,
not silently ignored. The eventual migration/version policy belongs to build when persistence is introduced.

| Part | Proposed contents |
| --- | --- |
| `version` | Literal `1`; reject unsupported versions |
| `body` | Ordered array of layered shape parts, used in held, pickup, reveal and library views |
| `projectile` | Small ordered shape array for projectile-like behaviours; beam rendering retains its own fixed line geometry |
| `impact` | Known preset (`spark`, `burst`, `ring`, `pop`) plus a palette accent; decorative only |
| `animation` | Known preset (`none`, `pulse`, `spin`, `recoil`), with bounded amount/speed; no expressions or keyframe programs |

Each shape part is a strict discriminated union: `circle`, `ellipse`, `rect`, `polygon`, or `polyline`. Each variant
accepts only its own geometry fields. Polygon/polyline points are bounded coordinate pairs, not SVG path strings.
Common fields are translation, rotation, fill/stroke roles, stroke width and opacity. Array order supplies draw order;
there is no recursive child graph, arbitrary shader, remote resource, custom font or event handler.

Use a 64 × 64 local design space, with forward along positive x and renderer-owned grip/muzzle anchors. Clip to the
allowed visual extent and validate transformed bounds, not just individual coordinates. Body composition stays within
that extent across every animation frame. Decorative barrels never move the authoritative firing origin.

Colours are roles such as `body`, `edge`, `accent`, `accent-secondary`, `text`, and `none` (transparent), resolved through
the approved palette. Propose a secondary accent token and yellow/pink weapon tokens so the duck and bubblegum concepts
need not be forced into a single tint. Art/build review those additions with the palette; they are not existing tokens.
Team stripes and fog masks are renderer-owned overlays, not AI-authored parts.

Illustrative body fragment for a duck-like weapon (appearance data only, **not a complete current-schema weapon**):

```json
{
  "version": 1,
  "body": [
    {"kind": "ellipse", "x": 26, "y": 34, "radiusX": 16, "radiusY": 11, "fill": "accent", "stroke": "edge", "strokeWidth": 2, "opacity": 1, "rotation": 0},
    {"kind": "circle", "x": 37, "y": 21, "radius": 10, "fill": "accent", "stroke": "edge", "strokeWidth": 2, "opacity": 1, "rotation": 0},
    {"kind": "polygon", "x": 0, "y": 0, "points": [[45, 20], [60, 25], [45, 30]], "fill": "accent-secondary", "stroke": "edge", "strokeWidth": 2, "opacity": 1, "rotation": 0},
    {"kind": "circle", "x": 40, "y": 18, "radius": 2, "fill": "body", "stroke": "none", "strokeWidth": 0, "opacity": 1, "rotation": 0}
  ]
}
```

## Initial budgets and fallbacks to validate

Proposed starting limits: 24 body parts, 8 projectile parts, 32 points per polygon/polyline, 384 points total per
appearance and 12 KiB serialized appearance JSON. All numbers must be finite and within configured bounds. Limit
opacity, stroke, animation rate and amplitude; prohibit flashes/strobes. These are starting budgets for a spike,
not silently accepted production caps. Check model output tokens and repair cost before adoption.

Compile/canonicalise validated appearance data once per weapon, cache by content hash and reuse across views and
projectiles. Do not construct meshes/materials or parse JSON per frame. Maintain a fixed global effect/particle budget
so many individually valid weapons cannot overload a match. Render density must remain readable at 32 px.

- Missing appearance: use the built-in composition. A legacy weapon should still play and look intentional.
- Invalid generated appearance: one bounded repair attempt under the existing pipeline repair policy. If repair fails,
  use a safe built-in visual where gameplay is valid and label the visual substitution at reveal; do not silently alter stats.
- Unsupported requested mechanics: explain the supported interpretation, or use the existing rejection path. A violet
  impact ring does not fulfil a promise to attract enemies.
- Keep the omission policy for **gameplay stats** separate; the user has not yet chosen fixed modest defaults versus
  AI-selected weaknesses. Do not use visual fallback as permission to penalise omitted stats.

## Work and acceptance criteria

- **Build / M2:** design the strict zod union and versioned block, shared limits and fixed anchors with AI/art review.
  Add schema-valid fixtures for all six oddities and negative fixtures for unknown kinds, extra fields, malformed points,
  excessive counts/bytes, invalid numbers and out-of-bounds transforms. Keep current weapons working without appearance.
- **Build / fuzzy frontend:** prove one generic renderer can draw six distinct top-down identities without per-weapon
  branches or name checks. Support held, pickup, reveal and library views from the same body definition. Log it in the
  fuzzy ledger and bring it into focus test-first in Phase B.
- **Build / tests:** verify schema failures, stable fallback, anchor consistency and the absence of gameplay/visibility
  changes when cosmetics change. Test the largest legal appearance under many simultaneous projectiles; measure frame
  cost, draw calls and memory before finalising the budgets. Reject unsupported versions and never execute strings.
- **AI / O2 and O4:** generate the new block as structured data, preserve recognisable requested identity and distinguish
  mechanics from cosmetics. Use the six prompts and omission/extreme/adversarial variants as eval inputs. Measure schema
  validity, prompt identity, tokens, latency and repair/fallback rates; no acceptance test calls a real model.
- **Art / M2–M3:** translate identity studies into top-down compositions using only the proposed grammar; review at 64 px
  and 32 px, with glow off and in grayscale. Extend the grammar through a reviewed contract if those fixtures expose a
  real expressiveness gap, rather than adding a special renderer for a named weapon.

No deployment, dependency change or runtime implementation is included in this submission.

Submission validation: the illustrative JSON parses and all owner TODO/handoff links resolve. `pnpm checks` passes
with installed Node 26.13.0: lint, formatting, typecheck and 131 tests (50 shared, 81 webapp). No model evals were run
for this documentation-only proposal.
