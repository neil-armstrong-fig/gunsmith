/**
 * What the code fills in where an answer left a field out, one table so the choice is visible and tunable. Modest and neutral on
 * purpose: they complete a drawing, they never change what was drawn, and none of them is a gameplay stat. DRAFT: the numbers and
 * roles are mine, for `art` and `build` to change.
 */
export const APPEARANCE_DEFAULTS = {
  version: 1,
  palette: {accent: "weapon-blue", "accent-secondary": "weapon-orange"},
  impact: {preset: "spark", colour: "accent"},
  animation: {preset: "none"},
  /** For every part. A line (a polyline) has no fill by default, every other shape the body colour. */
  part: {stroke: "outline", strokeWidth: 2, opacity: 1, rotation: 0, detail: "structural"},
  filledShape: "body",
  line: "none",
  /** The origin a polygon or polyline's points are local to. */
  origin: 0,
} as const;
