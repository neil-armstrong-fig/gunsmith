import type {AppearancePart} from "@gunsmith/shared/appearance/schema/part/AppearancePart";

/** A part that is an ellipse. */
export type EllipsePart = Extract<AppearancePart, {kind: "ellipse"}>;
