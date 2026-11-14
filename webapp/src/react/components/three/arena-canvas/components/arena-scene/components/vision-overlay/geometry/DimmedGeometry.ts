import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {Path, Shape, ShapeGeometry, Vector2} from "three";

/** The triangles that cover the whole arena except `visible`, an outline the player sees in detail (none: all of it). */
export function dimmedGeometry(arena: Arena, visible: readonly Point[]): ShapeGeometry {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(arena.width, 0);
  shape.lineTo(arena.width, arena.height);
  shape.lineTo(0, arena.height);
  shape.closePath();

  if (visible.length >= 3) {
    shape.holes.push(new Path(visible.map(point => new Vector2(point.x, point.y))));
  }

  return new ShapeGeometry(shape);
}
