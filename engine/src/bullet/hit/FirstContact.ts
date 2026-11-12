import type {Contact} from "@gunsmith/engine/bullet/types/Contact";
import type {Reach} from "@gunsmith/engine/bullet/types/Reach";

/**
 * What the bullet meets first on this step. A dummy or a fighter counts only if it is strictly nearer than the wall, so
 * a target touching the wall at the same distance is shielded by it. A dummy and a fighter at the same distance go to the
 * dummy. With nothing reached, the bullet flies on.
 */
export function firstContact(reach: Reach): Contact {
  const {wallDistance, dummyHit, fighterDistance} = reach;
  const dummyDistance = dummyHit?.distance ?? Infinity;
  const nearestTarget = Math.min(dummyDistance, fighterDistance ?? Infinity);

  if (nearestTarget < wallDistance) {
    if (dummyDistance <= (fighterDistance ?? Infinity)) {
      return "dummy";
    }

    return "fighter";
  }

  if (wallDistance !== Infinity) {
    return "wall";
  }

  return "none";
}
