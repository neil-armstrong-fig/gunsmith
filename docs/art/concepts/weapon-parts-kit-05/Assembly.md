# Provisional assembly interpretation

This describes the delivered fixtures exactly. It is an art experiment for owner
review, not a frozen shared schema. All names and numbers live in `Parts.json`.

## Author data and model data

Each catalogue part has a local `attach` anchor at `(0,0)`, other named anchors,
a list of primitives and explicit allowed sizes, orientations and mirroring.
Local coordinates may be negative. The transformed drawing must fit the 64-space.
The vocabulary uses ellipses, closed polygons and open polylines; lines have round
caps/joins, opacity 1 and no rotation once expanded. No painted background creates
an apparent hole: open handles and brace gaps expose the surface beneath them.

A recipe has `version`, an example `id` and `name`, two palette selections and an
ordered `instances` list. Its IDs are references within the assembly, not weapon
name switches. Every instance supplies:

| Field | Meaning |
| --- | --- |
| `id`, `part` | Unique instance ID and existing catalogue part ID |
| `parent`, `anchor` | `frame`, or an earlier instance; target anchor on that parent |
| `ownAnchor` | Anchor on this part to align with the target |
| `size` | `small` = 0.8, `standard` = 1, `large` = 1.2; uniform scaling |
| `orientation` | Absolute canvas angle: 0, 90, 180 or -90 degrees, clockwise in screen coordinates |
| `mirror` | Reflect local y before rotating; useful for paired conduits |
| `colourRole` | Replacement for this part's `accent` fills: accent, secondary, body, edge, text or orange |

Palette choices are blue, orange, violet, mint, yellow or pink, assigned once to
`accent` and `secondary`. These are catalogue-local aliases of existing/proposed
weapon tokens; they do not add Tailwind tokens. Secondary fills and strokes remain
secondary; `colourRole` replaces only an `accent` fill. No arbitrary CSS, remote
resources or generated point arrays occur in recipes.

All fields are explicit in the fixtures; no omission/default policy is proposed
for untrusted model replies. Fine/structural membership is authored per primitive,
not an AI choice. Draw all at 64 px; remove only fine primitives at 32 px and in
these held previews. This is a preview threshold for measurement, not a runtime
LOD policy. Attachments do not move when a fine primitive is omitted.

## Deterministic expansion

1. Start with `frameAnchors` in the 64-space and the identity transform. The frame
   has no drawing. Process instances in order, drawing each part's primitives in
   catalogue order. This list also fixes back-to-front order.
2. Resolve the target anchor through its parent's full transform. Parent size and
   orientation affect that target's position; the child's orientation and size
   remain **absolute**, so they are not multiplied by the parent's choices.
3. Let `s` be size, `m` be -1 for mirror and 1 otherwise, and `t` the orientation.
   The child's linear transform is:

   ```text
   a = s cos(t)    c = -s sin(t) m
   b = s sin(t)    d =  s cos(t) m
   transformed(x,y) = (a x + c y + e, b x + d y + f)
   ```

   Choose `(e,f)` so the transformed `ownAnchor` equals the resolved target.
   Save this complete transform for subsequent anchor references. Angles above
   are degrees; convert to radians for sine/cosine.
4. Transform points and ellipse centres, multiply radii and strokes by `s`, swap
   ellipse radii for quarter turns, and round output coordinates to six decimals.
   All supported orientations preserve axis-aligned ellipses. Flatten transforms.
5. Resolve palette roles. Reject an unknown part, anchor, parent, parameter choice
   or duplicate instance ID, including a forward/cyclic reference. Validate all
   coordinates as finite and transformed stroke-inclusive bounds inside `[0,64]`.
   Polylines/polygons use point extrema plus half stroke; ellipses use radii plus
   half stroke. Round caps/joins prevent extra miter extents. No tolerance is used.

The catalogue's attachment anchors can lie off painted geometry; for example, the
spout's rising outlet is decorative. Anchor names denote connection semantics,
not a generated firing origin. The fixed provisional frame grip is `(12,32)` and
visual muzzle reference `(60,32)`. Assembly never changes those values.

Numeric check: the primary teapot body at frame centre has translation `(30,32)`.
Its rear anchor resolves to `(16,32)`; the standard handle attaches there, with
its leftmost stroke at x = 4.5. The small spout attaches to `(44,32)` and extends
to x = 58.2 including stroke. Both preserve the handle's open centre.

## Expansion boundary and budgets

The expanded assembly JSON has `recipe`, `palette` and `body`. It deliberately
retains this experiment's role aliases and omits redundant appearance fields.
Do not submit it directly to `validateAppearance` or the weapon validator.

To compare with AI's current primitive draft, the boundary must map palette names
to `weapon-*`, map `secondary` to `accent-secondary`, resolve the occasional orange
fill to an allowed role (the delivered orange collar uses `edge` internally, so
no orange primitive role remains), give polygons/polylines x/y = 0, and supply
opacity = 1, rotation = 0, empty projectile, neutral spark impact and no animation.
A concrete temporary adapter was used for the verification report; it is not a
new runtime dependency. Appearance and gameplay stay separate.

The catalogue's 18 definitions are different from an assembly's instance count,
expanded primitive count and response-token budget. Report them separately.
Do not infer a universal instance cap from these six prompts.

Held preview: player centre `(20,32)`, standing radius 18 or crouched radius 13;
translate weapon by `(21.2,11.2)` and scale by 0.65. This maps grip `(12,32)` to
hand `(29,32)`. Rotate the complete player/weapon group around the player centre.
Earlier studies used x translation 29, which mapped that grip to x = 36.8; those
historical sheets are retained. Build must reconcile the final hand and muzzle
geometry with the game rather than treating this correction as a physics change.
