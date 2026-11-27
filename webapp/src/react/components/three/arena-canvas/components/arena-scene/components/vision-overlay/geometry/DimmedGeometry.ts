import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Polygon} from "@gunsmith/engine/geometry/types/Polygon";
import type {VisibleArea} from "@gunsmith/engine/vision/types/VisibleArea";
import {Path, Shape, ShapeGeometry, Vector2} from "three";

/**
 * The triangles that cover the whole arena except what the player sees in detail: everything outside the outline (none: all of
 * it), and each hidden patch inside it, which the engine keeps inside the outline and apart, so nothing is covered twice.
 */
export function dimmedGeometry(arena: Arena, visible: VisibleArea): ShapeGeometry {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(arena.width, 0);
  shape.lineTo(arena.width, arena.height);
  shape.lineTo(0, arena.height);
  shape.closePath();

  if (visible.outline.length >= 3) {
    shape.holes.push(new Path(cornersOf(visible.outline)));
  }

  return new ShapeGeometry([shape, ...visible.hidden.map(patch => new Shape(cornersOf(patch)))]);
}

function cornersOf(polygon: Polygon): Vector2[] {
  return polygon.map(point => new Vector2(point.x, point.y));
}
