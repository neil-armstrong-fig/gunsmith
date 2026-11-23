import type {HidingPlace} from "@gunsmith/engine/cover/types/HidingPlace";
import {BufferGeometry, Float32BufferAttribute} from "three";

/** Two triangles for each place, flat on the floor, so one mesh draws them all. */
export function shadeGeometry(places: readonly HidingPlace[]): BufferGeometry {
  const positions = places.flatMap(({x, y, size}) => [
    ...[x, y, 0, x + size, y, 0, x + size, y + size, 0],
    ...[x, y, 0, x + size, y + size, 0, x, y + size, 0],
  ]);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));

  return geometry;
}
