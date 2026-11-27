import type {Polygon} from "@gunsmith/engine/geometry/types/Polygon";

/**
 * What a cone shows in detail: everything inside `outline` but the `hidden` patches, which lie inside it and never overlap it or
 * each other, so a drawing that dims what is outside the outline and each patch dims nothing twice.
 */
export interface VisibleArea {
  outline: Polygon;
  hidden: readonly Polygon[];
}
