# Reference verification

Delivery: 2026-11-14. Original vector art; no new model run or dependency.

- 80 individual SVG examples cover all 36 named visual manifest keys/families,
  plus the unresolved stair family, stance comparison and A4/A7 checklist extras.
  All 13 audio key families link to the existing approved WAVs; all eight footfall
  variants are linked. No runtime keys were added.
- Five sheets rendered with installed Chromium 156.0.8078.4 and visually reviewed.
  SVG originals embed the same individual geometry in their preview cards.
  Sprites show 64/32 px and grayscale; icons show their design size. Held poses
  cover four rotations, both teams and both stances, around body centre `(27,32)`.
- Effects use equal-width four-cell PNG storyboards at 2×, with no timing contract.
  Brand/fog/ring and held-pose previews are also 2×; favicon exact-size exports are
  supplied separately. PNG dimensions checked against SVG dimensions.
- XML parsing, allowed elements, absence of scripts/events/external resources,
  view boxes, accessible labels, asset dimensions and all Markdown links checked.
- SHA-256 comparison confirms all pre-existing concept files, approved WAVs,
  measurements and compressed audio candidates are unchanged.
- Folder and reference review: each example has its own subject folder; category
  roots contain their two sheet entry points. README links every individual SVG.
  No runtime helpers/types, executable tooling or dependencies were added.

Final root `pnpm checks` exited 0: lint, formatting, strict typechecks and unit
tests passed (679 engine, 420 AI, 179 webapp, 254 audio; one slow audio render
skipped). The first run stopped on formatting in concurrently edited webapp
code; the later full run passed after that owner's changes. No other owner's
code was edited by art. Browser rendering and the successful gate ran outside
the sandbox because Chromium/local test servers require it. Runtime acceptance,
AI evals, full audio rendering and compressed-audio verification are not required
for this static reference delivery and were not run. Existing codec findings and
production approval remain open. Authoring/verification scripts were temporary;
shipped SVGs and Markdown are the editable sources.
