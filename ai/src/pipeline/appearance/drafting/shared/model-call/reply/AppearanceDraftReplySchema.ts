import {z} from "zod";

const NUMBER = z.number().optional();

/**
 * One shape as the model is asked to fill it, deliberately flat and loose: every field optional and typed, no limits, extras
 * kept, for the reason `weaponDraftReplySchema` is (a bounded schema makes LangChain throw and hides the answer from the strict
 * check). A flat object and not a union per kind because a nine-billion-parameter model is steadier on one shape than five
 * (measured 2026-11-13, but it also writes every kind's fields on every shape; a per-kind schema is untried).
 */
const partReply = z.looseObject({
  kind: z.string().describe("circle, ellipse, rect, polygon or polyline"),
  x: NUMBER.describe("centre for circle and ellipse, upper-left for rect, 0 for polygon and polyline"),
  y: NUMBER,
  radius: NUMBER.describe("circle only"),
  radiusX: NUMBER.describe("ellipse only"),
  radiusY: NUMBER.describe("ellipse only"),
  width: NUMBER.describe("rect only"),
  height: NUMBER.describe("rect only"),
  points: z.array(z.array(z.number())).optional().describe("polygon and polyline only: [[x, y], ...]"),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: NUMBER,
  opacity: NUMBER,
  rotation: NUMBER,
  detail: z.string().optional(),
});

/** The whole appearance as the model is asked to fill it, loose like its parts. The strict `appearanceSchema` is applied afterwards, by code. */
export const appearanceDraftReplySchema = z.looseObject({
  version: NUMBER,
  palette: z.looseObject({accent: z.string().optional(), "accent-secondary": z.string().optional()}).optional(),
  body: z.array(partReply).describe("the shapes of the weapon, drawn back to front"),
  projectile: z.array(partReply).optional(),
  impact: z.looseObject({preset: z.string().optional(), colour: z.string().optional()}).optional(),
  animation: z.looseObject({preset: z.string().optional()}).optional(),
});
