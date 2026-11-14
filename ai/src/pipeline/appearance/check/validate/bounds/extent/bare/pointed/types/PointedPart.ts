import type {AppearancePart} from "@gunsmith/ai/pipeline/appearance/schema/part/AppearancePart";

/** A part made of straight edges: a rectangle, or a polygon or polyline listing its points. */
export type PointedPart = Extract<AppearancePart, {kind: "rect" | "polygon" | "polyline"}>;
